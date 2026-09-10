/**
 * Every content type and every input schema, in one place.
 *
 * BOTH AGENTS IMPORT FROM HERE. Agent B must never redeclare a content shape —
 * import the type instead, so a change to the model surfaces as a typecheck failure
 * rather than a page that renders wrong.
 *
 *   import type { Event, Startup } from '@/lib/schemas'
 *
 * Frozen at H1. Changes go through DECISIONS.md (CONTRACT.md, change protocol).
 */

export * from './common'
export * from './action-result'
export * from './event'
export * from './startup'
export * from './resource'
export * from './scheme'
export * from './team'
export * from './site-settings'
export * from './contact'
