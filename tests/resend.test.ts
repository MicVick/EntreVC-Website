import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { POST } from '@/app/api/register/resend/route'
import { client } from '@/lib/content/payload'
import { __resetRateLimits } from '@/lib/rate-limit'

/**
 * The resend endpoint's security properties.
 *
 * Resend is the only public endpoint where the caller chooses who receives an email, so
 * the two properties tested here are the ones holding it together:
 *
 *   1. It never reveals whether an address is registered. Every outcome — registered,
 *      not registered, no such event — must be indistinguishable to the caller.
 *   2. It is rate limited hard enough that it cannot be used to flood an inbox.
 *
 * Both are invisible in normal use, which is exactly why they need a test. A later
 * change that helpfully returns "no registration found" would break property 1 without
 * breaking a single user-facing behaviour.
 */

const SLUG = 'test-resend-event'
const REGISTERED = 'resend.tester@example.com'

function request(body: unknown): Request {
  return new Request('http://localhost/api/register/resend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

async function readResponse(response: Response) {
  return { status: response.status, body: await response.json() }
}

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

beforeAll(async () => {
  const payload = await client()
  await cleanup()

  const now = Date.now()
  const event = await payload.create({
    collection: 'events',
    data: {
      title: 'Resend Test Event',
      slug: SLUG,
      _status: 'published',
      startDateTime: new Date(now + 7 * 86_400_000).toISOString(),
      endDateTime: new Date(now + 7 * 86_400_000 + 7_200_000).toISOString(),
      format: 'in_person',
      venue: { name: 'Test Venue' },
      registrationEnabled: true,
      capacity: 50,
    },
    overrideAccess: true,
  })

  await payload.create({
    collection: 'registrations',
    data: {
      event: Number(event.id),
      eventSlug: SLUG,
      name: 'Resend Tester',
      email: REGISTERED,
      attendeeType: 'student',
      status: 'confirmed',
      consentGiven: true,
      consentText: 'test',
      emailStatus: 'sent',
    },
    overrideAccess: true,
  })
})

afterAll(cleanup)

// Counters are process-wide, so without this the limit test poisons the ones after it.
beforeEach(() => {
  __resetRateLimits()
})

describe('resend does not leak who is registered', () => {
  it('answers a registered address and an unregistered one identically', async () => {
    const registered = await readResponse(await POST(request({ eventSlug: SLUG, email: REGISTERED })))
    const unknown = await readResponse(
      await POST(request({ eventSlug: SLUG, email: 'nobody@example.com' })),
    )

    expect(registered.status).toBe(200)
    expect(registered).toEqual(unknown)
  })

  it('answers an unknown event the same way too', async () => {
    const known = await readResponse(await POST(request({ eventSlug: SLUG, email: REGISTERED })))
    const missing = await readResponse(
      await POST(request({ eventSlug: 'no-such-event', email: REGISTERED })),
    )

    expect(known).toEqual(missing)
  })
})

describe('resend cannot be used to flood an inbox', () => {
  it('refuses the third attempt inside the window', async () => {
    const body = { eventSlug: SLUG, email: REGISTERED }

    expect((await POST(request(body))).status).toBe(200)
    expect((await POST(request(body))).status).toBe(200)

    const blocked = await POST(request(body))
    expect(blocked.status).toBe(429)
    // The client needs to know how long to wait, not just that it failed.
    expect(blocked.headers.get('Retry-After')).toBeTruthy()
  })
})

describe('resend validates its input', () => {
  it('rejects a malformed email without touching the database', async () => {
    const { status, body } = await readResponse(
      await POST(request({ eventSlug: SLUG, email: 'not-an-email' })),
    )

    expect(status).toBe(400)
    expect(body).toMatchObject({ ok: false, code: 'INVALID' })
  })
})
