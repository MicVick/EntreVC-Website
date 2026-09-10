import { z } from 'zod'

import { imageRefSchema, isoDateSchema, richTextSchema, slugSchema } from './common'

/**
 * An IIMA Ventures scheme available to IIMA students — an explicit ask in the club
 * brief (v1.0, Startups module).
 */
export const ventureSchemeSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  name: z.string().min(1),
  summary: z.string().min(1),
  whoItIsFor: z.string().nullable(),
  whatYouGet: z.string().nullable(),
  eligibility: z.string().nullable(),
  applicationLink: z.string().nullable(),
  /** null means rolling / no fixed deadline. */
  deadline: isoDateSchema.nullable(),
  displayOrder: z.number().int().nonnegative(),
  updatedAt: isoDateSchema,

  /** Computed by lib/content: deadline is in the past. Shown de-emphasised, not hidden. */
  isExpired: z.boolean(),
})
export type VentureScheme = z.infer<typeof ventureSchemeSchema>

/** The editorial block at the top of /iima-ventures, from Site Settings. */
export const iimaVenturesBlockSchema = z.object({
  overview: richTextSchema,
  highlight: z.string().nullable(),
  contactEmail: z.string().nullable(),
  contactName: z.string().nullable(),
  website: z.string().nullable(),
  image: imageRefSchema.nullable(),
})
export type IimaVenturesBlock = z.infer<typeof iimaVenturesBlockSchema>
