import type { Access, FieldAccess } from 'payload'

/**
 * Access control, defined once.
 *
 * PRD §7: gating happens at the data layer, never in the UI alone. Every rule here
 * applies equally to the admin panel, the REST API and the Local API, so there is no
 * path around them.
 */

/** Signed in at all — `admin` or `editor`. Editors can publish everything. */
export const isSignedIn: Access = ({ req: { user } }) => Boolean(user)

export const isAdmin: Access = ({ req: { user } }) => user?.role === 'admin'

export const isAdminField: FieldAccess = ({ req: { user } }) => user?.role === 'admin'

/** Public write endpoints (registration, contact, subscribe) create as an anonymous user. */
export const anyone: Access = () => true

/** Nobody, including admins — used where a record must only ever be written by code. */
export const noOne: Access = () => false

/**
 * The public read rule for content collections.
 *
 * A signed-in team member sees everything, including drafts, so previewing works. The
 * public gets a *query constraint* rather than a boolean — Payload folds it into the
 * database query, so a draft is not merely hidden but never fetched.
 */
export const publishedOnly: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

/**
 * Registrations, submissions and subscribers hold personal data.
 *
 * Create is open (that is the whole point of a public form); reading requires an
 * account. PRD §7: "write-only for the public and read-only for authorised roles".
 * Deletion is admin-only so a mis-click cannot destroy an attendee list.
 */
export const personalDataAccess = {
  create: anyone,
  read: isSignedIn,
  update: isSignedIn,
  delete: isAdmin,
} as const
