import 'server-only'

import { cache } from 'react'

import {
  CURRENT_ACADEMIC_YEAR,
  eventFixtures,
  schemeFixtures,
  siteSettingsFixture,
  startupFixtures,
  teamMemberFixtures,
} from '@/lib/fixtures'
import type {
  IimaVenturesBlock,
  KeyNumbers,
  RoleContact,
  SiteSettings,
  TeamMember,
  VentureScheme,
  Vertical,
} from '@/lib/schemas'

// ── Team ─────────────────────────────────────────────────────────────────────

/**
 * Team roster for an academic year, defaulting to the current one.
 *
 * Ordered by vertical (per Site Settings) then the admin-controlled `displayOrder`,
 * so reordering the team page is an admin action rather than a code change.
 */
export const getTeam = cache(async (academicYear?: string): Promise<TeamMember[]> => {
  const year = academicYear ?? CURRENT_ACADEMIC_YEAR
  const verticalOrder = new Map(siteSettingsFixture.verticals.map((v) => [v.name, v.order]))

  return teamMemberFixtures
    .filter((m) => m.academicYear === year)
    .sort((a, b) => {
      const av = verticalOrder.get(a.vertical ?? '') ?? 999
      const bv = verticalOrder.get(b.vertical ?? '') ?? 999
      return av !== bv ? av - bv : a.displayOrder - b.displayOrder
    })
})

/** Academic years that have a roster, newest first. Drives the archive switcher. */
export const getTeamYears = cache(async (): Promise<string[]> => {
  const years = new Set(teamMemberFixtures.map((m) => m.academicYear))
  return [...years].sort().reverse()
})

/** Verticals as data, so the structure diagram cannot go stale at a reorganisation. */
export const getVerticals = cache(async (): Promise<Vertical[]> => {
  return [...siteSettingsFixture.verticals].sort((a, b) => a.order - b.order)
})

// ── Schemes ──────────────────────────────────────────────────────────────────

export const getVentureSchemes = cache(async (): Promise<VentureScheme[]> => {
  const now = Date.now()
  return [...schemeFixtures]
    .map((s) => ({
      ...s,
      // Recomputed rather than trusted, so an expired deadline is never shown as live.
      isExpired: s.deadline ? new Date(s.deadline).getTime() < now : false,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder)
})

export const getIimaVenturesContent = cache(async (): Promise<IimaVenturesBlock> => {
  return siteSettingsFixture.iimaVentures
})

// ── Settings ─────────────────────────────────────────────────────────────────

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  return siteSettingsFixture
})

export const getRoleContacts = cache(async (): Promise<RoleContact[]> => {
  return siteSettingsFixture.roleContacts
})

/**
 * Homepage key numbers.
 *
 * Counted live from published content, except `alumniNetwork`, which the database has
 * no way to know and which the club sets by hand. PRD §3 F7 asks for live counts with
 * a per-stat admin override; once Payload is wired in, a non-null override wins over
 * the count.
 */
export const getKeyNumbers = cache(async (): Promise<KeyNumbers> => {
  const now = Date.now()
  const eventsHeld = eventFixtures.filter((e) => new Date(e.endDateTime).getTime() < now).length

  return {
    eventsHeld,
    startupsListed: startupFixtures.length,
    alumniNetwork: 1600,
    labels: {
      eventsHeld: 'Events held',
      startupsListed: 'Ventures listed',
      alumniNetwork: 'Alumni network',
    },
  }
})
