import type { BasePayload, CollectionAfterChangeHook, CollectionBeforeChangeHook } from 'payload'

/**
 * Waitlist promotion.
 *
 * The PRD assumes promotion is a human decision, not an automatic one: when somebody
 * drops out, a person decides who comes off the waitlist. So the trigger is simply
 * changing Status from Waitlisted to Confirmed — the same control an editor already
 * uses for everything else, sitting in the sidebar with a description that says what it
 * will do. `CLAUDE.md`: configure the CMS, do not build one. A bespoke "Promote" button
 * would be one fewer click and one more thing for next year's team to discover.
 *
 * Two consequences follow from that one change, and both happen here:
 *
 *   1. The person is emailed that they are in, with a calendar file — the same email
 *      they would have received had they got a place first time.
 *   2. Everyone still waiting moves up, so the positions in the admin stay truthful
 *      rather than drifting out of order after the first promotion.
 *
 * Imports of `lib/content` and `lib/email` are deliberately **dynamic**. This file is
 * reached from `payload.config.ts`, and `lib/content/payload.ts` imports that config
 * back — a static import would close the cycle at module-initialisation time. Importing
 * inside the hook body means nothing loads until the hook actually runs, by which point
 * the config is fully evaluated.
 */

type RegistrationDoc = {
  id: string | number
  eventSlug?: unknown
  email?: unknown
  name?: unknown
  status?: unknown
  waitlistPosition?: unknown
}

/**
 * Someone confirmed no longer holds a queue position, and leaving a stale number behind
 * makes the column mean two different things. Cleared in `beforeChange` so it lands in
 * the same write as the status, rather than as a second update that re-enters the hooks.
 */
export const clearWaitlistPositionOnConfirm: CollectionBeforeChangeHook = ({ data }) => {
  if (data?.status === 'confirmed' && data?.waitlistPosition != null) {
    return { ...data, waitlistPosition: null }
  }
  return data
}

/** Re-number the remaining waitlist by signup order, so #1 is genuinely next. */
async function renumberWaitlist(payload: BasePayload, eventSlug: string): Promise<void> {
  const waiting = await payload.find({
    collection: 'registrations',
    where: { and: [{ eventSlug: { equals: eventSlug } }, { status: { equals: 'waitlisted' } }] },
    sort: 'createdAt',
    limit: 1000,
    overrideAccess: true,
  })

  let position = 1
  for (const row of waiting.docs) {
    if (row.waitlistPosition !== position) {
      await payload.update({
        collection: 'registrations',
        id: row.id,
        data: { waitlistPosition: position },
        overrideAccess: true,
      })
    }
    position += 1
  }
}

export const sendPromotionEmail: CollectionAfterChangeHook = async ({
  doc,
  previousDoc,
  operation,
  req,
}) => {
  if (operation !== 'update') return doc

  const current = doc as RegistrationDoc
  const previous = previousDoc as RegistrationDoc | undefined

  // The one transition that matters. Every other status change — cancelling, correcting
  // a mistake, confirming someone who was already confirmed — must send nothing.
  if (previous?.status !== 'waitlisted' || current.status !== 'confirmed') return doc

  const eventSlug = typeof current.eventSlug === 'string' ? current.eventSlug : null
  const email = typeof current.email === 'string' ? current.email : null
  if (!eventSlug || !email) return doc

  try {
    const [{ getEventBySlug }, { queueEmail }, { waitlistPromotion }, { buildIcs }, { summariseEvent }] =
      await Promise.all([
        import('@/lib/content'),
        import('@/lib/email/send'),
        import('@/lib/email/templates'),
        import('@/lib/ics'),
        import('@/lib/registration'),
      ])

    const event = await getEventBySlug(eventSlug)
    if (event) {
      queueEmail(
        waitlistPromotion({
          to: email,
          name: typeof current.name === 'string' ? current.name : 'there',
          event: summariseEvent(event),
          icsContent: buildIcs(event),
        }),
        async (outcome) => {
          try {
            await req.payload.update({
              collection: 'registrations',
              id: current.id,
              data: { emailStatus: outcome },
              overrideAccess: true,
            })
          } catch (error) {
            console.error('[promotion] Could not record email status', error)
          }
        },
      )
    }

    await renumberWaitlist(req.payload, eventSlug)
  } catch (error) {
    // The promotion itself is already saved. A failure to email or re-number must not
    // roll that back or surface as a save error to the editor — they did the right
    // thing and it worked.
    console.error('[promotion] Promotion follow-up failed', error)
  }

  return doc
}
