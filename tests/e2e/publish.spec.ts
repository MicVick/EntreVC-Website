import { expect, test } from '@playwright/test'

import {
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  DRAFT_EVENT_SLUG,
  findEventBySlug,
  loginToCms,
  setEventStatus,
} from './helpers'

/**
 * A club member publishes an event from a phone.
 *
 * The PRD requires the admin to be usable at 390px for exactly three jobs, and this is
 * the first of them. It is not a hypothetical: the person who needs to put an event live
 * is often standing somewhere on campus, not sitting at a desk.
 *
 * The test also covers the thing most likely to break silently in this architecture.
 * Public pages are statically generated, so publishing only *appears* to work unless the
 * revalidation hooks fire — the admin says "Published", the editor believes it, and the
 * public page goes on 404ing. So the assertion is not that the button worked; it is that
 * the page a student would open now exists.
 */

test.use({ viewport: { width: 390, height: 844 } })

test.describe('publishing from a phone', () => {
  let eventId: number

  test.beforeAll(async ({ playwright, baseURL }) => {
    const request = await playwright.request.newContext({ baseURL })
    try {
      const token = await loginToCms(request)
      const event = await findEventBySlug(request, token, DRAFT_EVENT_SLUG)
      expect(event, `the seed must contain the draft event ${DRAFT_EVENT_SLUG}`).not.toBeNull()
      eventId = event!.id
      // Start from draft even if a previous run left it published.
      await setEventStatus(request, token, eventId, 'draft')
    } finally {
      await request.dispose()
    }
  })

  test.afterAll(async ({ playwright, baseURL }) => {
    const request = await playwright.request.newContext({ baseURL })
    try {
      const token = await loginToCms(request)
      await setEventStatus(request, token, eventId, 'draft')
    } finally {
      await request.dispose()
    }
  })

  test('a draft is invisible, then publishing makes it public', async ({ page }) => {
    // 1. The draft must not be readable by the public.
    //
    //    Note what is NOT asserted here: the status code. Next returns 200 for a
    //    not-found page on a STREAMED response and 404 otherwise (see
    //    node_modules/next/dist/docs .../file-conventions/not-found.md), and this route
    //    streams because of the group's loading.tsx. Asserting 404 would be asserting a
    //    framework implementation detail. What actually matters is that none of the
    //    draft reaches the page, and that search engines are told to ignore it.
    const before = await page.request.get(`/events/${DRAFT_EVENT_SLUG}`)
    const beforeBody = await before.text()
    expect(beforeBody, 'a draft must not leak its content').not.toContain('Unannounced Speaker Session')
    expect(beforeBody, 'a not-found page must not be indexable').toContain('content="noindex"')

    // Nor may it appear anywhere the public could find it.
    const listing = await (await page.request.get('/events')).text()
    expect(listing).not.toContain(DRAFT_EVENT_SLUG)
    const sitemap = await (await page.request.get('/sitemap.xml')).text()
    expect(sitemap).not.toContain(DRAFT_EVENT_SLUG)

    // 2. Sign in at phone width.
    await page.goto('/admin/login')
    await page.locator('#field-email').fill(ADMIN_EMAIL)
    await page.locator('#field-password').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: /log ?in/i }).click()
    await expect(page).toHaveURL(/\/admin(?!\/login)/)

    // 3. Open the draft and publish it.
    await page.goto(`/admin/collections/events/${eventId}`)

    const title = page.locator('#field-title')
    await expect(title).toBeVisible()
    // The editor must be able to read what they are about to publish.
    await expect(title).toHaveValue(/.+/)

    const publish = page.getByRole('button', { name: /^Publish changes$|^Publish$/ })
    await expect(publish, 'the publish control must be reachable at 390px').toBeVisible()
    await publish.click()

    // Payload confirms with a toast; wait for the document to settle rather than racing.
    await expect(page.getByText(/Updated successfully|successfully/i).first()).toBeVisible()

    // 4. The real assertion: the page a student would open now shows the event. Polled,
    //    because revalidation is asynchronous — the PRD allows up to 10 seconds.
    await expect
      .poll(async () => (await page.request.get(`/events/${DRAFT_EVENT_SLUG}`)).text(), {
        message: 'the published event should appear publicly within 10s',
        timeout: 10_000,
        intervals: [500, 1000, 1000, 2000, 2000],
      })
      .toContain('Unannounced Speaker Session')

    // And it is now indexable, where a moment ago it was not.
    const afterBody = await (await page.request.get(`/events/${DRAFT_EVENT_SLUG}`)).text()
    expect(afterBody).not.toContain('content="noindex"')
  })

  test('the three phone jobs are reachable at 390px', async ({ page }) => {
    await page.goto('/admin/login')
    await page.locator('#field-email').fill(ADMIN_EMAIL)
    await page.locator('#field-password').fill(ADMIN_PASSWORD)
    await page.getByRole('button', { name: /log ?in/i }).click()
    await expect(page).toHaveURL(/\/admin(?!\/login)/)

    // Job 2: check a registration count.
    await page.goto('/admin/collections/registrations')
    await expect(page.getByRole('link', { name: /Export everything/ })).toBeVisible()

    // Job 3: read a submission.
    await page.goto('/admin/collections/submissions')
    await expect(page.locator('.collection-list, .list-controls').first()).toBeVisible()

    // Nothing may force sideways scrolling on a phone.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow, 'the admin must not scroll horizontally at 390px').toBeLessThanOrEqual(1)
  })
})
