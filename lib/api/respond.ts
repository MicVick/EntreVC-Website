import { NextResponse } from 'next/server'

import { type ActionErrorCode, type ActionResult, actionFail } from '@/lib/schemas'

/**
 * Turn an ActionResult into an HTTP response.
 *
 * The body shape is CONTRACT.md §5, but the STATUS CODE carries real meaning too —
 * Agent B's forms branch on it directly (`response.status === 409` is how the
 * newsletter signup shows "you're already on the list", and 429 is how both forms
 * show the rate-limit message). Changing this mapping silently breaks their UI, so it
 * lives in one place rather than being re-decided per route.
 */
const STATUS_BY_CODE: Record<ActionErrorCode, number> = {
  INVALID: 400,
  DUPLICATE: 409,
  CLOSED: 409,
  FULL: 409,
  RATE_LIMITED: 429,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
}

export function respond<T>(result: ActionResult<T>): NextResponse {
  if (result.ok) return NextResponse.json(result, { status: 200 })
  return NextResponse.json(result, { status: STATUS_BY_CODE[result.code] })
}

/**
 * Parse a JSON request body without throwing on malformed input.
 * A bad body is a client error, not a 500.
 */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json()
  } catch {
    return null
  }
}

/**
 * Flatten a zod error into the `fieldErrors` shape Agent B renders inline.
 */
export function fieldErrorsFrom(issues: { path: PropertyKey[]; message: string }[]): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const issue of issues) {
    const key = issue.path.map(String).join('.') || '_form'
    ;(out[key] ??= []).push(issue.message)
  }
  return out
}

/**
 * The honeypot check, run against the RAW body before schema validation.
 *
 * Order matters here and it is easy to get wrong. The shared input schemas declare
 * `website: z.string().max(0)`, so validating first rejects a bot with a 400 whose
 * `fieldErrors` names the honeypot field — which both makes this function dead code
 * and hands the bot's author precisely the hint they need. Checking the raw body first
 * lets us return a plausible success instead and write nothing.
 *
 * A real person never fills a field they cannot see.
 */
export function honeypotTripped(raw: unknown): boolean {
  if (!raw || typeof raw !== 'object') return false
  const value = (raw as Record<string, unknown>).website
  return typeof value === 'string' && value.trim().length > 0
}

export function serverError(message = 'Something went wrong at our end. Please try again in a moment.') {
  return respond(actionFail('SERVER_ERROR', message))
}
