import { NextResponse } from 'next/server'

import { fieldErrorsFrom, honeypotTripped, readJson, respond, serverError } from '@/lib/api/respond'
import { client } from '@/lib/content/payload'
import { getSiteSettings } from '@/lib/content'
import { resolveContactRecipient } from '@/lib/contact-routing'
import { contactAcknowledgement, contactRouting } from '@/lib/email/templates'
import { queueEmail } from '@/lib/email/send'
import { checkLimit } from '@/lib/rate-limit'
import { actionFail, actionOk, submissionCategoryLabels, submissionInputSchema } from '@/lib/schemas'

/**
 * POST /api/contact — the contact form.
 *
 * The ordering here is the whole feature: PERSIST FIRST, then attempt email. PRD §7
 * requires that a submission survives an email failure, because "we never received
 * your message" is a far worse outcome than "the notification bounced". The stored
 * record carries `emailStatus` so a failure surfaces in the admin with a retry.
 *
 * Routing comes from the admin-editable category map in Site Settings, read at request
 * time — changing where sponsorship enquiries go must not require a deploy.
 */
export async function POST(request: Request) {
  const limit = checkLimit(request, 'contact')
  if (!limit.allowed) {
    return NextResponse.json(
      actionFail('RATE_LIMITED', 'Too many attempts. Please wait a minute and try again.'),
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  const raw = await readJson(request)

  // Checked BEFORE validation — see honeypotTripped. A bot gets a plausible success
  // and no database row.
  if (honeypotTripped(raw)) return respond(actionOk({ submissionId: 'ok' }))

  const parsed = submissionInputSchema.safeParse(raw)
  if (!parsed.success) {
    return respond(
      actionFail('INVALID', 'Please check the highlighted fields.', fieldErrorsFrom(parsed.error.issues)),
    )
  }
  const input = parsed.data

  try {
    const payload = await client()
    const settings = await getSiteSettings()

    const { recipient, source } = resolveContactRecipient({
      category: input.category,
      routing: settings.categoryRouting,
      fallbackEmail: process.env.CONTACT_FALLBACK_EMAIL,
      clubEmail: settings.clubEmail,
    })
    const categoryLabel = submissionCategoryLabels[input.category]

    // An enquiry that reaches no inbox is saved but invisible. Nothing here can fix that
    // at request time, so make it loud in the logs rather than silent.
    if (source === 'none') {
      console.error(
        `[contact] No recipient configured for "${input.category}". The submission is saved but nobody has been notified. Set a routing row in Site Settings.`,
      )
    }

    const submission = await payload.create({
      collection: 'submissions',
      data: {
        category: input.category,
        name: input.name,
        email: input.email.trim().toLowerCase(),
        batchOrOrganisation: input.batchOrOrganisation || null,
        message: input.message,
        routedTo: recipient,
        status: 'new',
        emailStatus: 'pending',
      },
      overrideAccess: true, // public create is allowed; this bypasses the user check only
    })

    // Both sends are queued, never awaited — the endpoint must return in <500ms, and
    // the submission is already safely on disk.
    const markStatus = async (outcome: 'sent' | 'failed') => {
      try {
        await payload.update({
          collection: 'submissions',
          id: submission.id,
          data: { emailStatus: outcome },
          overrideAccess: true,
        })
      } catch (error) {
        console.error('[contact] Could not record email status', error)
      }
    }

    if (recipient) {
      queueEmail(
        contactRouting({
          to: recipient,
          fromName: input.name,
          fromEmail: input.email,
          categoryLabel,
          batchOrOrganisation: input.batchOrOrganisation || null,
          message: input.message,
        }),
        markStatus,
      )
    }

    queueEmail(contactAcknowledgement({ to: input.email, name: input.name, categoryLabel }))

    return respond(actionOk({ submissionId: String(submission.id) }))
  } catch (error) {
    console.error('[contact] Submission failed', error)
    return serverError('We could not send your message right now. Please try again in a moment.')
  }
}
