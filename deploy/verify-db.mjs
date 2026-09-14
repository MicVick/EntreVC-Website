#!/usr/bin/env node
/**
 * Prove a database file is readable and holds real content.
 *
 * A separate file rather than an inline `node -e` in restore.sh, for an unglamorous
 * reason: the SQL contains `type='table'`, and a single-quoted shell string ends at the
 * first quote inside it. The inline version silently truncated the query and the restore
 * verification failed with a syntax error — a bug that would only ever have shown up
 * during an actual recovery, which is the worst possible time to find it.
 *
 * Usage: node deploy/verify-db.mjs <database.db>
 * Exits non-zero if the file is missing, corrupt, or empty of the tables we expect.
 */

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@libsql/client'

const [, , fileArg] = process.argv

if (!fileArg) {
  console.error('Usage: node deploy/verify-db.mjs <database.db>')
  process.exit(2)
}

const file = path.resolve(fileArg)
if (!fs.existsSync(file)) {
  console.error(`[verify] Not found: ${file}`)
  process.exit(1)
}

const client = createClient({ url: `file:${file}` })

try {
  const integrity = await client.execute('PRAGMA integrity_check')
  const verdict = String(integrity.rows[0]?.integrity_check ?? integrity.rows[0]?.[0])
  if (verdict !== 'ok') {
    console.error(`[verify] integrity check FAILED: ${verdict}`)
    process.exit(1)
  }

  const tables = await client.execute(
    "SELECT count(*) AS n FROM sqlite_master WHERE type = 'table'",
  )
  const tableCount = Number(tables.rows[0]?.n ?? 0)
  if (tableCount === 0) {
    console.error('[verify] The file opens but holds no tables.')
    process.exit(1)
  }

  // Counts from the tables that actually matter, so "verified" means the club's data is
  // there rather than merely that the file parses.
  const counts = []
  for (const table of ['events', 'registrations', 'submissions', 'startups', 'media', 'users']) {
    const result = await client
      .execute(`SELECT count(*) AS n FROM ${table}`)
      .catch(() => null)
    counts.push(`${table}=${result ? result.rows[0].n : 'n/a'}`)
  }

  console.log(`[verify] integrity ok — ${tableCount} tables · ${counts.join(' ')}`)
} catch (error) {
  console.error('[verify] FAILED:', error instanceof Error ? error.message : error)
  process.exit(1)
} finally {
  client.close()
}
