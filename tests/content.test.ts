import { describe, expect, it } from 'vitest'

import {
  getAllEventSlugs,
  getEventBySlug,
  getEventTypes,
  getFeaturedStartups,
  getKeyNumbers,
  getPastEvents,
  getPlaybookChapters,
  getResources,
  getSiteSettings,
  getStartupFacets,
  getStartups,
  getTeam,
  getTeamYears,
  getUpcomingEvents,
  getVentureSchemes,
} from '@/lib/content'
import { eventSchema, startupSchema, teamMemberSchema, ventureSchemeSchema } from '@/lib/schemas'

/**
 * The content layer, against a real seeded database.
 *
 * Requires `npm run seed` first. These are the guarantees CONTRACT.md §4 makes to
 * Agent B — if any of them breaks, pages built on this layer break silently, which is
 * the worst failure mode available in this architecture.
 */
describe('content layer returns published content only', () => {
  it('hides the draft event from every event read', async () => {
    const [upcoming, past, slugs] = await Promise.all([
      getUpcomingEvents(),
      getPastEvents(),
      getAllEventSlugs(),
    ])
    const all = [...upcoming, ...past].map((e) => e.slug)
    expect(all).not.toContain('unannounced-speaker-session')
    expect(slugs).not.toContain('unannounced-speaker-session')
    expect(await getEventBySlug('unannounced-speaker-session')).toBeNull()
  })

  it('hides the venture that has no listing consent', async () => {
    const startups = await getStartups()
    expect(startups.map((s) => s.slug)).not.toContain('quietly-waiting')
  })

  it('never publishes a founder contact link without that founder’s consent', async () => {
    // KisanQuery's founders both withheld consent. The link must be absent from the
    // returned data, not merely hidden by a component.
    const startups = await getStartups()
    const kisan = startups.find((s) => s.slug === 'kisanquery')
    expect(kisan).toBeDefined()
    expect(kisan!.founders.length).toBeGreaterThan(0)
    expect(kisan!.founders.every((f) => f.linkedin === null)).toBe(true)

    // And the consenting case still works, or the gate would be uselessly strict.
    const paylane = startups.find((s) => s.slug === 'paylane')
    expect(paylane!.founders.some((f) => f.linkedin !== null)).toBe(true)
    expect(paylane!.founders.some((f) => f.linkedin === null)).toBe(true)
  })
})

describe('content layer shapes match the frozen schemas', () => {
  it('events parse', async () => {
    const events = await getUpcomingEvents()
    expect(events.length).toBeGreaterThan(0)
    for (const e of events) {
      const parsed = eventSchema.safeParse(e)
      if (!parsed.success) throw new Error(JSON.stringify(parsed.error.issues, null, 2))
    }
  })

  it('startups, schemes and team parse', async () => {
    for (const s of await getStartups()) expect(startupSchema.safeParse(s).success).toBe(true)
    for (const s of await getVentureSchemes()) expect(ventureSchemeSchema.safeParse(s).success).toBe(true)
    for (const m of await getTeam()) expect(teamMemberSchema.safeParse(m).success).toBe(true)
  })

  it('returns ISO strings, not Date objects', async () => {
    // Date objects do not survive the server/client boundary; this is the guarantee
    // that stops Agent B hitting a serialisation error at render time.
    const [event] = await getUpcomingEvents({ limit: 1 })
    expect(typeof event!.startDateTime).toBe('string')
    expect(new Date(event!.startDateTime).toString()).not.toBe('Invalid Date')
  })

  it('converts rich text to sanitised html plus plaintext', async () => {
    const [event] = await getUpcomingEvents({ limit: 1 })
    expect(typeof event!.description.html).toBe('string')
    expect(typeof event!.description.plainText).toBe('string')
    expect(event!.description.plainText).not.toContain('<')
  })
})

