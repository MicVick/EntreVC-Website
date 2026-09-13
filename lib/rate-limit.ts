import 'server-only'

/**
 * IP rate limiting for the public write endpoints (PRD §7).
 *
 * Deliberately in-process rather than Redis. The site runs as ONE Node process on one
 * VM, so a module-level Map is exactly as correct as an external store would be, and
 * it adds no vendor, no network hop and nothing for the next team to keep alive.
 *
 * [ASSUMPTION] Single instance. If the app is ever run behind more than one process,
 * each gets its own counter and the effective limit multiplies. That is a deployment
 * change, and this comment is the tripwire. EXECUTION_PLAN.md §3, decision 8.
 *
 * Counters reset on restart. For abuse prevention at club scale that is fine: the
 * purpose is to stop a script hammering the registration endpoint, not to enforce a
 * quota anyone is paying for.
 */

type Bucket = { count: number; resetAt: number }

const buckets = new Map<string, Bucket>()

/** Keep the map from growing without bound on a long-running process. */
let lastSweep = Date.now()
const SWEEP_INTERVAL_MS = 5 * 60_000

function sweep(now: number) {
  if (now - lastSweep < SWEEP_INTERVAL_MS) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

export type RateLimitResult = {
  allowed: boolean
  remaining: number
  retryAfterSeconds: number
}

/**
 * A fixed window per key. Windows are short, so a burst at a boundary is at worst
 * double the limit over two windows — acceptable for abuse prevention, and far simpler
 * to reason about than a sliding window.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const existing = buckets.get(key)
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: limit - 1, retryAfterSeconds: 0 }
  }

  existing.count += 1
  const allowed = existing.count <= limit
  return {
    allowed,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: allowed ? 0 : Math.ceil((existing.resetAt - now) / 1000),
  }
}

/**
 * Best-effort client IP.
 *
 * Behind Caddy the real address arrives in `X-Forwarded-For`; the left-most entry is
 * the client. These headers are spoofable in general, which is fine here — rate
 * limiting is a speed bump, not an authorisation control, and nothing security-
 * relevant depends on the value.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

/** Limits tuned so a real person never meets them and a script does, quickly. */
export const LIMITS = {
  /** Registering for several events in one sitting is normal; 10/min is not. */
  register: { limit: 10, windowMs: 60_000 },
  contact: { limit: 5, windowMs: 60_000 },
  subscribe: { limit: 5, windowMs: 60_000 },
  /**
   * Deliberately the tightest limit here. Resend sends mail to an address the caller
   * supplies, so a generous limit turns it into a way to flood somebody's inbox. Two a
   * minute covers a real person who mistyped and tried again; it does not cover anyone
   * using this as a weapon.
   */
  resend: { limit: 2, windowMs: 60_000 },
} as const

export function checkLimit(
  request: Request,
  scope: keyof typeof LIMITS,
): RateLimitResult {
  const { limit, windowMs } = LIMITS[scope]
  return rateLimit(`${scope}:${clientIp(request)}`, limit, windowMs)
}

/** Test seam — resets all counters between test cases. */
export function __resetRateLimits() {
  buckets.clear()
}
