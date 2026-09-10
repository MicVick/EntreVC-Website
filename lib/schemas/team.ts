import { z } from 'zod'

import { imageRefSchema, isoDateSchema, slugSchema } from './common'

/**
 * A vertical is a functional sub-team (events, ventures, outreach…).
 *
 * It is editable content, not a hardcoded enum, so the club can reorganise without a
 * deploy — and so the structure diagram on the team page is built from data and
 * cannot go stale at the first reorganisation.
 */
export const verticalSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullable(),
  order: z.number().int().nonnegative(),
})
export type Vertical = z.infer<typeof verticalSchema>

export const teamMemberSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  name: z.string().min(1),
  role: z.string().min(1),
  vertical: z.string().nullable(),
  batch: z.string().nullable(),
  photo: imageRefSchema.nullable(),
  linkedin: z.string().nullable(),
  /** e.g. "2026-27". Drives /team/[year]. */
  academicYear: z.string().min(1),
  displayOrder: z.number().int().nonnegative(),
  updatedAt: isoDateSchema,
})
export type TeamMember = z.infer<typeof teamMemberSchema>
