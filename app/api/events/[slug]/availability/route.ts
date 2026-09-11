import { NextResponse } from 'next/server'

import { getEventBySlug } from '@/lib/content'
import { client } from '@/lib/content/payload'
import type { Availability } from '@/lib/schemas'

/**
 * GET /api/events/[slug]/availability — live capacity for a statically-generated page.
 *
 * The event page is pre-rendered, so the seat count baked into the HTML goes stale the
 * moment someone registers. This endpoint is what lets the page show a current figure
 * without giving up static generation.
 *
 * It is ADVISORY. POST /api/register re-counts under a lock and is the only authority
 * on whether a place exists — this number can be out of date by the time a form is
 * submitted, and that is fine and expected.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<'/api/events/[slug]/availability'>,
) {
  // Next 16: params is a Promise. The synchronous form was removed.
  const { slug } = await params

  const event = await getEventBySlug(slug)
  if (!event) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (event.capacity === null) {
    const uncapped: Availability = {
      capacity: null,
      registered: 0,
      waitlisted: 0,
      isFull: false,
      isClosed: event.isRegistrationClosed,
    }
    return NextResponse.json(uncapped, {
      headers: { 'Cache-Control': 'public, max-age=15, stale-while-revalidate=60' },
    })
  }

  const payload = await client()
  const [confirmed, waitlisted] = await Promise.all([
    payload.count({
      collection: 'registrations',
      where: { and: [{ eventSlug: { equals: slug } }, { status: { equals: 'confirmed' } }] },
      overrideAccess: true,
    }),
    payload.count({
      collection: 'registrations',
      where: { and: [{ eventSlug: { equals: slug } }, { status: { equals: 'waitlisted' } }] },
      overrideAccess: true,
    }),
  ])

  const body: Availability = {
    capacity: event.capacity,
    registered: confirmed.totalDocs,
    waitlisted: waitlisted.totalDocs,
    isFull: confirmed.totalDocs >= event.capacity,
    isClosed: event.isRegistrationClosed,
  }

  return NextResponse.json(body, {
    // A short cache absorbs the thundering herd right after a WhatsApp blast, when
    // hundreds of people open the same page within a minute, without making the number
    // meaningfully stale.
    headers: { 'Cache-Control': 'public, max-age=15, stale-while-revalidate=60' },
  })
}
