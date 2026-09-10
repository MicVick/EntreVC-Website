import { z } from 'zod'

import { imageRefSchema, isoDateSchema, richTextSchema, slugSchema, startupTypeSchema } from './common'

/**
 * A founder as rendered on the public site.
 *
 * `linkedin` and `email` are ALREADY STRIPPED by lib/content when the founder's
 * `contactConsent` is not true — the public type simply will not carry them. Agent B
 * should still gate at render (a null check), but the data layer is the real
 * enforcement point, so a mistake in a component cannot leak a contact detail.
 *
 * PRD §7: "No personal contact detail appears publicly unless the corresponding
 * record carries written approval."
 */
export const founderSchema = z.object({
  name: z.string().min(1),
  batch: z.string().nullable(),
  photo: imageRefSchema.nullable(),
  /** Present only when the founder gave contact consent. */
  linkedin: z.string().nullable(),
})
export type Founder = z.infer<typeof founderSchema>

export const startupStages = [
  'idea',
  'pre_seed',
  'seed',
  'series_a',
  'series_b_plus',
  'bootstrapped',
  'acquired',
] as const
export const startupStageSchema = z.enum(startupStages)
export type StartupStage = z.infer<typeof startupStageSchema>

export const startupStageLabels: Record<StartupStage, string> = {
  idea: 'Idea',
  pre_seed: 'Pre-seed',
  seed: 'Seed',
  series_a: 'Series A',
  series_b_plus: 'Series B+',
  bootstrapped: 'Bootstrapped',
  acquired: 'Acquired',
}

export const startupSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  name: z.string().min(1),
  tagline: z.string().min(1),
  description: richTextSchema,
  /** The founding story — longer narrative on the detail page. */
  story: richTextSchema.nullable(),

  type: startupTypeSchema,
  logo: imageRefSchema.nullable(),

  founders: z.array(founderSchema),
  sectors: z.array(z.string()),
  stage: startupStageSchema.nullable(),
  foundedYear: z.number().int().nullable(),

  website: z.string().nullable(),
  linkedin: z.string().nullable(),

  featured: z.boolean(),
  updatedAt: isoDateSchema,

  /**
   * Batches of the founders, denormalised for filtering. Agent B filters on this
   * rather than digging through `founders[]`.
   */
  batches: z.array(z.string()),
})
export type Startup = z.infer<typeof startupSchema>

/**
 * Never reaches the public site — `lib/content` refuses to return a startup whose
 * approval is missing, and a Payload hook refuses to publish one. Kept here because
 * the admin and the seed script both need the shape.
 *
 * [ASSUMPTION] Per-listing written consent. EXECUTION_PLAN.md §3, decision 3.
 */
export const listingApprovalSchema = z.object({
  approved: z.boolean(),
  approvedBy: z.string().nullable(),
  approvedAt: isoDateSchema.nullable(),
  evidenceUrl: z.string().nullable(),
})
export type ListingApproval = z.infer<typeof listingApprovalSchema>

export const startupFacetsSchema = z.object({
  sectors: z.array(z.string()),
  stages: z.array(startupStageSchema),
  batches: z.array(z.string()),
})
export type StartupFacets = z.infer<typeof startupFacetsSchema>
