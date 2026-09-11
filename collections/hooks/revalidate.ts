import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook, CollectionAfterDeleteHook, GlobalAfterChangeHook } from 'payload'

import { pathsFor } from '@/lib/revalidation'

/**
 * Publish → the public page updates, within seconds.
 *
 * Public pages are statically generated, so without this an editor publishes an event
 * and the site goes on showing the old page indefinitely. That is the hardest class of
 * bug to notice in this architecture — nothing errors, the content is simply wrong —
 * which is why `lib/revalidation.ts` (Agent B's file) is the single exhaustive list of
 * affected routes rather than each hook guessing.
 *
 * Two things are deliberate:
 *
 *   - Failures are swallowed. `revalidatePath` only works inside a Next server
 *     runtime, and these hooks also run from the seed script and the Payload CLI where
 *     there is no such context. A cache miss must never fail the write that triggered
 *     it — the content is saved either way.
 *   - Draft saves revalidate too. A document moving from published back to draft has
 *     to disappear from the public site just as promptly as it appeared.
 */
function refresh(paths: string[]) {
  for (const path of paths) {
    try {
      revalidatePath(path)
    } catch {
      // Outside a Next request scope (seed script, CLI). Nothing to invalidate.
    }
  }
}

type Doc = Record<string, unknown>

function slugOf(doc: Doc): string | undefined {
  return typeof doc.slug === 'string' ? doc.slug : undefined
}

/**
 * Team rosters are archived per academic year at /team/[year], and `pathsFor` has no
 * way to know the year from a slug alone.
 *
 * [REQUEST A-010 → Agent B] Fold this into `pathsFor('team-members', academicYear)` so
 * the path lives with all the others. Handled here meanwhile so the archive is not
 * left stale — logged in DECISIONS.md.
 */
function archivePaths(collection: string, doc: Doc): string[] {
  if (collection !== 'team-members') return []
  const year = typeof doc.academicYear === 'string' ? doc.academicYear : null
  return year ? [`/team/${year}`] : []
}

export function revalidateAfterChange(collection: string): CollectionAfterChangeHook {
  return ({ doc, previousDoc }) => {
    const current = doc as Doc
    const paths = new Set([...pathsFor(collection, slugOf(current)), ...archivePaths(collection, current)])

    // If the slug or the academic year changed, the OLD urls need clearing too, or a
    // renamed page lingers at its previous address.
    if (previousDoc) {
      const previous = previousDoc as Doc
      for (const p of pathsFor(collection, slugOf(previous))) paths.add(p)
      for (const p of archivePaths(collection, previous)) paths.add(p)
    }

    refresh([...paths])
    return doc
  }
}

export function revalidateAfterDelete(collection: string): CollectionAfterDeleteHook {
  return ({ doc }) => {
    const current = doc as Doc
    refresh([...pathsFor(collection, slugOf(current)), ...archivePaths(collection, current)])
    return doc
  }
}

/** Site Settings touches nearly every page — the header, footer and contact routes. */
export const revalidateSiteSettings: GlobalAfterChangeHook = ({ doc }) => {
  refresh(pathsFor('site-settings'))
  return doc
}
