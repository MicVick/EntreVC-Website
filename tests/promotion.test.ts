import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

// Mocked before the hook is ever reached. The hook imports this module dynamically to
// avoid a config cycle, which vi.mock still intercepts.
vi.mock('@/lib/email/send', () => ({
  queueEmail: vi.fn(),
  sendEmail: vi.fn(async () => 'sent'),
  isEmailConfigured: () => false,
}))

import { queueEmail } from '@/lib/email/send'
import { client } from '@/lib/content/payload'

/**
 * Waitlist promotion.
 *
 * Two properties, and the second is the one that bites. Sending the promotion email is
 * obvious and someone would notice if it broke. Sending it on the *wrong* transition is
 * silent: nobody finds out that cancelling a registration emailed the person "you're in"
 * until it has happened to a real attendee.
 */

const SLUG = 'test-promotion-event'
const CAPACITY = 2

const queued = vi.mocked(queueEmail)

async function cleanup() {
  const payload = await client()
  await payload.delete({
    collection: 'registrations',
    where: { eventSlug: { equals: SLUG } },
    overrideAccess: true,
  })
  await payload.delete({
    collection: 'events',
    where: { slug: { equals: SLUG } },
    overrideAccess: true,
  })
}

async function seed() {
  const payload = await client()
  await cleanup()

  const now = Date.now()
  const event = await payload.create({
    collection: 'events',
    data: {
      title: 'Promotion Test Event',
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

  const make = async (name: string, status: 'confirmed' | 'waitlisted', position: number | null) =>
    payload.create({
      collection: 'registrations',
      data: {
        event: Number(event.id),
        eventSlug: SLUG,
        name,
        email: `${name.toLowerCase()}@example.com`,
        attendeeType: 'student',
        status,
        waitlistPosition: position,
        consentGiven: true,
        consentText: 'test',
        emailStatus: 'sent',
      },
      overrideAccess: true,
    })

  await make('Alpha', 'confirmed', null)
  await make('Bravo', 'confirmed', null)
  const first = await make('Charlie', 'waitlisted', 1)
  const second = await make('Delta', 'waitlisted', 2)
  return { first, second }
}

let first: Awaited<ReturnType<typeof seed>>['first']
let second: Awaited<ReturnType<typeof seed>>['second']

beforeAll(async () => {
  const seeded = await seed()
  first = seeded.first
  second = seeded.second
})

afterAll(cleanup)

beforeEach(() => {
  queued.mockClear()
})

describe('promoting from the waitlist', () => {
  it('emails the promoted person, once, with the promotion template', async () => {
    const payload = await client()
    await payload.update({
      collection: 'registrations',
      id: first.id,
      data: { status: 'confirmed' },
      overrideAccess: true,
    })

    expect(queued).toHaveBeenCalledTimes(1)
    const message = queued.mock.calls[0]?.[0]
    expect(message?.to).toBe('charlie@example.com')
    // Not the plain confirmation — that would read as if they had a place all along.
    expect(message?.subject).toMatch(/place has opened up/i)
    expect(message?.text).toContain('Promotion Test Event')
  })

  it('clears the promoted position and moves everyone else up', async () => {
    const payload = await client()

    const promoted = await payload.findByID({
      collection: 'registrations',
      id: first.id,
      overrideAccess: true,
    })
    expect(promoted.status).toBe('confirmed')
    expect(promoted.waitlistPosition).toBeNull()

    // Delta was #2 behind Charlie; with Charlie promoted, Delta is genuinely next.
    const remaining = await payload.findByID({
      collection: 'registrations',
      id: second.id,
      overrideAccess: true,
    })
    expect(remaining.status).toBe('waitlisted')
    expect(remaining.waitlistPosition).toBe(1)
  })
})

describe('every other change sends nothing', () => {
  it('stays silent when an already-confirmed registration is edited', async () => {
    const payload = await client()
    await payload.update({
      collection: 'registrations',
      id: first.id,
      data: { attended: true },
      overrideAccess: true,
    })

    expect(queued).not.toHaveBeenCalled()
  })

  it('stays silent when a registration is cancelled', async () => {
    const payload = await client()
    await payload.update({
      collection: 'registrations',
      id: second.id,
      data: { status: 'cancelled' },
      overrideAccess: true,
    })

    expect(queued).not.toHaveBeenCalled()
  })

  it('stays silent when someone is newly created as confirmed', async () => {
    const payload = await client()
    const event = await payload.find({
      collection: 'events',
      where: { slug: { equals: SLUG } },
      limit: 1,
      overrideAccess: true,
    })

    await payload.create({
      collection: 'registrations',
      data: {
        event: Number(event.docs[0]?.id),
        eventSlug: SLUG,
        name: 'Echo',
        email: 'echo@example.com',
        attendeeType: 'student',
        status: 'confirmed',
        consentGiven: true,
        consentText: 'test',
        emailStatus: 'pending',
      },
      overrideAccess: true,
    })

    expect(queued).not.toHaveBeenCalled()
  })
})
