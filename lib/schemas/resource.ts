import { z } from 'zod'

import { imageRefSchema, isoDateSchema, resourceTypeSchema, richTextSchema, slugSchema } from './common'

export const resourceSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  title: z.string().min(1),
  type: resourceTypeSchema,
  description: z.string().nullable(),
  /**
   * Where the resource actually lives. Either an external link or an uploaded file
   * served from /media. Gating was cut from V1, so this is always directly usable —
   * every resource is one click from the list to the source, no interstitial.
   */
  url: z.string().min(1),
  isExternal: z.boolean(),
  coverImage: imageRefSchema.nullable(),
  tags: z.array(z.string()),
  author: z.string().nullable(),
  featured: z.boolean(),
  publishedAt: isoDateSchema,
  updatedAt: isoDateSchema,
})
export type Resource = z.infer<typeof resourceSchema>

export const playbookChapterSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  order: z.number().int().nonnegative(),
  title: z.string().min(1),
  /** One-line summary for the chapter index. */
  summary: z.string().nullable(),
  body: richTextSchema,
  updatedAt: isoDateSchema,
})
export type PlaybookChapter = z.infer<typeof playbookChapterSchema>

/**
 * [ASSUMPTION] Hybrid playbook: chaptered web version (the SEO surface, and the
 * reason the playbook is findable at all) plus an uploaded PDF for download. No PDF
 * is generated. EXECUTION_PLAN.md §3, decision 6.
 */
export const playbookMetaSchema = z.object({
  title: z.string(),
  intro: richTextSchema,
  pdfUrl: z.string().nullable(),
  updatedAt: isoDateSchema.nullable(),
})
export type PlaybookMeta = z.infer<typeof playbookMetaSchema>
