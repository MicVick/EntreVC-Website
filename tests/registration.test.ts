import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { client } from '@/lib/content/payload'
import { registerForEvent } from '@/lib/registration'
import type { RegistrationInput } from '@/lib/schemas'

/**
 * The capacity boundary, under simulated concurrency.
 *
 * This is the test the PRD's highest-rated technical risk deserves: "Registration race
 * at capacity boundary oversells the venue — High impact." A read-then-write
 * implementation passes every sequential test and fails exactly here, which is why
 * this exists and why it fires requests in parallel rather than in a loop.
 */

const SLUG = 'test-capacity-event'
const CAPACITY = 10
const ATTEMPTS = 50

function input(n: number): RegistrationInput {
  return {
    eventSlug: SLUG,
    name: `Attendee ${n}`,
    email: `attendee${n}@example.com`,
    attendeeType: 'student',
    customAnswers: {},
    consentGiven: true,
  }
}

async function cleanup() {
  const payload = await client()
  await payload.delete({
    collection: 'registrations',
    where: { eventSlug: { equals: SLUG } },
    overrideAccess: true,
  })
  await payload.delete({ collection: 'events', where: { slug: { equals: SLUG } }, overrideAccess: true })
}

beforeAll(async () => {
  const payload = await client()
  await cleanup()

  const now = Date.now()
  await payload.create({
    collection: 'events',
    data: {
      title: 'Capacity Test Event',
      slug: SLUG,
      _status: 'published',
      startDateTime: new Date(now + 7 * 86_400_000).toISOString(),
      endDateTime: new Date(now + 7 * 86_400_000 + 7_200_000).toISOString(),
      format: 'in_person',
      venue: { name: 'Test Venue' },
      registrationEnabled: true,
      capacity: CAPACITY,
    },
    overrideAccess: true,
  })
})

afterAll(cleanup)

describe('capacity is never oversold', () => {
  it(`gives exactly ${CAPACITY} places to ${ATTEMPTS} simultaneous registrations`, async () => {
    // All fired at once, deliberately. A sequential loop would pass even against a
    // naive read-then-write implementation and would tell us nothing.
    const results = await Promise.all(Array.from({ length: ATTEMPTS }, (_, i) => registerForEvent(input(i))))

    const confirmed = results.filter((r) => r.ok && r.data.status === 'confirmed')
    const waitlisted = results.filter((r) => r.ok && r.data.status === 'waitlisted')
    const failed = results.filter((r) => !r.ok)

    expect(failed).toHaveLength(0)
    expect(confirmed).toHaveLength(CAPACITY)
    expect(waitlisted).toHaveLength(ATTEMPTS - CAPACITY)
  })

  it('matches what is actually in the database, not just what was returned', async () => {
    // The returned values could be right while the writes are wrong. Count the rows.
    const payload = await client()
    const [confirmed, waitlisted] = await Promise.all([
      payload.count({
        collection: 'registrations',
        where: { and: [{ eventSlug: { equals: SLUG } }, { status: { equals: 'confirmed' } }] },
        overrideAccess: true,
      }),
      payload.count({
        collection: 'registrations',
        where: { and: [{ eventSlug: { equals: SLUG } }, { status: { equals: 'waitlisted' } }] },
        overrideAccess: true,
      }),
    ])
    expect(confirmed.totalDocs).toBe(CAPACITY)
    expect(waitlisted.totalDocs).toBe(ATTEMPTS - CAPACITY)
  })

  it('numbers the waitlist from 1 with no duplicate positions', async () => {
    const payload = await client()
    const res = await payload.find({
      collection: 'registrations',
      where: { and: [{ eventSlug: { equals: SLUG } }, { status: { equals: 'waitlisted' } }] },
      limit: 100,
      overrideAccess: true,
    })
    const positions = res.docs.map((d) => d.waitlistPosition).sort((a, b) => (a ?? 0) - (b ?? 0))
    expect(positions).toEqual(Array.from({ length: ATTEMPTS - CAPACITY }, (_, i) => i + 1))
  })
})

describe('registration rules', () => {
  it('rejects a duplicate email for the same event', async () => {
    const result = await registerForEvent(input(0)) // attendee0 already registered above
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('DUPLICATE')
  })

  it('rejects two simultaneous submissions from the same address', async () => {
    // The duplicate check must be inside the lock, or both of these slip through.
    const [a, b] = await Promise.all([registerForEvent(input(999)), registerForEvent(input(999))])
    const codes = [a, b].map((r) => (r.ok ? 'ok' : r.code))
    expect(codes.filter((c) => c === 'ok')).toHaveLength(1)
    expect(codes.filter((c) => c === 'DUPLICATE')).toHaveLength(1)
  })

  it('refuses registration for an event that has ended', async () => {
    const result = await registerForEvent({ ...input(1), eventSlug: 'alumni-founders-panel' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('CLOSED')
  })

  it('refuses registration once the deadline has passed', async () => {
    const result = await registerForEvent({ ...input(2), eventSlug: 'founder-fireside-march' })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.code).toBe('CLOSED')
  })

  it('returns NOT_FOUND for an unknown event, and for a draft', async () => {
    expect((await registerForEvent({ ...input(3), eventSlug: 'no-such-event' })).ok).toBe(false)
    // A draft must be unreachable from the public write path, not merely hidden.
    const draft = await registerForEvent({ ...input(4), eventSlug: 'unannounced-speaker-session' })
    expect(draft.ok).toBe(false)
    if (!draft.ok) expect(draft.code).toBe('NOT_FOUND')
  })

  it('enforces the institute-email restriction only where it is set', async () => {
    // build-weekend-2026 is seeded with restrictToInstituteEmail: true.
    const outside = await registerForEvent({
      ...input(5),
      eventSlug: 'build-weekend-2026',
      email: 'someone@gmail.com',
      customAnswers: { field_0: 'I have a full team' },
    })
    expect(outside.ok).toBe(false)
    if (!outside.ok) {
      expect(outside.code).toBe('INVALID')
      expect(outside.fieldErrors?.email).toBeDefined()
    }
  })

  it('requires answers to required custom questions', async () => {
    const missing = await registerForEvent({
      ...input(6),
      eventSlug: 'build-weekend-2026',
      email: 'student6@iima.ac.in',
      customAnswers: {},
    })
    expect(missing.ok).toBe(false)
    if (!missing.ok) expect(missing.code).toBe('INVALID')
  })

  it('allows unlimited registrations on an uncapped event', async () => {
    const results = await Promise.all(
      Array.from({ length: 5 }, (_, i) =>
        registerForEvent({
          ...input(100 + i),
          eventSlug: 'term-sheets-decoded-online',
          email: `uncapped${i}@example.com`,
        }),
      ),
    )
    expect(results.every((r) => r.ok && r.data.status === 'confirmed')).toBe(true)

    const payload = await client()
    await payload.delete({
      collection: 'registrations',
      where: { eventSlug: { equals: 'term-sheets-decoded-online' } },
      overrideAccess: true,
    })
  })
})
