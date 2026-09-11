import 'server-only'

import { createEvent, type DateArray, type EventAttributes } from 'ics'

import type { Event } from '@/lib/schemas'

/**
 * Calendar file generation.
 *
 * Times are stored UTC and emitted UTC, with `startInputType: 'utc'` so the `ics`
 * package does not helpfully reinterpret them in the server's local timezone. Getting
 * this wrong shifts every event by five and a half hours for Indian attendees, and it
 * is the kind of bug nobody notices until someone turns up at the wrong time.
 */

function toUtcArray(iso: string): DateArray {
  const d = new Date(iso)
  return [
    d.getUTCFullYear(),
    d.getUTCMonth() + 1,
    d.getUTCDate(),
    d.getUTCHours(),
    d.getUTCMinutes(),
  ]
}

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}

/** Returns the .ics body, or null if the event has unusable dates. */
export function buildIcs(event: Event): string | null {
  if (!event.startDateTime || !event.endDateTime) return null

  const location =
    event.format === 'online'
      ? 'Online'
      : [event.venue?.name, event.venue?.address].filter(Boolean).join(', ') || 'IIM Ahmedabad'

  // Plaintext only — calendar clients render the description as raw text, so HTML
  // would show up as literal tags in the invite.
  const description = [
    event.description.plainText,
    '',
    `Details: ${siteUrl()}/events/${event.slug}`,
  ]
    .filter(Boolean)
    .join('\n')

  const attributes: EventAttributes = {
    title: event.title,
    start: toUtcArray(event.startDateTime),
    startInputType: 'utc',
    startOutputType: 'utc',
    end: toUtcArray(event.endDateTime),
    endInputType: 'utc',
    endOutputType: 'utc',
    location,
    description,
    url: `${siteUrl()}/events/${event.slug}`,
    organizer: { name: 'EntreVC, IIM Ahmedabad', email: process.env.SMTP_FROM || 'no-reply@entrevc.in' },
    productId: 'entrevc/ics',
    uid: `${event.slug}@entrevc`,
    status: 'CONFIRMED',
  }

  const { error, value } = createEvent(attributes)
  if (error || !value) {
    console.error('[ics] Could not build calendar file', error)
    return null
  }
  return value
}

/**
 * A Google Calendar "add event" URL.
 *
 * Offered alongside the .ics because a good share of students never open the
 * confirmation email — the inline success state links straight here.
 */
export function googleCalendarUrl(event: Event): string {
  const stamp = (iso: string) => new Date(iso).toISOString().replace(/[-:]|\.\d{3}/g, '')
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${stamp(event.startDateTime)}/${stamp(event.endDateTime)}`,
    details: `${event.description.plainText.slice(0, 400)}\n\n${siteUrl()}/events/${event.slug}`,
    location:
      event.format === 'online'
        ? 'Online'
        : [event.venue?.name, event.venue?.address].filter(Boolean).join(', '),
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}
