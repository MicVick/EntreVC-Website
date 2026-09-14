import type { APIRequestContext } from '@playwright/test'

/**
 * Shared helpers for the end-to-end specs.
 *
 * Cleanup goes through the CMS REST API rather than the Payload local API on purpose:
 * opening a second Payload instance against the same SQLite file while the dev server
 * holds it is how you get lock contention and flaky teardown.
 */

export const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? 'admin@entrevc.local'
export const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? 'changeme-in-dev-only'

/** The draft event the seed script creates specifically so publishing can be tested. */
export const DRAFT_EVENT_SLUG = 'unannounced-speaker-session'

export async function loginToCms(request: APIRequestContext): Promise<string> {
  const response = await request.post('/api/cms/users/login', {
    data: { email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  })
  if (!response.ok()) {
    throw new Error(
      `Could not sign in as ${ADMIN_EMAIL}. Run "npm run seed:reset" first. (${response.status()})`,
    )
  }
  const body = await response.json()
  return body.token as string
}

function auth(token: string) {
  return { Authorization: `JWT ${token}` }
}

/** Remove a registration created by a test, so reruns do not hit DUPLICATE. */
export async function deleteRegistrationsByEmail(
  request: APIRequestContext,
  token: string,
  email: string,
): Promise<void> {
  const found = await request.get(
    `/api/cms/registrations?where[email][equals]=${encodeURIComponent(email)}&limit=50`,
    { headers: auth(token) },
  )
  if (!found.ok()) return

  const body = await found.json()
  for (const doc of body.docs ?? []) {
    await request.delete(`/api/cms/registrations/${doc.id}`, { headers: auth(token) })
  }
}

/**
 * Create a registration directly, for test setup.
 *
 * Deliberately NOT through POST /api/register: that endpoint is rate limited to 10/min
 * per IP, and a suite that sets itself up through it starts failing the moment it is run
 * twice in a minute. Setup should not be competing with the abuse controls it relies on
 * elsewhere.
 */
export async function createRegistration(
  request: APIRequestContext,
  token: string,
  args: { eventId: number; eventSlug: string; name: string; email: string },
): Promise<void> {
  const response = await request.post('/api/cms/registrations', {
    headers: auth(token),
    data: {
      event: args.eventId,
      eventSlug: args.eventSlug,
      name: args.name,
      email: args.email,
      attendeeType: 'student',
      status: 'confirmed',
      consentGiven: true,
      consentText: 'e2e fixture',
      emailStatus: 'sent',
    },
  })
  if (!response.ok()) {
    throw new Error(`Could not seed a registration (${response.status()}): ${await response.text()}`)
  }
}

export async function findEventBySlug(
  request: APIRequestContext,
  token: string,
  slug: string,
): Promise<{ id: number; _status?: string } | null> {
  const response = await request.get(
    `/api/cms/events?where[slug][equals]=${encodeURIComponent(slug)}&limit=1&depth=0&draft=true`,
    { headers: auth(token) },
  )
  if (!response.ok()) return null
  const body = await response.json()
  return body.docs?.[0] ?? null
}

/** Put an event back to draft, so the publish spec can run again from a clean state. */
export async function setEventStatus(
  request: APIRequestContext,
  token: string,
  id: number,
  status: 'draft' | 'published',
): Promise<void> {
  await request.patch(`/api/cms/events/${id}?draft=true`, {
    headers: auth(token),
    data: { _status: status },
  })
}
