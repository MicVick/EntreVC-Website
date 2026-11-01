import { z } from 'zod'

import { imageRefSchema } from './common'

/** What kind of partnership it is. Shown as a small label under each logo. */
export const PARTNER_KINDS = ['institutional', 'sponsor', 'ecosystem', 'knowledge', 'community', 'media'] as const
export const partnerKindSchema = z.enum(PARTNER_KINDS)
export type PartnerKind = z.infer<typeof partnerKindSchema>

export const partnerKindLabels: Readonly<Record<PartnerKind, string>> = {
  institutional: 'Institutional partner',
  sponsor: 'Sponsor',
  ecosystem: 'Ecosystem partner',
  knowledge: 'Knowledge partner',
  community: 'Community partner',
  media: 'Media partner',
}

/** An organisation the club works with: shown on the homepage partner wall. */
export const partnerSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  kind: partnerKindSchema,
  /** Without a logo the name is set in type, so a partner can go up before the logo arrives. */
  logo: imageRefSchema.nullable(),
  website: z.string().nullable(),
  /** One line on what the club does with them. */
  blurb: z.string().nullable(),
  displayOrder: z.number(),
})
export type Partner = z.infer<typeof partnerSchema>
