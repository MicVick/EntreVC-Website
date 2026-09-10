/**
 * Sample content covering every state the public site has to render.
 *
 * Agent B builds against this via lib/content — no database, no admin panel, no
 * waiting on Agent A's collections (CONTRACT.md §2).
 *
 * These are OUTPUT shapes: exactly what lib/content returns once it is backed by
 * Payload. Published content only — a draft event and an unapproved startup listing
 * exist in the seed and must never appear here, because they must never reach a page.
 *
 * Once the Payload-backed content layer lands, these stay useful as test data.
 */

export * from './helpers'
export { eventFixtures } from './events'
export { startupFixtures } from './startups'
export {
  playbookChapterFixtures,
  playbookMetaFixture,
  resourceFixtures,
  schemeFixtures,
} from './library'
export {
  CURRENT_ACADEMIC_YEAR,
  PREVIOUS_ACADEMIC_YEAR,
  siteSettingsFixture,
  teamMemberFixtures,
} from './team'
