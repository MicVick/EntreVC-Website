import { NextResponse } from 'next/server'
import Papa from 'papaparse'
import type { Where } from 'payload'

import { client } from '@/lib/content/payload'
import { formatDateTimeInIST } from '@/lib/format'
import { attendeeTypeLabels, registrationStatuses, type AttendeeType } from '@/lib/schemas'

/**
 * GET /api/registrations/csv — the attendee list, as a spreadsheet.
 *
 * This is the feature that stops the team drifting back to Google Forms. A CMS they
 * cannot get a clean attendee list out of on the morning of an event is a CMS they will
 * abandon, so the export has to be at least as good as the one they left behind: every
 * question they asked, as its own column, in the order they asked it.
 *
 * **This endpoint returns personal data** — names, emails, phone numbers. Two things
 * keep that safe:
 *
 *   1. It authenticates through Payload's own session, the same cookie the admin uses.
 *   2. It queries with `overrideAccess: false` and the resolved user, so the collection's
 *      access rules decide what comes back. The export can never be more permissive than
 *      the admin panel, and if `personalDataAccess` is tightened later this follows
 *      automatically rather than silently continuing to serve everything.
 */

const MAX_ROWS = 10_000

type QuestionColumn = { label: string; idsBySlug: Map<string, string> }

function yesNo(value: unknown): string {
  return value === true ? 'Yes' : 'No'
}

function text(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return ''
}

/** Answers are stored keyed by field id; the CSV is keyed by the label a human wrote. */
function answerFor(customAnswers: unknown, fieldId: string | undefined): string {
  if (!fieldId || !customAnswers || typeof customAnswers !== 'object') return ''
  const value = (customAnswers as Record<string, unknown>)[fieldId]
  if (typeof value === 'boolean') return yesNo(value)
  return text(value)
}

export async function GET(request: Request) {
  const payload = await client()

  const { user } = await payload.auth({ headers: request.headers })
  if (!user) {
    return NextResponse.json(
      { error: 'Sign in to the admin panel to export registrations.' },
      { status: 401 },
    )
  }

  const url = new URL(request.url)
  const eventSlug = url.searchParams.get('event')?.trim() || null
  const statusParam = url.searchParams.get('status')?.trim() || null
  const status = registrationStatuses.find((s) => s === statusParam) ?? null

  const clauses: Where[] = []
  if (eventSlug) clauses.push({ eventSlug: { equals: eventSlug } })
  if (status) clauses.push({ status: { equals: status } })

  const registrations = await payload.find({
    collection: 'registrations',
    where: clauses.length ? { and: clauses } : {},
    sort: 'createdAt',
    limit: MAX_ROWS,
    depth: 0,
    // The collection's access rules, not ours. See the note above.
    overrideAccess: false,
    user,
  })

  // Look up the events represented in this export, for their titles and the questions
  // they asked. One query rather than a join per row.
  const slugs = [...new Set(registrations.docs.map((doc) => doc.eventSlug).filter(Boolean))]
  const events = slugs.length
    ? await payload.find({
        collection: 'events',
        where: { slug: { in: slugs } },
        limit: slugs.length,
        depth: 0,
        overrideAccess: true,
      })
    : { docs: [] as { slug?: string | null; title?: string | null; registrationFields?: unknown }[] }

  const titleBySlug = new Map<string, string>()
  // Column order follows the order the questions were asked, and a label shared by two
  // events is one column — the same question, asked twice.
  const questionColumns: QuestionColumn[] = []

  for (const event of events.docs) {
    const slug = typeof event.slug === 'string' ? event.slug : null
    if (!slug) continue
    titleBySlug.set(slug, typeof event.title === 'string' ? event.title : slug)

    const fields = Array.isArray(event.registrationFields) ? event.registrationFields : []
    for (const field of fields) {
      if (!field || typeof field !== 'object') continue
      const row = field as { id?: unknown; label?: unknown }
      const label = typeof row.label === 'string' ? row.label : null
      const id = typeof row.id === 'string' ? row.id : null
      if (!label || !id) continue

      const existing = questionColumns.find((column) => column.label === label)
      if (existing) existing.idsBySlug.set(slug, id)
      else questionColumns.push({ label, idsBySlug: new Map([[slug, id]]) })
    }
  }

  const rows = registrations.docs.map((doc) => {
    const slug = typeof doc.eventSlug === 'string' ? doc.eventSlug : ''
    const attendeeType = doc.attendeeType

    const base: Record<string, string> = {
      Name: text(doc.name),
      Email: text(doc.email),
      Phone: text(doc.phone),
      'Batch / organisation': text(doc.batchOrOrganisation),
      'Attendee type':
        typeof attendeeType === 'string' && attendeeType in attendeeTypeLabels
          ? attendeeTypeLabels[attendeeType as AttendeeType]
          : text(attendeeType),
      Event: titleBySlug.get(slug) ?? slug,
      'Event slug': slug,
      Status: text(doc.status),
      'Waitlist position': doc.waitlistPosition == null ? '' : String(doc.waitlistPosition),
      Attended: yesNo(doc.attended),
      // Both forms deliberately: the IST column is what a human reads, the UTC column is
      // what sorts correctly in a spreadsheet and survives being re-imported.
      'Registered at (IST)': doc.createdAt ? formatDateTimeInIST(String(doc.createdAt)) : '',
      'Registered at (UTC)': text(doc.createdAt),
      'Confirmation email': text(doc.emailStatus),
      'Consent given': yesNo(doc.consentGiven),
      'Consent wording': text(doc.consentText),
    }

    for (const column of questionColumns) {
      base[column.label] = answerFor(doc.customAnswers, column.idsBySlug.get(slug))
    }

    return base
  })

  const columns = [
    'Name',
    'Email',
    'Phone',
    'Batch / organisation',
    'Attendee type',
    'Event',
    'Event slug',
    'Status',
    'Waitlist position',
    'Attended',
    'Registered at (IST)',
    'Registered at (UTC)',
    'Confirmation email',
    'Consent given',
    'Consent wording',
    ...questionColumns.map((column) => column.label),
  ]

  const csv = Papa.unparse({ fields: columns, data: rows.map((row) => columns.map((c) => row[c] ?? '')) })

  const stamp = new Date().toISOString().slice(0, 10)
  const filename = `registrations-${eventSlug ?? 'all-events'}${status ? `-${status}` : ''}-${stamp}.csv`

  return new NextResponse(
    // The BOM is not decoration: without it Excel on Windows opens UTF-8 as Latin-1 and
    // mangles every name with an accent in it, which is most of the interesting ones.
    `﻿${csv}`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        // Personal data: never let a proxy or the browser keep a copy.
        'Cache-Control': 'no-store, private',
      },
    },
  )
}
