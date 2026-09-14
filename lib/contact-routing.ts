import type { CategoryRoutingEntry, SubmissionCategory } from '@/lib/schemas'

/**
 * Where a contact enquiry goes.
 *
 * This looks trivial enough to inline, and it was inlined until it needed a test. The
 * reason it deserves one is the failure mode: if this resolves to the wrong mailbox, or
 * to nothing at all, **there is no error anywhere.** The submission still saves, the
 * sender still gets their acknowledgement, and the enquiry simply never reaches a human.
 * A sponsorship approach worth real money disappears and the first anyone knows is when
 * the sender gives up.
 *
 * So the resolution reports *where* the address came from as well as what it is. That
 * turns a silent wrong answer into something the admin can show and a test can assert.
 *
 * The order is deliberate: the club's own admin-editable map wins over anything in the
 * environment, because changing where sponsorship enquiries go must never need a deploy.
 */

export type RoutingSource =
  /** An explicit row in Site Settings → Contact & routing. */
  | 'category'
  /** CONTACT_FALLBACK_EMAIL — a deployment safety net, not a routing decision. */
  | 'fallback'
  /** The club's general address. Correct, but nobody chose it for this category. */
  | 'club'
  /** Nothing configured. The enquiry is saved but will reach no inbox. */
  | 'none'

export type RoutingResolution = {
  recipient: string | null
  source: RoutingSource
}

function clean(value: string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function resolveContactRecipient(args: {
  category: SubmissionCategory
  routing: readonly CategoryRoutingEntry[]
  fallbackEmail?: string | null
  clubEmail?: string | null
}): RoutingResolution {
  const mapped = clean(args.routing.find((row) => row.category === args.category)?.email)
  if (mapped) return { recipient: mapped, source: 'category' }

  const fallback = clean(args.fallbackEmail)
  if (fallback) return { recipient: fallback, source: 'fallback' }

  const club = clean(args.clubEmail)
  if (club) return { recipient: club, source: 'club' }

  return { recipient: null, source: 'none' }
}
