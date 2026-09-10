import 'server-only'

import { cache } from 'react'

import type { Where } from 'payload'

import type { Startup as PayloadStartup } from '@/payload-types'
import type { Founder, Startup, StartupFacets, StartupStage, StartupType } from '@/lib/schemas'
import { startupStages } from '@/lib/schemas'

import {
  bool,
  client,
  num,
  str,
  strList,
  toImageRef,
  toIso,
  toRichText,
  toRichTextOrNull,
} from './payload'

/**
 * Strip a founder down to what may lawfully be published.
 *
 * PRD §7: no personal contact detail is published without written approval. The
 * contact link is dropped HERE, at the data layer, so it never reaches a component,
 * a JSON payload, or a page's HTML. A component-level check would be one careless
 * `{...founder}` spread away from leaking it.
 */
type FounderRow = NonNullable<PayloadStartup['founders']>[number]

function mapFounder(row: FounderRow): Founder {
  const consented = bool(row.contactConsent)
  return {
    name: String(row.name ?? ''),
    batch: str(row.batch),
    photo: toImageRef(row.photo),
    linkedin: consented ? str(row.linkedin) : null,
  }
}

function mapStartup(doc: PayloadStartup): Startup {
  const founders = (doc.founders ?? []).map(mapFounder)
  const stageValue = startupStages.includes(doc.stage as never)
    ? (doc.stage as StartupStage)
    : null

  return {
    id: String(doc.id ?? ''),
    slug: String(doc.slug ?? ''),
    name: String(doc.name ?? ''),
    tagline: String(doc.tagline ?? ''),
    description: toRichText(doc.description),
    story: toRichTextOrNull(doc.story),
    type: doc.type === 'alumni' ? 'alumni' : 'student',
    logo: toImageRef(doc.logo),
    founders,
    sectors: strList(doc.sectors),
    stage: stageValue,
    foundedYear: num(doc.foundedYear),
    website: str(doc.website),
    linkedin: str(doc.linkedin),
    featured: bool(doc.featured),
    updatedAt: toIso(doc.updatedAt),
    // Denormalised for filtering, so the directory never digs through founders[].
    batches: [...new Set(founders.map((f) => f.batch).filter((b): b is string => Boolean(b)))],
  }
}

/**
 * Published AND approved.
 *
 * The `beforeChange` hook already refuses to publish an unapproved listing, so this is
 * belt and braces — but a listing approved and then un-approved (consent withdrawn)
 * must disappear from the site immediately, and this query is what makes that true.
 */
const visibleClauses: Where[] = [
  { _status: { equals: 'published' } },
  { 'listingApproval.approved': { equals: true } },
]
const visibleWhere: Where = { and: visibleClauses }

export const getStartups = cache(async (filter?: { type?: StartupType }): Promise<Startup[]> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'startups',
    where: filter?.type
      ? { and: [...visibleClauses, { type: { equals: filter.type } }] }
      : visibleWhere,
    sort: 'name',
    limit: 500,
    depth: 2,
    overrideAccess: false,
  })
  return res.docs.map(mapStartup)
})

export const getStartupBySlug = cache(async (slug: string): Promise<Startup | null> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'startups',
    where: { and: [...visibleClauses, { slug: { equals: slug } }] },
    limit: 1,
    depth: 2,
    overrideAccess: false,
  })
  const doc = res.docs[0]
  return doc ? mapStartup(doc) : null
})

export const getAllStartupSlugs = cache(async (): Promise<string[]> => {
  const startups = await getStartups()
  return startups.map((s) => s.slug)
})

export const getFeaturedStartups = cache(async (opts?: { limit?: number }): Promise<Startup[]> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'startups',
    where: { and: [...visibleClauses, { featured: { equals: true } }] },
    sort: 'name',
    limit: opts?.limit ?? 6,
    depth: 2,
    overrideAccess: false,
  })
  return res.docs.map(mapStartup)
})

/**
 * Facets derived from what is actually published, so a filter control can never offer
 * an option that matches nothing.
 */
export const getStartupFacets = cache(async (): Promise<StartupFacets> => {
  const startups = await getStartups()
  const sectors = new Set<string>()
  const stages = new Set<StartupStage>()
  const batches = new Set<string>()

  for (const s of startups) {
    for (const sector of s.sectors) sectors.add(sector)
    if (s.stage) stages.add(s.stage)
    for (const batch of s.batches) batches.add(batch)
  }

  return {
    sectors: [...sectors].sort(),
    // Ordered by funding progression, not alphabetically — "Seed" before "Series A"
    // reads correctly in a filter list where alphabetical would not.
    stages: startupStages.filter((s) => stages.has(s)),
    batches: [...batches].sort().reverse(),
  }
})