describe('content layer ordering and computed fields', () => {
  it('sorts upcoming ascending and past descending', async () => {
    const upcoming = await getUpcomingEvents()
    const past = await getPastEvents()
    const asc = [...upcoming].sort(
      (a, b) => +new Date(a.startDateTime) - +new Date(b.startDateTime),
    )
    const desc = [...past].sort((a, b) => +new Date(b.startDateTime) - +new Date(a.startDateTime))
    expect(upcoming.map((e) => e.slug)).toEqual(asc.map((e) => e.slug))
    expect(past.map((e) => e.slug)).toEqual(desc.map((e) => e.slug))
  })

  it('marks past events past, and closes their registration', async () => {
    for (const e of await getPastEvents()) {
      expect(e.isPast).toBe(true)
      expect(e.isRegistrationClosed).toBe(true)
    }
    for (const e of await getUpcomingEvents()) expect(e.isPast).toBe(false)
  })

  it('closes registration on an event whose deadline has passed', async () => {
    const fireside = await getEventBySlug('founder-fireside-march')
    expect(fireside).not.toBeNull()
    expect(fireside!.isPast).toBe(false)
    expect(fireside!.isRegistrationClosed).toBe(true) // deadline in the past
  })

  it('flags recap mode only where a recap exists', async () => {
    const withRecap = await getEventBySlug('entrefair-2025')
    const withoutRecap = await getEventBySlug('alumni-founders-panel')
    expect(withRecap!.hasRecap).toBe(true)
    expect(withRecap!.recap!.gallery.length).toBeGreaterThan(0)
    expect(withoutRecap!.hasRecap).toBe(false)
    expect(withoutRecap!.recap).toBeNull()
  })

  it('returns no venue for an online event rather than an empty one', async () => {
    const online = await getEventBySlug('term-sheets-decoded-online')
    expect(online!.format).toBe('online')
    expect(online!.venue).toBeNull()
    expect(online!.capacity).toBeNull() // uncapped
  })

  it('caps custom registration questions at three', async () => {
    const build = await getEventBySlug('build-weekend-2026')
    expect(build!.registrationFields.length).toBe(3)
    expect(build!.registrationFields.every((f) => f.id.length > 0)).toBe(true)
  })
})

describe('facets and settings', () => {
  it('offers only facet values that match something', async () => {
    const [facets, startups] = await Promise.all([getStartupFacets(), getStartups()])
    for (const sector of facets.sectors) {
      expect(startups.some((s) => s.sectors.includes(sector))).toBe(true)
    }
    for (const stage of facets.stages) {
      expect(startups.some((s) => s.stage === stage)).toBe(true)
    }
  })

  it('orders stages by funding progression, not alphabetically', async () => {
    const { stages } = await getStartupFacets()
    const seedIdx = stages.indexOf('seed')
    const seriesAIdx = stages.indexOf('series_a')
    if (seedIdx !== -1 && seriesAIdx !== -1) expect(seedIdx).toBeLessThan(seriesAIdx)
  })

  it('counts key numbers live from published content', async () => {
    const [numbers, past, startups] = await Promise.all([
      getKeyNumbers(),
      getPastEvents(),
      getStartups(),
    ])
    expect(numbers.eventsHeld).toBe(past.length)
    expect(numbers.startupsListed).toBe(startups.length)
    // Not countable from the database — comes from the admin override.
    expect(numbers.alumniNetwork).toBeGreaterThan(0)
  })

  it('loads settings, verticals and routing', async () => {
    const settings = await getSiteSettings()
    expect(settings.clubEmail).toContain('@')
    expect(settings.verticals.length).toBeGreaterThan(0)
    expect(settings.categoryRouting.length).toBeGreaterThan(0)
    // Every contact-form category must route somewhere, or an enquiry vanishes.
    expect(settings.categoryRouting.every((r) => r.email.includes('@'))).toBe(true)
  })

  it('groups the team by vertical order then display order', async () => {
    const [team, settings] = await Promise.all([getTeam(), getSiteSettings()])
    const order = new Map(settings.verticals.map((v) => [v.name, v.order]))
    let previous = -Infinity
    for (const m of team) {
      const current = order.get(m.vertical ?? '') ?? 999
      expect(current).toBeGreaterThanOrEqual(previous)
      previous = current
    }
  })

  it('exposes more than one academic year for the archive', async () => {
    const years = await getTeamYears()
    expect(years.length).toBeGreaterThanOrEqual(2)
    expect(years[0]! > years[1]!).toBe(true) // newest first
  })

  it('returns resources, schemes and playbook chapters in order', async () => {
    expect((await getResources()).length).toBeGreaterThan(0)
    expect((await getFeaturedStartups()).every((s) => s.featured)).toBe(true)
    expect((await getEventTypes()).length).toBeGreaterThan(0)

    const chapters = await getPlaybookChapters()
    expect(chapters.length).toBeGreaterThan(0)
    expect(chapters.map((c) => c.order)).toEqual([...chapters.map((c) => c.order)].sort((a, b) => a - b))

    const schemes = await getVentureSchemes()
    expect(schemes.some((s) => s.isExpired)).toBe(true) // expired stays visible
    expect(schemes.some((s) => s.deadline === null)).toBe(true) // rolling
  })
})
