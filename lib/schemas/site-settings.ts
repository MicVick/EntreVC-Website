import { z } from 'zod'

import { richTextSchema, submissionCategorySchema } from './common'
import { iimaVenturesBlockSchema } from './scheme'
import { verticalSchema } from './team'

export const socialLinkSchema = z.object({
  platform: z.enum(['linkedin', 'instagram', 'x', 'youtube', 'substack', 'website']),
  url: z.string().min(1),
  label: z.string().nullable(),
})
export type SocialLink = z.infer<typeof socialLinkSchema>

/** "Who do I email about sponsorship?" answered on the page rather than by guessing. */
export const roleContactSchema = z.object({
  role: z.string().min(1),
  name: z.string().nullable(),
  email: z.string().min(1),
  description: z.string().nullable(),
})
export type RoleContact = z.infer<typeof roleContactSchema>

/**
 * Live counts with a per-stat admin override.
 *
 * PRD §3 F7: computed from live collection counts, with an override field per stat —
 * because "alumni network" is not something the database knows, and because a club
 * sometimes wants to state a number the site cannot count.
 */
export const keyNumbersSchema = z.object({
  eventsHeld: z.number().int().nonnegative(),
  startupsListed: z.number().int().nonnegative(),
  alumniNetwork: z.number().int().nonnegative().nullable(),
  /** Labels are editable so the club can re-word a stat without a deploy. */
  labels: z.object({
    eventsHeld: z.string(),
    startupsListed: z.string(),
    alumniNetwork: z.string(),
  }),
})
export type KeyNumbers = z.infer<typeof keyNumbersSchema>

/**
 * Category → mailbox map for the contact form.
 *
 * PRD acceptance criterion: changing this requires no deploy. It is edited in the
 * admin and read at request time by POST /api/contact.
 */
export const categoryRoutingEntrySchema = z.object({
  category: submissionCategorySchema,
  email: z.string().min(1),
  vertical: z.string().nullable(),
})
export type CategoryRoutingEntry = z.infer<typeof categoryRoutingEntrySchema>

export const siteSettingsSchema = z.object({
  positioningStatement: z.string().min(1),
  intro: richTextSchema,

  clubEmail: z.string().min(1),
  campusAddress: z.string().nullable(),
  socialLinks: z.array(socialLinkSchema),
  roleContacts: z.array(roleContactSchema),
  categoryRouting: z.array(categoryRoutingEntrySchema),

  verticals: z.array(verticalSchema),
  iimaVentures: iimaVenturesBlockSchema,

  /** Where a listing-removal request should go. PRD alumni-consent mitigation. */
  takedownEmail: z.string().nullable(),

  youtubeChannelUrl: z.string().nullable(),
  youtubeChannelId: z.string().nullable(),
})
export type SiteSettings = z.infer<typeof siteSettingsSchema>
