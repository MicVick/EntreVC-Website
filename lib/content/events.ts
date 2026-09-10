import 'server-only'

import { cache } from 'react'

import type { Event as PayloadEvent } from '@/payload-types'
import type { AgendaBlock, Event, EventFormat, RegistrationField, Speaker } from '@/lib/schemas'

import {
  bool,
  client,
  num,
  str,
  strList,
  toImageRef,
  toImageRefs,
  toIso,
  toIsoOrNull,
  toRichText,
  toRichTextOrNull,
} from './payload'

/**
 * Event reads. Published content only.
 *
 * Signatures were frozen at H1 (CONTRACT.md §4) while the bodies still returned
 * fixtures; this file now reads Payload. Nothing in Agent B's pages changed — that is
 * the whole point of the seam.
 */

type Row = Record<string, unknown>
type Unwrap<T> = T extends (infer U)[] ? U : never

function mapSpeaker(row: Unwrap<NonNullable<PayloadEvent['speakers']>>): Speaker {
  return {
    name: String(row.name ?? ''),
    title: str(row.title),
    org: str(row.org),
    photo: toImageRef(row.photo),
    bio: toRichTextOrNull(row.bio),
    linkedin: str(row.linkedin),
  }
}

function mapAgenda(row: Unwrap<NonNullable<PayloadEvent['agenda']>>): AgendaBlock {
  return {
    time: String(row.time ?? ''),
    title: String(row.title ?? ''),
    description: str(row.description),
    speakerNames: strList(row.speakerNames),
  }
}

function mapRegistrationField(
  row: Unwrap<NonNullable<PayloadEvent['registrationFields']>>,
  index: number,
): RegistrationField {
  return {
    // Stable per-event identifier for the answer key. Payload array rows carry an `id`;
    // the index is a fallback so an older row without one still works.
    id: typeof row.id === 'string' ? row.id : `field_${index}`,
    label: String(row.label ?? ''),
    type: (['text', 'textarea', 'select', 'checkbox'] as const).includes(row.type as never)
      ? (row.type as RegistrationField['type'])
      : 'text',
    required: bool(row.required),
    options: strList(row.options),
  }
}

function mapEvent(doc: PayloadEvent): Event {
  const now = Date.now()
  const startDateTime = toIso(doc.startDateTime)
  const endDateTime = toIso(doc.endDateTime, startDateTime)
  const registrationDeadline = toIsoOrNull(doc.registrationDeadline)
  const registrationEnabled = doc.registrationEnabled !== false

  const isPast = endDateTime ? new Date(endDateTime).getTime() < now : false
  const deadlinePassed = registrationDeadline
    ? new Date(registrationDeadline).getTime() < now
    : false

  const venueName = str(doc.venue?.name)

  const recapText = toRichTextOrNull(doc.recap?.text)
  const recapRecording = str(doc.recap?.recordingUrl)
  const recapGallery = toImageRefs(doc.recap?.gallery)
  const hasRecapContent = Boolean(recapText || recapRecording || recapGallery.length > 0)

  return {
    id: String(doc.id ?? ''),
    slug: String(doc.slug ?? ''),
    title: String(doc.title ?? ''),
    subtitle: str(doc.subtitle),
    description: toRichText(doc.description),

    startDateTime,
    endDateTime,

    // An online event has no venue at all — not an empty one. A group with only blank
    // fields would otherwise render as an empty location block.
    venue: venueName
      ? {
          name: venueName,
          address: str(doc.venue?.address),
          mapLink: str(doc.venue?.mapLink),
        }
      : null,
    format: (['in_person', 'online', 'hybrid'] as const).includes(doc.format as never)
      ? (doc.format as EventFormat)
      : 'in_person',
    eventType: str(doc.eventType),

    heroImage: toImageRef(doc.heroImage),

    speakers: (doc.speakers ?? []).map(mapSpeaker),
    agenda: (doc.agenda ?? []).map(mapAgenda),

    capacity: num(doc.capacity),
    registrationDeadline,
    registrationFields: (doc.registrationFields ?? []).slice(0, 3).map(mapRegistrationField),
    restrictToInstituteEmail: bool(doc.restrictToInstituteEmail),
    registrationEnabled,

    recap: hasRecapContent
      ? { text: recapText, recordingUrl: recapRecording, gallery: recapGallery }
      : null,

    featured: bool(doc.featured),
    updatedAt: toIso(doc.updatedAt, startDateTime),

    isPast,
    isRegistrationClosed: isPast || deadlinePassed || !registrationEnabled,
    hasRecap: isPast && hasRecapContent,
  }
}

/** Published-only, enforced by the query rather than by filtering after the fact. */
const publishedWhere = { _status: { equals: 'published' } }

export const getUpcomingEvents = cache(async (opts?: { limit?: number }): Promise<Event[]> => {
  const payload = await client()
  const now = new Date().toISOString()
  const res = await payload.find({
    collection: 'events',
    where: { and: [publishedWhere, { endDateTime: { greater_than_equal: now } }] },
    sort: 'startDateTime',
    limit: opts?.limit ?? 100,
    depth: 2, // resolve media and nested speaker photos
    overrideAccess: false,
  })
  return res.docs.map(mapEvent)
})

export const getPastEvents = cache(async (opts?: { limit?: number }): Promise<Event[]> => {
  const payload = await client()
  const now = new Date().toISOString()
  const res = await payload.find({
    collection: 'events',
    where: { and: [publishedWhere, { endDateTime: { less_than: now } }] },
    sort: '-startDateTime',
    limit: opts?.limit ?? 100,
    depth: 2,
    overrideAccess: false,
  })
  return res.docs.map(mapEvent)
})

export const getEventBySlug = cache(async (slug: string): Promise<Event | null> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'events',
    where: { and: [publishedWhere, { slug: { equals: slug } }] },
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  const doc = res.docs[0]
  return doc ? mapEvent(doc) : null
})

export const getAllEventSlugs = cache(async (): Promise<string[]> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'events',
    where: publishedWhere,
    limit: 1000,
    depth: 0,
    select: { slug: true },
    overrideAccess: false,
  })
  return res.docs.map((d) => d.slug ?? '').filter(Boolean)
})

export const getEventTypes = cache(async (): Promise<string[]> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'events',
    where: publishedWhere,
    limit: 1000,
    depth: 0,
    select: { eventType: true },
    overrideAccess: false,
  })
  const types = new Set<string>()
  for (const d of res.docs) {
    const t = str(d.eventType)
    if (t) types.add(t)
  }
  return [...types].sort()
})
