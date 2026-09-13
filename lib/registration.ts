import 'server-only'

import { client } from '@/lib/content/payload'
import { getEventBySlug } from '@/lib/content'
import { buildIcs, googleCalendarUrl } from '@/lib/ics'
import { queueEmail } from '@/lib/email/send'
import { registrationConfirmation, waitlistConfirmation, type EventSummary } from '@/lib/email/templates'
import {
  type ActionResult,
  type Event,
  type RegistrationInput,
  type RegistrationResult,
  actionFail,
  actionOk,
  eventFormatLabels,
} from '@/lib/schemas'
import { formatDateRangeInIST } from '@/lib/format'

/**
 * The registration write path — the highest-risk code in this project.
 *
 * The hazard is the capacity boundary. A WhatsApp blast produces a burst of near-
 * simultaneous registrations, and a naive read-then-write oversells the venue: two
 * requests both read "59 of 60 taken" and both insert. The PRD rates this High impact,
 * and the mitigation is that the count and the insert must not be separable.
 *
 * How that is guaranteed here:
 *
 *   1. A per-event in-process mutex serialises the check-and-insert. The app runs as a
 *      SINGLE Node process on one VM, so this is a complete solution for the actual
 *      deployment — concurrent requests queue rather than interleave.
 *   2. The count is re-read INSIDE the critical section, never passed in from the
 *      caller or from a page render.
 *
 * [ASSUMPTION] Single instance. If the app is ever run as multiple processes, the
 * mutex no longer spans them and this must move to a database transaction with
 * `SELECT ... FOR UPDATE` semantics. The concurrency test in tests/registration.test.ts
 * is what would catch a regression; it cannot catch a topology change, so this comment
 * is the tripwire.
 */

// ── A tiny per-key mutex ─────────────────────────────────────────────────────

const chains = new Map<string, Promise<unknown>>()

