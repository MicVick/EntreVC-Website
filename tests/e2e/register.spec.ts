import { devices, expect, test } from '@playwright/test'

import { createRegistration, deleteRegistrationsByEmail, findEventBySlug, loginToCms } from './helpers'

/**
 * A student registers from a shared link.
 *
 * This is the journey the whole project is measured on, and it is deliberately run at
 * phone size on a cold arrival — no warm cache, no prior navigation, straight onto the
 * event page the way somebody reaches it from a WhatsApp group.
 *
 * What it proves that a unit test cannot: that the statically generated page hydrates,
 * that the form expands in place without a navigation, that the live seat count arrives,
 * and that a real row reaches the database with a confirmation the user can see.
 */

test.use({ ...devices['Pixel 7'] })

const EVENT = 'build-weekend-2026'

test.describe('student registration', () => {
  const stamp = Date.now()
  const email = `e2e.register.${stamp}@iima.ac.in`
  // A separate address, registered up front through the API, so the duplicate case does
  // not silently depend on the test above having passed.
  const existingEmail = `e2e.existing.${stamp}@iima.ac.in`

  test.beforeAll(async ({ playwright, baseURL }) => {
    const request = await playwright.request.newContext({ baseURL })
    try {
      const token = await loginToCms(request)
      const event = await findEventBySlug(request, token, EVENT)
      expect(event, `the seed must contain ${EVENT}`).not.toBeNull()
      await createRegistration(request, token, {
        eventId: event!.id,
        eventSlug: EVENT,
        name: 'Already Registered',
        email: existingEmail,
      })
    } finally {
      await request.dispose()
    }
  })

  test.afterAll(async ({ playwright, baseURL }) => {
    const request = await playwright.request.newContext({ baseURL })
    try {
      const token = await loginToCms(request)
      await deleteRegistrationsByEmail(request, token, email)
      await deleteRegistrationsByEmail(request, token, existingEmail)
    } finally {
      await request.dispose()
    }
  })

  test('registers from a cold arrival on a phone', async ({ page }) => {
    await page.goto(`/events/${EVENT}`)

    // The page must be readable before anything is clicked — this is the content a
    // student decides on.
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Build Weekend')
    await expect(page.getByText(/Incubation Lab/).first()).toBeVisible()

    // The sticky bar is the only register control reachable without scrolling.
    const stickyCta = page.locator('a[href="#register"]')
    await expect(stickyCta).toBeVisible()
    await stickyCta.click()

    const panel = page.getByRole('region', { name: /Register for this event/ })
    await expect(panel).toBeVisible()

    // Live availability replaces whatever was baked into the static HTML.
    await expect(panel.getByRole('progressbar')).toBeVisible()

    await panel.getByRole('button', { name: /^Register$/ }).click()

    // Inline: the PATH must not change. The anchor adds a #register hash, which is the
    // sticky bar doing its job — what matters is that no navigation happened.
    expect(new URL(page.url()).pathname).toBe(`/events/${EVENT}`)

    await page.getByLabel('Full name').fill('E2E Student')
    await page.getByLabel('Email', { exact: true }).fill(email)
    await page.getByLabel(/Phone/).fill('9812345678')
    await page.getByLabel(/Batch or organisation/).fill('PGP 2025-27')
    await page.getByLabel('Do you already have a team?').selectOption('I am looking for a team')
    await page.getByLabel(/I agree to EntreVC storing/).check()

    await page.getByRole('button', { name: /Confirm my place/ }).click()

    // Scoped to the success panel: the venue also appears in the hero, and what matters
    // here is that the CONFIRMATION repeats it back — many people never open the email.
    const success = page.locator('section[aria-live="polite"]')
    await expect(success.getByRole('heading', { name: /You’re registered/ })).toBeVisible()
    await expect(success.getByText(/Incubation Lab/)).toBeVisible()
    await expect(success.getByText(/Oct|Sept?|Nov/)).toBeVisible()

    // The calendar file is the promise the success state makes; check it is real.
    const invite = page.getByRole('link', { name: /Download invite/ })
    await expect(invite).toBeVisible()
    const href = await invite.getAttribute('href')
    const ics = await page.request.get(href!)
    expect(ics.status()).toBe(200)
    expect(await ics.text()).toContain('BEGIN:VCALENDAR')
  })

  test('a second attempt with the same address is refused, with a way out', async ({ page }) => {
    await page.goto(`/events/${EVENT}`)
    await page.getByRole('button', { name: /^Register$/ }).click()

    await page.getByLabel('Full name').fill('E2E Student')
    await page.getByLabel('Email', { exact: true }).fill(existingEmail)
    await page.getByLabel('Do you already have a team?').selectOption('I have a full team')
    await page.getByLabel(/I agree to EntreVC storing/).check()
    await page.getByRole('button', { name: /Confirm my place/ }).click()

    await expect(page.getByRole('heading', { name: /already registered/ })).toBeVisible()
    await expect(page.getByRole('button', { name: /Send the confirmation again/ })).toBeVisible()
  })

  test('a closed event shows no way to register', async ({ page }) => {
    await page.goto('/events/founder-fireside-march')

    await expect(page.getByText(/Registrations have closed/)).toBeVisible()
    await expect(page.getByRole('button', { name: /Register|waitlist/ })).toHaveCount(0)
  })
})
