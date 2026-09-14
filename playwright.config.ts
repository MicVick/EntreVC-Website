import { defineConfig, devices } from '@playwright/test'

/**
 * End-to-end tests for the two journeys that decide whether this project worked.
 *
 * One is a student arriving cold on a phone from a WhatsApp link and registering; the
 * other is a club member publishing an event from a phone. Everything else in the build
 * exists to serve those two, and neither can be proven by a unit test — they are about
 * hydration, focus, navigation and the admin's own UI.
 *
 * Deliberately serial with one worker: Payload runs on a single SQLite file, and
 * parallel specs produce lock contention rather than speed. The same reason
 * `fileParallelism` is off in vitest.config.ts.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 90_000,
  expect: { timeout: 15_000 },

  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/events',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
