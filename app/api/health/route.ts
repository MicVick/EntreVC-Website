import { NextResponse } from 'next/server'

import { client } from '@/lib/content/payload'

/**
 * GET /api/health — is this site actually working?
 *
 * Written for a machine, not a person: an uptime checker pings it every few minutes and
 * alerts the club if it stops saying "ok".
 *
 * It deliberately touches the DATABASE rather than just returning 200. A Next process
 * can be perfectly alive and serving cached pages while the database file is missing,
 * locked or on a filesystem that has gone read-only — and every one of those states is
 * invisible to a check that only asks whether the port is open. The one thing this
 * endpoint must catch is exactly that.
 *
 * It returns nothing useful to an attacker: no versions, no paths, no counts beyond a
 * liveness signal, and no error detail. A failure says "error" and the specifics go to
 * the server log where they belong.
 */

// Never cached: a cached health check is not a health check.
export const dynamic = 'force-dynamic'

export async function GET() {
  const startedAt = Date.now()

  try {
    const payload = await client()
    // The cheapest query that proves the database is readable.
    await payload.count({ collection: 'events', overrideAccess: true })

    return NextResponse.json(
      { status: 'ok', database: 'ok', latencyMs: Date.now() - startedAt },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('[health] Database check failed', error)
    return NextResponse.json(
      { status: 'error', database: 'unreachable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
