import { NextResponse } from 'next/server'

import { fieldErrorsFrom, honeypotTripped, readJson, respond, serverError } from '@/lib/api/respond'
import { checkLimit } from '@/lib/rate-limit'
import { registerForEvent } from '@/lib/registration'
import { actionFail, registrationInputSchema } from '@/lib/schemas'

/**
 * POST /api/register — event registration.
 *
 * A thin shell. Everything that matters (the capacity lock, the duplicate check, the
 * queued confirmation email) lives in lib/registration.ts so it can be tested under
 * simulated concurrency without an HTTP server in the way.
 */
export async function POST(request: Request) {
  const limit = checkLimit(request, 'register')
  if (!limit.allowed) {
    return NextResponse.json(
      actionFail('RATE_LIMITED', 'Too many attempts. Please wait a minute and try again.'),
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    )
  }

  const raw = await readJson(request)

  // Checked BEFORE validation — see honeypotTripped. A bot gets a plausible-looking
  // success and no database row.
  if (honeypotTripped(raw)) {
    const slug = typeof (raw as { eventSlug?: unknown })?.eventSlug === 'string'
      ? (raw as { eventSlug: string }).eventSlug
      : ''
    return respond({
      ok: true,
      data: {
        registrationId: 'ok',
        status: 'confirmed' as const,
        waitlistPosition: null,
        icsUrl: `/api/ics/${slug}`,
        addToCalendarUrl: '',
      },
    })
  }

  const parsed = registrationInputSchema.safeParse(raw)
  if (!parsed.success) {
    return respond(
      actionFail('INVALID', 'Please check the highlighted fields.', fieldErrorsFrom(parsed.error.issues)),
    )
  }
  const input = parsed.data

  try {
    return respond(await registerForEvent(input))
  } catch (error) {
    console.error('[register] Unexpected failure', error)
    return serverError('We could not complete your registration. Please try again in a moment.')
  }
}
