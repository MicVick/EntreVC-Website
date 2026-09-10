import 'server-only'

import { cache } from 'react'

import { playbookChapterFixtures, playbookMetaFixture, resourceFixtures } from '@/lib/fixtures'
import type { PlaybookChapter, PlaybookMeta, Resource, ResourceType } from '@/lib/schemas'

/**
 * Resources library and playbook reads.
 *
 * Gating was cut from V1, so every resource returned here is directly usable — one
 * click from the list to the source, no email interstitial.
 */

const byPublishedDesc = (a: Resource, b: Resource) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()

export const getResources = cache(
  async (filter?: { type?: ResourceType; tag?: string }): Promise<Resource[]> => {
    let items = [...resourceFixtures]
    if (filter?.type) items = items.filter((r) => r.type === filter.type)
    if (filter?.tag) items = items.filter((r) => r.tags.includes(filter.tag!))
    return items.sort(byPublishedDesc)
  },
)

export const getResourceBySlug = cache(async (slug: string): Promise<Resource | null> => {
  return resourceFixtures.find((r) => r.slug === slug) ?? null
})

/** Distinct tags across published resources, alphabetical. */
export const getResourceTags = cache(async (): Promise<string[]> => {
  const tags = new Set<string>()
  for (const r of resourceFixtures) for (const t of r.tags) tags.add(t)
  return [...tags].sort()
})

/** Most recently published resource, for the homepage. `null` when the library is empty. */
export const getLatestResource = cache(async (): Promise<Resource | null> => {
  return [...resourceFixtures].sort(byPublishedDesc)[0] ?? null
})

/** Playbook chapters in reading order. */
export const getPlaybookChapters = cache(async (): Promise<PlaybookChapter[]> => {
  return [...playbookChapterFixtures].sort((a, b) => a.order - b.order)
})

/** [ASSUMPTION] Hybrid playbook: web chapters plus an uploaded PDF. `pdfUrl` may be null. */
export const getPlaybookMeta = cache(async (): Promise<PlaybookMeta> => {
  return playbookMetaFixture
})
