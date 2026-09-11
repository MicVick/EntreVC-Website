import { NextResponse } from 'next/server'

import { fieldErrorsFrom, honeypotTripped, readJson, respond, serverError } from '@/lib/api/respond'
import { client } from '@/lib/content/payload'
import { checkLimit } from '@/lib/rate-limit'
import { actionFail, actionOk, subscribeInputSchema } from '@/lib/schemas'

/** The wording the subscriber agreed to, stored verbatim on their record. */
const CONSENT_TEXT =
  'I agree to receive occasional emails from the EntreVC club at IIM Ahmedabad, and understand I can unsubscribe at any time.'

/**
 * POST /api/subscribe — mailing-list signup.
 *
 * Returns 409 for an address already on the list, which is what Agent B's newsletter
 * component branches on to show "you're already on the list" rather than an error.
 *
 * Someone who previously unsubscribed and signs up again is REACTIVATED rather than
 * rejected — they are asking to come back, and a stale `active: false` should not
 * silently swallow that. But we never resurrect them without an explicit new signup.
 *
 * Double opt-in is deferred to Phase 2 (PRD). A single opt-in with the consent wording
 * and timestamp on the record is what stands in the meantime.
 */
export async function POST(request: Request) {
  const limit = checkLimit(request, 'subscribe')
  if (!limit.allowed) {
    return NextResponse.json(
      actionFail('RATE_LIMITED', 'Too many attempts. Please wait a minute and try again.'),
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  const raw = await readJson(request)

  // Checked BEFORE validation: the schema would otherwise reject the bot with a 400
  // that names the honeypot field.
  if (honeypotTripped(raw)) return respond(actionOk({ status: 'subscribed' as const }))

  const parsed = subscribeInputSchema.safeParse(raw)
  if (!parsed.success) {
    return respond(
      actionFail('INVALID', 'Please check your email address.', fieldErrorsFrom(parsed.error.issues)),
    )
  }
  const input = parsed.data
  const email = input.email.trim().toLowerCase()

  try {
    const payload = await client()

    const existing = await payload.find({
      collection: 'subscribers',
      where: { email: { equals: email } },
      limit: 1,
      overrideAccess: true,
    })

    const found = existing.docs[0]
    if (found) {
      if (found.active) {
        return respond(actionFail('DUPLICATE', "You're already on the list — no need to sign up again."))
      }
      // Previously unsubscribed, now asking to rejoin.
      await payload.update({
        collection: 'subscribers',
        id: found.id,
        data: { active: true, source: input.source, consentGiven: true, consentText: CONSENT_TEXT },
        overrideAccess: true,
      })
      return respond(actionOk({ status: 'subscribed' as const }))
    }

    await payload.create({
      collection: 'subscribers',
      data: {
        email,
        source: input.source,
        active: true,
        consentGiven: true,
        consentText: CONSENT_TEXT,
      },
      overrideAccess: true,
    })

    return respond(actionOk({ status: 'subscribed' as const }))
  } catch (error) {
    // A unique-constraint violation means two requests raced for the same address.
    // That is a duplicate, not a server error — report it as such.
    const message = error instanceof Error ? error.message.toLowerCase() : ''
    if (message.includes('unique') || message.includes('constraint')) {
      return respond(actionFail('DUPLICATE', "You're already on the list — no need to sign up again."))
    }
    console.error('[subscribe] Failed', error)
    return serverError('We could not add you right now. Please try again in a moment.')
  }
}
