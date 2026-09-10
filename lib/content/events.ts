import 'server-only'

import { cache } from 'react'

import { eventFixtures } from '@/lib/fixtures'
import type { Event } from '@/lib/schemas'

/**
 * Event reads. Published content only.
 *
 * STATUS: signatures frozen at H1; bodies currently return fixtures. Agent A swaps
 * them to Payload's Local API in A1.2 without changing a single signature, so Agent
 * B never notices the switch (CONTRACT.md §2).
 *
 * Everything is wrapped in React `cache()` so a page rendering the same event in
 * three places reads it once per request.
 */

/** Recompute the derived time fields, so fixtures stay honest as the clock moves. */
function withComputed(event: Event): Event {
  const now = Date.now()
  const isPast = new Date(event.endDateTime).getTime() < now
  const deadlinePassed = event.registrationDeadline
    ? new Date(event.registrationDeadline).getTime() < now
    : false

  return {
    ...event,
    isPast,
    isRegistrationClosed: isPast || deadlinePassed || !event.registrationEnabled,
    hasRecap: isPast && event.recap !== null,
  }
}

const allEvents = (): Event[] => eventFixtures.map(withComputed)

const byStartAsc = (a: Event, b: Event) =>
  new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()

const byStartDesc = (a: Event, b: Event) => -byStartAsc(a, b)

/**
 * Upcoming events, soonest first.
 *
 * An event moves out of this list automatically once `endDateTime` passes — no admin
 * action, which is what stops the homepage advertising an event that happened last
 * week (PRD: "content goes stale" mitigation).
 */
export const getUpcomingEvents = cache(async (opts?: { limit?: number }): Promise<Event[]> => {
  const items = allEvents().filter((e) => !e.isPast).sort(byStartAsc)
  return opts?.limit ? items.slice(0, opts.limit) : items
})

/** Past events, most recent first. */
export const getPastEvents = cache(async (opts?: { limit?: number }): Promise<Event[]> => {
  const items = allEvents().filter((e) => e.isPast).sort(byStartDesc)
  return opts?.limit ? items.slice(0, opts.limit) : items
})

/** `null` when the slug does not exist or the event is not published — never throws. */
export const getEventBySlug = cache(async (slug: string): Promise<Event | null> => {
  const found = allEvents().find((e) => e.slug === slug)
  return found ?? null
})

/** For `generateStaticParams`. */
export const getAllEventSlugs = cache(async (): Promise<string[]> => {
  return allEvents().map((e) => e.slug)
})

/** Distinct event types across published events, for the filter chips. Sorted. */
export const getEventTypes = cache(async (): Promise<string[]> => {
  const types = new Set<string>()
  for (const e of allEvents()) if (e.eventType) types.add(e.eventType)
  return [...types].sort()
})