/** Runs `task` after every task previously queued for `key`, never in parallel. */
function withLock<T>(key: string, task: () => Promise<T>): Promise<T> {
  const previous = chains.get(key) ?? Promise.resolve()
  // Errors in an earlier task must not poison the chain for later ones.
  const next = previous.catch(() => undefined).then(task)
  chains.set(
    key,
    next.catch(() => undefined),
  )
  return next
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Exported so the resend route describes an event exactly as the first email did. */
export function summariseEvent(event: Event): EventSummary {
  return {
    slug: event.slug,
    title: event.title,
    whenLabel: formatDateRangeInIST(event.startDateTime, event.endDateTime),
    venueLabel: event.venue ? [event.venue.name, event.venue.address].filter(Boolean).join(', ') : null,
    formatLabel: eventFormatLabels[event.format],
    // Never shown publicly — only sent to someone who actually registered.
    onlineJoinUrl: null,
  }
}

/**
 * Validate answers against the questions this event actually asks.
 *
 * Custom questions are per-event, so their shape is only known at runtime and cannot
 * be part of the static schema.
 */
function validateCustomAnswers(
  event: Event,
  answers: Record<string, string | boolean>,
): Record<string, string[]> | null {
  const errors: Record<string, string[]> = {}

  for (const field of event.registrationFields) {
    const value = answers[field.id]
    const missing =
      value === undefined ||
      value === null ||
      (typeof value === 'string' && value.trim().length === 0) ||
      (field.type === 'checkbox' && value === false)

    if (field.required && missing) {
      errors[`customAnswers.${field.id}`] = ['This one is required']
      continue
    }
    if (field.type === 'select' && typeof value === 'string' && value && !field.options.includes(value)) {
      errors[`customAnswers.${field.id}`] = ['Please choose one of the listed options']
    }
  }

  return Object.keys(errors).length > 0 ? errors : null
}

const INSTITUTE_DOMAIN = '@iima.ac.in'

export const CONSENT_TEXT =
  'I agree to EntreVC storing the details above to manage my registration for this event.'

// ── The write path ───────────────────────────────────────────────────────────

export async function registerForEvent(
  input: RegistrationInput,
): Promise<ActionResult<RegistrationResult>> {
  const event = await getEventBySlug(input.eventSlug)
  if (!event) return actionFail('NOT_FOUND', 'We could not find that event.')

  // Closed is checked before anything is written, and re-checked inside the lock below
  // in case a deadline passes mid-burst.
  if (event.isRegistrationClosed) {
    return actionFail('CLOSED', 'Registrations for this event have closed.')
  }

  const email = input.email.trim().toLowerCase()

  if (event.restrictToInstituteEmail && !email.endsWith(INSTITUTE_DOMAIN)) {
    return actionFail('INVALID', 'This event is open to institute email addresses only.', {
      email: [`Please use your ${INSTITUTE_DOMAIN} address.`],
    })
  }

  const customErrors = validateCustomAnswers(event, input.customAnswers)
  if (customErrors) {
    return actionFail('INVALID', 'Please check the highlighted fields.', customErrors)
  }

  const payload = await client()

  return withLock(`event:${event.slug}`, async (): Promise<ActionResult<RegistrationResult>> => {
    // Re-checked inside the lock: a deadline can pass while requests are queued.
    if (new Date(event.endDateTime).getTime() < Date.now()) {
      return actionFail('CLOSED', 'Registrations for this event have closed.')
    }

    // Duplicate check, inside the lock so two simultaneous submissions from the same
    // address cannot both pass it.
    const duplicate = await payload.find({
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
    if (duplicate.docs.length > 0) {
      return actionFail('DUPLICATE', "You're already registered — check your inbox.")
    }

    // THE critical read. Counted here, inside the lock, never passed in.
    let status: 'confirmed' | 'waitlisted' = 'confirmed'
    let waitlistPosition: number | null = null

    if (event.capacity !== null) {
      const confirmed = await payload.count({
        collection: 'registrations',
        where: {
          and: [{ eventSlug: { equals: event.slug } }, { status: { equals: 'confirmed' } }],
        },
        overrideAccess: true,
      })

      if (confirmed.totalDocs >= event.capacity) {
        status = 'waitlisted'
        const waitlisted = await payload.count({
          collection: 'registrations',
          where: {
            and: [{ eventSlug: { equals: event.slug } }, { status: { equals: 'waitlisted' } }],
          },
          overrideAccess: true,
        })
        waitlistPosition = waitlisted.totalDocs + 1
      }
    }

    const created = await payload.create({
      collection: 'registrations',
      data: {
        event: Number(event.id),
        eventSlug: event.slug,
        name: input.name,
        email,
        phone: input.phone || null,
        batchOrOrganisation: input.batchOrOrganisation || null,
        attendeeType: input.attendeeType,
        customAnswers: input.customAnswers,
        status,
        waitlistPosition,
        consentGiven: true,
        consentText: CONSENT_TEXT,
        emailStatus: 'pending',
      },
      overrideAccess: true,
    })

    // Queued, never awaited: the endpoint must return in under 500ms and the
    // registration is already committed. A mail failure is recorded, not lost.
    const markStatus = async (outcome: 'sent' | 'failed') => {
      try {
        await payload.update({
          collection: 'registrations',
          id: created.id,
          data: { emailStatus: outcome },
          overrideAccess: true,
        })
      } catch (error) {
        console.error('[register] Could not record email status', error)
      }
    }

    const summary = summariseEvent(event)
    if (status === 'confirmed') {
      queueEmail(
        registrationConfirmation({
          to: email,
          name: input.name,
          event: summary,
          icsContent: buildIcs(event),
        }),
        markStatus,
      )
    } else {
      queueEmail(
        waitlistConfirmation({
          to: email,
          name: input.name,
          event: summary,
          position: waitlistPosition ?? 1,
        }),
        markStatus,
      )
    }

    return actionOk({
      registrationId: String(created.id),
      status,
      waitlistPosition,
      icsUrl: `/api/ics/${event.slug}`,
      addToCalendarUrl: googleCalendarUrl(event),
    })
  })
}
