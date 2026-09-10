import 'server-only'

/**
 * THE CONTENT ACCESS LAYER — the seam between the two agents.
 *
 * Agent B calls these from Server Components and never touches Payload, SQLite or
 * anything below this line. Nothing outside lib/content knows how content is stored,
 * which is what let this project survive a migration from Firestore to Payload
 * without changing a single page.
 *
 *   import { getUpcomingEvents } from '@/lib/content'
 *
 * Guarantees (CONTRACT.md §4):
 *   - published content only, already sorted
 *   - dates are ISO UTC strings, never Date objects (they do not survive the RSC
 *     boundary)
 *   - rich text arrives as sanitised `{ html, plainText }`
 *   - a missing entry returns `null`; a genuine read failure throws and error.tsx
 *     handles it
 *   - every function is React-`cache()`d for per-request dedupe
 *
 * All of this runs at BUILD time. No page fetches content at request time, and no
 * page declares `export const revalidate` — freshness comes from on-demand
 * revalidation fired by Payload hooks on publish.
 *
 * STATUS: signatures frozen at H1. Bodies return fixtures until the Payload Local API
 * is wired in (A1.2). Signatures will not change when that happens.
 */

export {
  getAllEventSlugs,
  getEventBySlug,
  getEventTypes,
  getPastEvents,
  getUpcomingEvents,
} from './events'

export {
  getAllStartupSlugs,
  getFeaturedStartups,
  getStartupBySlug,
  getStartupFacets,
  getStartups,
} from './startups'

export {
  getLatestResource,
  getPlaybookChapters,
  getPlaybookMeta,
  getResourceBySlug,
  getResources,
  getResourceTags,
} from './resources'

export {
  getIimaVenturesContent,
  getKeyNumbers,
  getRoleContacts,
  getSiteSettings,
  getTeam,
  getTeamYears,
  getVentureSchemes,
  getVerticals,
} from './site'
