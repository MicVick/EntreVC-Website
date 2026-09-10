import 'server-only'

import { cache } from 'react'

import type {
  CategoryRoutingEntry,
  IimaVenturesBlock,
  KeyNumbers,
  RoleContact,
  SiteSettings,
  SocialLink,
  TeamMember,
  VentureScheme,
  Vertical,
} from '@/lib/schemas'

import { client, num, str, toImageRef, toIso, toIsoOrNull, toRichText } from './payload'

const publishedWhere = { _status: { equals: 'published' } }

const settingsGlobal = cache(async () => {
  const payload = await client()
  return payload.findGlobal({ slug: 'site-settings', depth: 2 })
})

/** The academic year that is current today. The club's year rolls over in June. */
export function currentAcademicYear(now = new Date()): string {
  const start = now.getUTCMonth() >= 5 ? now.getUTCFullYear() : now.getUTCFullYear() - 1
  return `${start}-${String((start + 1) % 100).padStart(2, '0')}`
}

// ── Team ─────────────────────────────────────────────────────────────────────

export const getTeam = cache(async (academicYear?: string): Promise<TeamMember[]> => {
  const payload = await client()
  const year = academicYear ?? currentAcademicYear()
  const [res, verticals] = await Promise.all([
    payload.find({
      collection: 'team-members',
      where: { and: [publishedWhere, { academicYear: { equals: year } }] },
      sort: 'displayOrder',
      limit: 200,
      depth: 1,
      overrideAccess: false,
    }),
    getVerticals(),
  ])

  const order = new Map(verticals.map((v) => [v.name, v.order]))

  return res.docs
    .map((doc): TeamMember => {
      return {
        id: String(doc.id ?? ''),
        slug: String(doc.slug ?? ''),
        name: String(doc.name ?? ''),
        role: String(doc.role ?? ''),
        vertical: str(doc.vertical),
        batch: str(doc.batch),
        photo: toImageRef(doc.photo),
        linkedin: str(doc.linkedin),
        academicYear: String(doc.academicYear ?? year),
        displayOrder: typeof doc.displayOrder === 'number' ? doc.displayOrder : 0,
        updatedAt: toIso(doc.updatedAt),
      }
    })
    .sort((a, b) => {
      // Vertical order comes from Site Settings; a member whose vertical is not listed
      // sorts last rather than disappearing.
      const av = order.get(a.vertical ?? '') ?? 999
      const bv = order.get(b.vertical ?? '') ?? 999
      return av !== bv ? av - bv : a.displayOrder - b.displayOrder
    })
})

export const getTeamYears = cache(async (): Promise<string[]> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'team-members',
    where: publishedWhere,
    limit: 1000,
    depth: 0,
    select: { academicYear: true },
    overrideAccess: false,
  })
  const years = new Set<string>()
  for (const d of res.docs) {
    const y = str(d.academicYear)
    if (y) years.add(y)
  }
  return [...years].sort().reverse()
})

export const getVerticals = cache(async (): Promise<Vertical[]> => {
  const settings = await settingsGlobal()
  const rows = settings.verticals ?? []
  return rows
    .map((v, i) => ({
      name: String(v.name ?? ''),
      description: str(v.description),
      order: typeof v.order === 'number' ? v.order : i,
    }))
    .filter((v) => v.name.length > 0)
    .sort((a, b) => a.order - b.order)
})

// ── Schemes ──────────────────────────────────────────────────────────────────

export const getVentureSchemes = cache(async (): Promise<VentureScheme[]> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'schemes',
    where: publishedWhere,
    sort: 'displayOrder',
    limit: 200,
    depth: 0,
    overrideAccess: false,
  })
  const now = Date.now()

  return res.docs.map((doc): VentureScheme => {
    const deadline = toIsoOrNull(doc.deadline)
    return {
      id: String(doc.id ?? ''),
      slug: String(doc.slug ?? ''),
      name: String(doc.name ?? ''),
      summary: String(doc.summary ?? ''),
      whoItIsFor: str(doc.whoItIsFor),
      whatYouGet: str(doc.whatYouGet),
      eligibility: str(doc.eligibility),
      applicationLink: str(doc.applicationLink),
      deadline,
      displayOrder: typeof doc.displayOrder === 'number' ? doc.displayOrder : 0,
      updatedAt: toIso(doc.updatedAt),
      // Expired schemes stay visible but de-emphasised — hiding them makes the page
      // look thinner than the programme actually is, and people search for them.
      isExpired: deadline ? new Date(deadline).getTime() < now : false,
    }
  })
})

