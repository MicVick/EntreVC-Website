import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { GET } from '@/app/api/registrations/csv/route'
import { client } from '@/lib/content/payload'

/**
 * The registrations export.
 *
 * This endpoint hands out names, email addresses and phone numbers in bulk, so the
 * first test here is the one that matters most: an unauthenticated caller gets nothing.
 * It is also the easiest property to lose — a refactor that moves the auth check below
 * the query, or an `overrideAccess: true` added while debugging, would leave every
 * attendee list on the public internet with no visible symptom.
 *
 * The second property is the reason the feature exists at all: every custom question
 * becomes its own column. Without that the team goes back to Google Forms.
 */

const SLUG = 'test-export-event'
const USER_EMAIL = 'export.tester@entrevc.local'
const USER_PASSWORD = 'export-tester-password'

let token = ''

function csvRequest(query = '', cookie?: string): Request {
  return new Request(`http://localhost/api/registrations/csv${query}`, {
    headers: cookie ? { Cookie: cookie } : {},
  })
}

async function cleanup() {
  const payload = await client()
  await payload.delete({
    collection: 'registrations',
    where: { eventSlug: { equals: SLUG } },
    overrideAccess: true,
  })
  await payload.delete({ collection: 'events', where: { slug: { equals: SLUG } }, overrideAccess: true })
  await payload.delete({ collection: 'users', where: { email: { equals: USER_EMAIL } }, overrideAccess: true })
}

beforeAll(async () => {
  const payload = await client()
  await cleanup()

  const now = Date.now()
  const event = await payload.create({
    collection: 'events',
    data: {
      title: 'Export Test Event',
      slug: SLUG,
      _status: 'published',
      startDateTime: new Date(now + 7 * 86_400_000).toISOString(),
      endDateTime: new Date(now + 7 * 86_400_000 + 7_200_000).toISOString(),
      format: 'in_person',
      venue: { name: 'Test Venue' },
      registrationEnabled: true,
      registrationFields: [
        { label: 'Dietary requirements', type: 'text', required: false },
        { label: 'Bringing a laptop', type: 'checkbox', required: false },
      ],
    },
    overrideAccess: true,
  })

  const fields = event.registrationFields ?? []
  const dietaryId = String(fields[0]?.id ?? '')
  const laptopId = String(fields[1]?.id ?? '')

  await payload.create({
    collection: 'registrations',
    data: {
      event: Number(event.id),
      eventSlug: SLUG,
      // A comma and an accent, because both break a naive CSV writer.
      name: 'Ngô Thanh, Jr',
      email: 'confirmed@example.com',
      attendeeType: 'student',
      status: 'confirmed',
      customAnswers: { [dietaryId]: 'Vegetarian, no nuts', [laptopId]: true },
      consentGiven: true,
      consentText: 'test',
      emailStatus: 'sent',
    },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'registrations',
    data: {
      event: Number(event.id),
      eventSlug: SLUG,
      name: 'Waiting Person',
      email: 'waiting@example.com',
      attendeeType: 'alumni',
      status: 'waitlisted',
      waitlistPosition: 1,
      customAnswers: { [dietaryId]: '', [laptopId]: false },
      consentGiven: true,
      consentText: 'test',
      emailStatus: 'sent',
    },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'users',
    data: { email: USER_EMAIL, password: USER_PASSWORD, name: 'Export Tester', role: 'editor', active: true },
    overrideAccess: true,
  })

  const login = await payload.login({
    collection: 'users',
    data: { email: USER_EMAIL, password: USER_PASSWORD },
  })
  token = login.token ?? ''
})

afterAll(cleanup)

describe('the export refuses anonymous callers', () => {
  it('returns 401 and no data without a session', async () => {
    const response = await GET(csvRequest())

    expect(response.status).toBe(401)
    const body = await response.text()
    // Not merely the wrong status — no attendee data in the body either.
    expect(body).not.toContain('confirmed@example.com')
  })

  it('returns 401 for a bogus token rather than falling back to open access', async () => {
    const response = await GET(csvRequest('', 'payload-token=not-a-real-token'))

    expect(response.status).toBe(401)
  })
})

describe('the export is usable as a spreadsheet', () => {
  it('gives every custom question its own column', async () => {
    const response = await GET(csvRequest(`?event=${SLUG}`, `payload-token=${token}`))
    expect(response.status).toBe(200)

    const csv = await response.text()
    const header = csv.split('\n')[0] ?? ''

    expect(header).toContain('Dietary requirements')
    expect(header).toContain('Bringing a laptop')
    expect(csv).toContain('Vegetarian, no nuts')
    // Checkboxes read as words, not as `true`/`false`.
    expect(csv).toMatch(/Yes/)
  })

  it('quotes values containing commas so columns do not shift', async () => {
    const response = await GET(csvRequest(`?event=${SLUG}`, `payload-token=${token}`))
    const csv = await response.text()

    expect(csv).toContain('"Ngô Thanh, Jr"')
    expect(csv).toContain('"Vegetarian, no nuts"')
  })

  it('opens correctly in Excel', async () => {
    const response = await GET(csvRequest(`?event=${SLUG}`, `payload-token=${token}`))

    // Read the raw bytes, not `text()`: decoding a Response strips a leading BOM by
    // spec, so `text()` cannot tell a file that has one from a file that does not.
    // Without the BOM Excel on Windows reads UTF-8 as Latin-1 and mangles exactly the
    // names it is most embarrassing to mangle.
    const bytes = new Uint8Array(await response.arrayBuffer())
    expect([bytes[0], bytes[1], bytes[2]]).toEqual([0xef, 0xbb, 0xbf])
    expect(response.headers.get('Content-Type')).toContain('text/csv')
    expect(response.headers.get('Content-Disposition')).toContain('attachment')
    // Personal data must not sit in a shared cache.
    expect(response.headers.get('Cache-Control')).toContain('no-store')
  })

  it('filters by status', async () => {
    const response = await GET(csvRequest(`?event=${SLUG}&status=confirmed`, `payload-token=${token}`))
    const csv = await response.text()

    expect(csv).toContain('confirmed@example.com')
    expect(csv).not.toContain('waiting@example.com')
  })

  it('ignores a status value that is not a real status', async () => {
    const response = await GET(csvRequest(`?event=${SLUG}&status=; DROP TABLE`, `payload-token=${token}`))

    expect(response.status).toBe(200)
    const csv = await response.text()
    // Unrecognised filter is dropped, not passed through to the query.
    expect(csv).toContain('confirmed@example.com')
    expect(csv).toContain('waiting@example.com')
  })
})
