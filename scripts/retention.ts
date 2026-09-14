import 'dotenv/config'
import dotenv from 'dotenv'
import fs from 'node:fs'
import path from 'node:path'
import Papa from 'papaparse'

dotenv.config({ path: '.env.local', override: true })

/**
 * Retention and data hygiene (PRD §7).
 *
 * Three jobs, one script, run once a year at handover:
 *
 *   1. Report what personal data is old enough to remove.
 *   2. Export it, then delete it — in that order, never the other way round.
 *   3. Audit for personal data stored without the consent that permits it.
 *
 * Two deliberate choices about how it behaves:
 *
 * **It does nothing without `--confirm`.** The default is a dry run that prints what
 * would happen. Nobody should be able to destroy an attendee archive by pressing up-arrow
 * and Enter in a terminal.
 *
 * **It is a script, not a cron job.** The PRD asks for retention, but a scheduled task
 * that silently deletes club history is worse than the problem it solves — the year an
 * archive is wanted for a funding application is the year it should not have vanished on
 * a timer. This runs when a human decides it should, and the annual checklist says when.
 *
 * Usage:
 *   npm run retention                 # report only — safe
 *   npm run retention -- --confirm    # export, then delete
 *   npm run retention -- --years 3    # keep three academic years instead of two
 */

const args = process.argv.slice(2)
const confirmed = args.includes('--confirm')
const yearsIndex = args.indexOf('--years')
const KEEP_YEARS = yearsIndex >= 0 ? Number(args[yearsIndex + 1]) : 2

/**
 * An academic year at IIMA starts in June, so "two academic years" counted from
 * calendar-January would cut the current intake's own history mid-course.
 */
const ACADEMIC_YEAR_START_MONTH = 5 // June, zero-indexed

function cutoffDate(now = new Date()): Date {
  const startYear = now.getMonth() >= ACADEMIC_YEAR_START_MONTH ? now.getFullYear() : now.getFullYear() - 1
  return new Date(Date.UTC(startYear - KEEP_YEARS, ACADEMIC_YEAR_START_MONTH, 1))
}

function outputDir(): string {
  const dir = path.resolve(process.cwd(), 'exports')
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  return dir
}

function writeCsv(name: string, rows: Record<string, unknown>[]): string | null {
  if (rows.length === 0) return null
  const file = path.join(outputDir(), `${name}-${new Date().toISOString().slice(0, 10)}.csv`)
  fs.writeFileSync(file, `﻿${Papa.unparse(rows)}`, 'utf8')
  return file
}

async function main() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  const cutoff = cutoffDate()
  console.log(`\nRetention report — ${new Date().toISOString().slice(0, 10)}`)
  console.log(`Keeping ${KEEP_YEARS} academic years. Anything created before ${cutoff.toISOString().slice(0, 10)} is eligible for removal.`)
  console.log(confirmed ? 'Mode: CONFIRM — data will be exported and then deleted.\n' : 'Mode: dry run — nothing will be changed. Pass --confirm to act.\n')

  // ── 1. Registrations and submissions past retention ───────────────────────
  const targets = [
    { collection: 'registrations' as const, label: 'Registrations' },
    { collection: 'submissions' as const, label: 'Contact submissions' },
  ]

  for (const { collection, label } of targets) {
    const found = await payload.find({
      collection,
      where: { createdAt: { less_than: cutoff.toISOString() } },
      limit: 10_000,
      depth: 0,
      overrideAccess: true,
    })

    console.log(`${label}: ${found.totalDocs} record(s) past retention.`)
    if (found.totalDocs === 0) continue

    // Export ALWAYS happens before any delete, and the delete only runs if the export
    // actually landed on disk.
    const file = writeCsv(collection, found.docs as unknown as Record<string, unknown>[])
    if (file) console.log(`  exported → ${path.relative(process.cwd(), file)}`)

    if (!confirmed) {
      console.log('  (dry run — not deleted)')
      continue
    }
    if (!file) {
      console.log('  SKIPPED: export produced no file, so nothing was deleted.')
      continue
    }

    await payload.delete({
      collection,
      where: { createdAt: { less_than: cutoff.toISOString() } },
      overrideAccess: true,
    })
    console.log(`  deleted ${found.totalDocs} record(s).`)
  }

  // ── 2. Consent audit ──────────────────────────────────────────────────────
  // The public site strips a founder's LinkedIn when consent is not recorded, but the
  // PRD asks that we not STORE it either. Stripping on read is a display rule; this is
  // the data rule, and only a sweep of the database can confirm it.
  const startups = await payload.find({
    collection: 'startups',
    limit: 10_000,
    depth: 0,
    overrideAccess: true,
    draft: true,
  })

  const offenders: { startup: string; founder: string }[] = []
  for (const startup of startups.docs) {
    for (const founder of startup.founders ?? []) {
      const consented = founder?.contactConsent === true
      const hasContact = typeof founder?.linkedin === 'string' && founder.linkedin.trim().length > 0
      if (hasContact && !consented) {
        offenders.push({ startup: String(startup.name ?? startup.slug), founder: String(founder.name ?? '?') })
      }
    }
  }

  console.log(`\nConsent audit: ${startups.totalDocs} venture(s) checked.`)
  if (offenders.length === 0) {
    console.log('  OK — no founder contact detail stored without consent.')
  } else {
    console.log(`  ${offenders.length} founder record(s) hold a contact link with consent unticked:`)
    for (const o of offenders) console.log(`    - ${o.startup}: ${o.founder}`)
    console.log('  Either tick consent (if it was genuinely given) or clear the link.')
    if (confirmed) {
      for (const startup of startups.docs) {
        const founders = startup.founders ?? []
        if (!founders.some((f) => f?.contactConsent !== true && f?.linkedin)) continue
        await payload.update({
          collection: 'startups',
          id: startup.id,
          data: {
            founders: founders.map((f) =>
              f?.contactConsent === true ? f : { ...f, linkedin: null },
            ),
          },
          overrideAccess: true,
          draft: true,
        })
      }
      console.log('  Cleared the unconsented links.')
    }
  }

  // ── 3. Subscribers who asked to be removed ────────────────────────────────
  const unsubscribed = await payload.find({
    collection: 'subscribers',
    where: { active: { equals: false } },
    limit: 10_000,
    depth: 0,
    overrideAccess: true,
  })
  console.log(`\nUnsubscribed addresses still on file: ${unsubscribed.totalDocs}.`)
  if (unsubscribed.totalDocs > 0) {
    console.log('  Keeping an unsubscribe record is legitimate — it is how we avoid mailing them again.')
    console.log('  Purge only if the list is being retired entirely.')
  }

  console.log(
    confirmed
      ? '\nDone. Keep the exported CSVs somewhere safe and off this machine.\n'
      : '\nDone. Nothing was changed — re-run with --confirm to act.\n',
  )
  process.exit(0)
}

void main()