export const getIimaVenturesContent = cache(async (): Promise<IimaVenturesBlock> => {
  const settings = await settingsGlobal()
  const block = settings.iimaVentures ?? {}
  return {
    overview: toRichText(block.overview),
    highlight: str(block.highlight),
    contactEmail: str(block.contactEmail),
    contactName: str(block.contactName),
    website: str(block.website),
    image: toImageRef(block.image),
  }
})

// ── Settings ─────────────────────────────────────────────────────────────────

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const settings = await settingsGlobal()
  const [verticals, iimaVentures] = await Promise.all([getVerticals(), getIimaVenturesContent()])

  const socialRows = settings.socialLinks ?? []
  const roleRows = settings.roleContacts ?? []
  const routingRows = settings.categoryRouting ?? []

  return {
    positioningStatement: String(settings.positioningStatement ?? ''),
    intro: toRichText(settings.intro),
    clubEmail: String(settings.clubEmail ?? ''),
    campusAddress: str(settings.campusAddress),
    socialLinks: socialRows
      .filter((s) => str(s.url))
      .map(
        (s): SocialLink => ({
          platform: (s.platform as SocialLink['platform']) ?? 'website',
          url: String(s.url),
          label: str(s.label),
        }),
      ),
    roleContacts: roleRows
      .filter((r) => str(r.email))
      .map(
        (r): RoleContact => ({
          role: String(r.role ?? ''),
          name: str(r.name),
          email: String(r.email),
          description: str(r.description),
        }),
      ),
    categoryRouting: routingRows
      .filter((r) => str(r.email))
      .map(
        (r): CategoryRoutingEntry => ({
          category: r.category as CategoryRoutingEntry['category'],
          email: String(r.email),
          vertical: str(r.vertical),
        }),
      ),
    verticals,
    iimaVentures,
    takedownEmail: str(settings.takedownEmail),
    youtubeChannelUrl: str(settings.youtubeChannelUrl),
    youtubeChannelId: str(settings.youtubeChannelId),
  }
})

export const getRoleContacts = cache(async (): Promise<RoleContact[]> => {
  return (await getSiteSettings()).roleContacts
})

/**
 * Homepage key numbers: counted live, with a per-stat override.
 *
 * Counting rather than storing means the figures cannot go stale, and the override
 * exists because "alumni network" is not something this database can know.
 */
export const getKeyNumbers = cache(async (): Promise<KeyNumbers> => {
  const payload = await client()
  const settings = await settingsGlobal()
  const kn = settings.keyNumbers ?? {}
  const now = new Date().toISOString()

  const [pastEvents, startups] = await Promise.all([
    payload.count({
      collection: 'events',
      where: { and: [publishedWhere, { endDateTime: { less_than: now } }] },
      overrideAccess: false,
    }),
    payload.count({
      collection: 'startups',
      where: {
        and: [publishedWhere, { 'listingApproval.approved': { equals: true } }],
      },
      overrideAccess: false,
    }),
  ])

  return {
    eventsHeld: num(kn.eventsHeldOverride) ?? pastEvents.totalDocs,
    startupsListed: num(kn.startupsListedOverride) ?? startups.totalDocs,
    alumniNetwork: num(kn.alumniNetwork),
    labels: {
      eventsHeld: str(kn.eventsHeldLabel) ?? 'Events held',
      startupsListed: str(kn.startupsListedLabel) ?? 'Ventures listed',
      alumniNetwork: str(kn.alumniNetworkLabel) ?? 'Alumni network',
    },
  }
})
