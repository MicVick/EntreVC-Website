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

  /** One line under the verticals on the team page ("1 Cell Head + 5 Core Members"). */
  structureNote: z.string().nullable(),
})
export type SiteSettings = z.infer<typeof siteSettingsSchema>

// ── Club story ───────────────────────────────────────────────────────────────
// The homepage sections about the club, edited under Site settings → Club story.
// Figures are free text ("1,300+", "$24 Bn+") because that is how the club writes them.

export const figureStatSchema = z.object({
  figure: z.string().min(1),
  label: z.string().min(1),
})
export type FigureStat = z.infer<typeof figureStatSchema>

export const pillarSchema = z.object({
  figure: z.string().nullable(),
  title: z.string().min(1),
  description: z.string().nullable(),
})
export type Pillar = z.infer<typeof pillarSchema>

export const flagshipSchema = z.object({
  name: z.string().min(1),
  figure: z.string().nullable(),
  unit: z.string().nullable(),
  description: z.string().nullable(),
})
export type Flagship = z.infer<typeof flagshipSchema>

export const founderCompanySchema = z.object({
  name: z.string().min(1),
  founders: z.string().min(1),
  description: z.string().nullable(),
  foundedYear: z.number().int().nullable(),
})
export type FounderCompany = z.infer<typeof founderCompanySchema>

export const roadmapItemSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  isNew: z.boolean(),
})
export type RoadmapItem = z.infer<typeof roadmapItemSchema>

export const roadmapPhaseSchema = z.object({
  name: z.string().min(1),
  items: z.array(roadmapItemSchema),
})
export type RoadmapPhase = z.infer<typeof roadmapPhaseSchema>

export const clubStorySchema = z.object({
  pillars: z.array(pillarSchema),
  highlights: z.object({
    yearLabel: z.string().nullable(),
    stats: z.array(figureStatSchema),
    flagships: z.array(flagshipSchema),
    otherEvents: z.array(z.string().min(1)),
  }),
  founderWall: z.object({
    stats: z.array(figureStatSchema),
    companies: z.array(founderCompanySchema),
    source: z.string().nullable(),
  }),
  roadmap: z.object({
    yearLabel: z.string().nullable(),
    phases: z.array(roadmapPhaseSchema),
  }),
})
export type ClubStory = z.infer<typeof clubStorySchema>

/**
 * Split a written figure into the part that can count up and the text around it:
 * "15+" → 15 and "+", "$24 Bn+" → "$", 24 and " Bn+". Numbers with separators or
 * decimals ("1,300+", "2.5K") come back with `value: null` and display as written.
 */
export function splitFigure(figure: string): { prefix: string; value: number | null; suffix: string } {
  const match = /^(\D*?)(\d+)(\D*)$/.exec(figure.trim())
  if (!match) return { prefix: '', value: null, suffix: figure }
  return { prefix: match[1] ?? '', value: Number(match[2]), suffix: match[3] ?? '' }
}
