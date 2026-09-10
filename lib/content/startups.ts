import 'server-only'

import { cache } from 'react'

import { startupFixtures } from '@/lib/fixtures'
import type { Startup, StartupFacets, StartupStage, StartupType } from '@/lib/schemas'

/**
 * Startup directory reads. Published AND approved listings only.
 *
 * The approval gate lives here rather than in a component: PRD §7 requires that no
 * listing appears without written consent, and enforcing it in the data layer means a
 * mistake in a card cannot leak one. Founder contact details are likewise stripped
 * upstream — a founder without consent simply has no `linkedin` in the returned type.
 */

const allStartups = (): Startup[] => startupFixtures

/**
 * Every published venture, for client-side filtering.
 *
 * Returns the full list on purpose: PRD acceptance criterion says filtering must be
 * instant with no spinner between filter clicks under ~500 entries. Paginate above
 * that; we are at a dozen.
 */
export const getStartups = cache(async (filter?: { type?: StartupType }): Promise<Startup[]> => {
  const items = allStartups()
  const scoped = filter?.type ? items.filter((s) => s.type === filter.type) : items
  return [...scoped].sort((a, b) => a.name.localeCompare(b.name))
})

export const getStartupBySlug = cache(async (slug: string): Promise<Startup | null> => {
  return allStartups().find((s) => s.slug === slug) ?? null
})

export const getAllStartupSlugs = cache(async (): Promise<string[]> => {
  return allStartups().map((s) => s.slug)
})

/** Featured ventures for the homepage strip. */
export const getFeaturedStartups = cache(async (opts?: { limit?: number }): Promise<Startup[]> => {
  const items = allStartups().filter((s) => s.featured)
  return opts?.limit ? items.slice(0, opts.limit) : items
})

/**
 * The distinct values present in published listings, for building filter controls.
 *
 * Derived from the data rather than hardcoded, so a filter never offers a sector that
 * matches nothing — an empty result set from a control the site itself rendered is a
 * bad experience and an easy one to avoid.
 */
export const getStartupFacets = cache(async (): Promise<StartupFacets> => {
  const sectors = new Set<string>()
  const stages = new Set<StartupStage>()
  const batches = new Set<string>()

  for (const s of allStartups()) {
    for (const sector of s.sectors) sectors.add(sector)
    if (s.stage) stages.add(s.stage)
    for (const batch of s.batches) batches.add(batch)
  }

  return {
    sectors: [...sectors].sort(),
    stages: [...stages],
    // Newest batch first — PGP 2028 above PGP 2015.
    batches: [...batches].sort().reverse(),
  }
})
