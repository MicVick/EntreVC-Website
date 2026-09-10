import 'server-only'

import { cache } from 'react'

import type { Where } from 'payload'

import type { Resource as PayloadResource } from '@/payload-types'
import type { PlaybookChapter, PlaybookMeta, Resource, ResourceType } from '@/lib/schemas'
import { resourceTypes } from '@/lib/schemas'

import { bool, client, str, strList, toImageRef, toIso, toRichText } from './payload'

function mapResource(doc: PayloadResource): Resource | null {
  const linkType = doc.linkType === 'file' ? 'file' : 'external'
  const file = typeof doc.file === 'object' ? doc.file : null
  const url = linkType === 'file' ? str(file?.url) : str(doc.url)

  // A resource with no destination is not a resource. Dropping it beats rendering a
  // card that goes nowhere.
  if (!url) return null

  return {
    id: String(doc.id ?? ''),
    slug: String(doc.slug ?? ''),
    title: String(doc.title ?? ''),
    type: resourceTypes.includes(doc.type as never) ? (doc.type as ResourceType) : 'article',
    description: str(doc.description),
    url,
    isExternal: linkType === 'external',
    coverImage: toImageRef(doc.coverImage),
    tags: strList(doc.tags),
    author: str(doc.author),
    featured: bool(doc.featured),
    publishedAt: toIso(doc.publishedAt, toIso(doc.createdAt)),
    updatedAt: toIso(doc.updatedAt),
  }
}

const publishedWhere = { _status: { equals: 'published' } }

export const getResources = cache(
  async (filter?: { type?: ResourceType; tag?: string }): Promise<Resource[]> => {
    const payload = await client()
    const clauses: Where[] = [publishedWhere]
    if (filter?.type) clauses.push({ type: { equals: filter.type } })
    if (filter?.tag) clauses.push({ tags: { contains: filter.tag } })

    const res = await payload.find({
      collection: 'resources',
      where: { and: clauses },
      sort: '-publishedAt',
      limit: 500,
      depth: 1,
      overrideAccess: false,
    })
    return res.docs.map(mapResource).filter((r): r is Resource => r !== null)
  },
)

export const getResourceBySlug = cache(async (slug: string): Promise<Resource | null> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'resources',
    where: { and: [publishedWhere, { slug: { equals: slug } }] },
    limit: 1,
    depth: 1,
    overrideAccess: false,
  })
  const doc = res.docs[0]
  return doc ? mapResource(doc) : null
})

export const getResourceTags = cache(async (): Promise<string[]> => {
  const resources = await getResources()
  const tags = new Set<string>()
  for (const r of resources) for (const t of r.tags) tags.add(t)
  return [...tags].sort()
})

export const getLatestResource = cache(async (): Promise<Resource | null> => {
  const resources = await getResources()
  return resources[0] ?? null
})

export const getPlaybookChapters = cache(async (): Promise<PlaybookChapter[]> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'playbook-chapters',
    where: publishedWhere,
    sort: 'order',
    limit: 200,
    depth: 0,
    overrideAccess: false,
  })
  return res.docs.map((doc) => {
    return {
      id: String(doc.id ?? ''),
      slug: String(doc.slug ?? ''),
      order: typeof doc.order === 'number' ? doc.order : 0,
      title: String(doc.title ?? ''),
      summary: str(doc.summary),
      body: toRichText(doc.body),
      updatedAt: toIso(doc.updatedAt),
    }
  })
})

export const getPlaybookMeta = cache(async (): Promise<PlaybookMeta> => {
  const payload = await client()
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 1 })
  const playbook = settings.playbook ?? {}
  const pdf = typeof playbook.pdf === 'object' ? playbook.pdf : null

  return {
    title: str(playbook.title) ?? 'The EntreVC Startup Playbook',
    intro: toRichText(playbook.intro),
    pdfUrl: str(pdf?.url),
    updatedAt: toIso(settings.updatedAt) || null,
  }
})
