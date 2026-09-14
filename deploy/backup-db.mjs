#!/usr/bin/env node
/**
 * Consistent SQLite backup.
 *
 * The thing to understand here: **you cannot back up a live SQLite database by copying
 * the file.** A plain `cp` while the server is running can capture a database mid-write,
 * with a separate write-ahead log that the copy does not include. The result looks like a
 * backup, has a sensible file size, and fails to open when you finally need it. That is
 * the worst possible failure mode for a backup, because you discover it on the day you
 * have already lost the original.
 *
 * `VACUUM INTO` takes a transactionally consistent snapshot of a live database into a new
 * file, and compacts it on the way. It needs no separate tool on the VM — it runs through
 * the libsql client the application already depends on, so there is one less thing for the
 * next team to install, and one less thing to be missing at 2 a.m.
 *
 * Usage: node deploy/backup-db.mjs <source.db> <destination.db>
 */

import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@libsql/client'

const [, , sourceArg, destArg] = process.argv

if (!sourceArg || !destArg) {
  console.error('Usage: node deploy/backup-db.mjs <source.db> <destination.db>')
  process.exit(2)
}

const source = path.resolve(sourceArg)
const dest = path.resolve(destArg)

if (!fs.existsSync(source)) {
  console.error(`[backup] Source database not found: ${source}`)
  process.exit(1)
}

// VACUUM INTO refuses to overwrite, which is a feature — it means a backup can never
// silently clobber a good one. Clear a stale partial file from a previous failed run.
if (fs.existsSync(dest)) fs.rmSync(dest)
fs.mkdirSync(path.dirname(dest), { recursive: true })

const client = createClient({ url: `file:${source}` })

try {
  // Forward slashes: the SQL string is not a shell path, and a Windows backslash would
  // be read as an escape.
  await client.execute(`VACUUM INTO '${dest.replace(/\\/g, '/').replace(/'/g, "''")}'`)

  // A backup is not proven by the absence of an error. Open the copy and read from it.
  const check = createClient({ url: `file:${dest}` })
  try {
    const integrity = await check.execute('PRAGMA integrity_check')
    const verdict = integrity.rows[0]?.integrity_check ?? integrity.rows[0]?.[0]
    if (String(verdict) !== 'ok') {
      console.error(`[backup] Integrity check FAILED on the copy: ${String(verdict)}`)
      process.exit(1)
    }

    const tables = await check.execute(
      "SELECT count(*) AS n FROM sqlite_master WHERE type='table'",
    )
    const tableCount = Number(tables.rows[0]?.n ?? 0)
    if (tableCount === 0) {
      console.error('[backup] The copy opened but contains no tables. Refusing to call this a backup.')
      process.exit(1)
    }

    const bytes = fs.statSync(dest).size
    console.log(
      `[backup] OK — ${path.basename(dest)} (${(bytes / 1024).toFixed(0)} KB, ${tableCount} tables, integrity ok)`,
    )
  } finally {
    check.close()
  }
} catch (error) {
  console.error('[backup] Failed:', error instanceof Error ? error.message : error)
  process.exit(1)
} finally {
  client.close()
}
