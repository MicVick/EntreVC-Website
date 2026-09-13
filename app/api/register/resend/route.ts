import { NextResponse } from 'next/server'

import { getEventBySlug } from '@/lib/content'
import { client } from '@/lib/content/payload'
import { queueEmail } from '@/lib/email/send'
import { registrationConfirmation, waitlistConfirmation } from '@/lib/email/templates'
import { buildIcs } from '@/lib/ics'
import { summariseEvent } from '@/lib/registration'
import { checkLimit } from '@/lib/rate-limit'
import { readJson, respond, serverError } from '@/lib/api/respond'
import { actionFail, actionOk, resendInputSchema } from '@/lib/schemas'

/**
 * POST /api/register/resend — re-send a confirmation someone has lost.
 *
 * This endpoint hands the caller nothing. It cannot: it proves nothing about who is
 * asking, so every design choice here is about making it useless as a tool.
 *
 *   - It only ever emails an address that ALREADY has a registration, and only ever
 *     repeats that registration's own confirmation. There is no way to aim it at a
 *     stranger or to put chosen content in front of someone.
 *   - It answers identically whether or not the address is registered, so it cannot be
 *     used to test who signed up for what. That is why the success message on the form
 *     is hedged ("if that address is registered") rather than confident.
 *   - It carries the tightest rate limit in the app, because it is the only endpoint
 *     where a caller picks the recipient. See LIMITS.resend.
 */
export async function POST(request: Request) {
  const limit = checkLimit(request, 'resend')
  if (!limit.allowed) {
    return NextResponse.json(
      actionFail('RATE_LIMITED', 'Please wait a minute before asking for another copy.'),
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  const parsed = resendInputSchema.safeParse(await readJson(request))
  if (!parsed.success) {
    return respond(actionFail('INVALID', 'Please check the email address and try again.'))
  }

  const email = parsed.data.email.trim().toLowerCase()

  try {
    const event = await getEventBySlug(parsed.data.eventSlug)
    // Note the shape of every exit below: always `ok`, never a hint about what exists.
    if (!event) return respond(actionOk({ sent: true }))

    const payload = await client()
    const found = await payload.find({
      collection: 'registrations',
      where: {
        and: [
          { eventSlug: { equals: event.slug } },
          { email: { equals: email } },
          { status: { not_equals: 'cancelled' } },
        ],
      },
      limit: 1,
      overrideAccess: true,
    })

    const registration = found.docs[0]
    if (!registration) return respond(actionOk({ sent: true }))

    const summary = summariseEvent(event)
    const name = typeof registration.name === 'string' ? registration.name : 'there'

    if (registration.status === 'waitlisted') {
      queueEmail(
        waitlistConfirmation({
          to: email,
          name,
          event: summary,
          position:
            typeof registration.waitlistPosition === 'number' ? registration.waitlistPosition : 1,
        }),
      )
    } else {
      queueEmail(
        registrationConfirmation({ to: email, name, event: summary, icsContent: buildIcs(event) }),
      )
    }

    return respond(actionOk({ sent: true }))
  } catch (error) {
    console.error('[register/resend] Unexpected failure', error)
    return serverError('We could not send that just now. Please try again in a moment.')
  }
}
