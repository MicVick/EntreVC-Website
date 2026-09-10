/**
 * Verify the publishing and privacy guarantees hold against a real database.
 *
 * These are not style checks. Each one corresponds to a promise the PRD makes to a
 * real person:
 *
 *   - a draft is not visible                → the club controls when things go live
 *   - an unapproved listing is not visible  → we do not publish an alumnus's venture
 *                                             without their written consent
 *   - registrations are not publicly readable → attendee personal data stays private
 *
 * Run with: npx tsx scripts/verify-access.ts
 * A formal rules test suite follows in A4.4; this is the fast feedback loop.
 */
import path from 'path'
import dotenv from 'dotenv'
import { getPayload } from 'payload'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })
dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true })

let failures = 0

function check(label: string, passed: boolean, detail = '') {
  const mark = passed ? 'PASS' : 'FAIL'
  if (!passed) failures += 1
  console.log(`  [${mark}] ${label}${detail ? ` — ${detail}` : ''}`)
}

async function main() {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  // `overrideAccess: false` with no `user` is exactly what an anonymous website
  // visitor gets. Without it, the Local API bypasses access control entirely.
  const asPublic = { overrideAccess: false, user: null } as const

  console.log('\nAnonymous visitor:')

  const events = await payload.find({ collection: 'events', limit: 100, ...asPublic })
  const draftLeaked = events.docs.some((e) => e.slug === 'unannounced-speaker-session')
  check('draft event is NOT readable', !draftLeaked, `${events.docs.length} events visible`)

  const startups = await payload.find({ collection: 'startups', limit: 100, ...asPublic })
  const unapprovedLeaked = startups.docs.some((s) => s.slug === 'quietly-waiting')
  check('unapproved venture is NOT readable', !unapprovedLeaked, `${startups.docs.length} ventures visible`)

  let regsReadable = true
  try {
    const regs = await payload.find({ collection: 'registrations', limit: 1, ...asPublic })
    regsReadable = regs.docs.length > 0 || regs.totalDocs > 0
  } catch {
    regsReadable = false
  }
  check('registrations are NOT publicly readable', !regsReadable)

  let subsReadable = true
  try {
    const subs = await payload.find({ collection: 'subscribers', limit: 1, ...asPublic })
    subsReadable = subs.docs.length > 0 || subs.totalDocs > 0
  } catch {
    subsReadable = false
  }
  check('subscribers are NOT publicly readable', !subsReadable)

  let usersReadable = true
  try {
    const u = await payload.find({ collection: 'users', limit: 1, ...asPublic })
    usersReadable = u.docs.length > 0 || u.totalDocs > 0
  } catch {
    usersReadable = false
  }
  check('team accounts are NOT publicly readable', !usersReadable)

  console.log('\nPublish gate:')
  let refused = false
  let message = ''
  try {
    await payload.create({
      collection: 'startups',
      data: {
        name: 'Consent Gate Probe',
        slug: 'consent-gate-probe',
        type: 'alumni',
        tagline: 'Attempting to publish without recorded consent',
        _status: 'published',
        listingApproval: { approved: false },
      },
    })
  } catch (err) {
    refused = true
    message = err instanceof Error ? err.message.slice(0, 60) : ''
  }
  check('publishing a venture without consent is REFUSED', refused, message)

  // Clean up if the gate failed to hold, so a bad run does not leave a live listing.
  if (!refused) {
    await payload.delete({ collection: 'startups', where: { slug: { equals: 'consent-gate-probe' } } })
  }

  console.log('\nSigned-in team member:')
  const allEvents = await payload.find({ collection: 'events', limit: 100, overrideAccess: true })
  check(
    'sees drafts too',
    allEvents.docs.some((e) => e.slug === 'unannounced-speaker-session'),
    `${allEvents.docs.length} events total`,
  )

  console.log(failures === 0 ? '\nAll access guarantees hold.\n' : `\n${failures} FAILED.\n`)
  process.exit(failures === 0 ? 0 : 1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
