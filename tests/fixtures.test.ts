import { describe, expect, it } from 'vitest'

import {
  eventFixtures,
  playbookChapterFixtures,
  playbookMetaFixture,
  resourceFixtures,
  schemeFixtures,
  siteSettingsFixture,
  startupFixtures,
  teamMemberFixtures,
} from '@/lib/fixtures'
import {
  eventSchema,
  playbookChapterSchema,
  playbookMetaSchema,
  resourceSchema,
  siteSettingsSchema,
  startupSchema,
  teamMemberSchema,
  ventureSchemeSchema,
} from '@/lib/schemas'

/**
 * Every fixture must satisfy the real schema.
 *
 * This is the guarantee behind CONTRACT.md §2: Agent B builds against fixtures, so a
 * fixture that would not validate in production is a trap — B would build a page
 * against a shape that can never occur. Catching it here costs a second; catching it
 * on launch day costs a rewrite.
 */
describe('fixtures satisfy their schemas', () => {
  const cases = [
    ['events', eventSchema, eventFixtures],
    ['startups', startupSchema, startupFixtures],
    ['resources', resourceSchema, resourceFixtures],
    ['playbook chapters', playbookChapterSchema, playbookChapterFixtures],
    ['schemes', ventureSchemeSchema, schemeFixtures],
    ['team members', teamMemberSchema, teamMemberFixtures],
  ] as const

  for (const [name, schema, items] of cases) {
    it(`${name} all parse`, () => {
      for (const item of items) {
        const result = schema.safeParse(item)
        if (!result.success) {
          throw new Error(
            `${name} fixture failed:\n${JSON.stringify(result.error.issues, null, 2)}`,
          )
        }
      }
      expect(items.length).toBeGreaterThan(0)
    })
  }

  it('site settings parses', () => {
    expect(siteSettingsSchema.safeParse(siteSettingsFixture).success).toBe(true)
  })

  it('playbook meta parses', () => {
    expect(playbookMetaSchema.safeParse(playbookMetaFixture).success).toBe(true)
  })
})

describe('fixtures cover the states Agent B has to render', () => {
  it('has an event at capacity, one past its deadline, and one uncapped', () => {
    expect(eventFixtures.some((e) => e.capacity !== null)).toBe(true)
    expect(eventFixtures.some((e) => e.capacity === null)).toBe(true)
    expect(eventFixtures.some((e) => e.isRegistrationClosed)).toBe(true)
  })

  it('has both upcoming and past events, and a past one with a recap', () => {
    const now = Date.now()
    const past = eventFixtures.filter((e) => new Date(e.endDateTime).getTime() < now)
    const upcoming = eventFixtures.filter((e) => new Date(e.endDateTime).getTime() >= now)
    expect(past.length).toBeGreaterThan(0)
    expect(upcoming.length).toBeGreaterThan(0)
    expect(past.some((e) => e.recap !== null)).toBe(true)
    // The state that is easiest to forget to design for.
    expect(past.some((e) => e.recap === null)).toBe(true)
  })

  it('has an event with the maximum three custom questions', () => {
    expect(eventFixtures.some((e) => e.registrationFields.length === 3)).toBe(true)
    // The cap is a schema rule, not a convention.
    expect(eventFixtures.every((e) => e.registrationFields.length <= 3)).toBe(true)
  })

  it('has events with no hero image and no venue', () => {
    expect(eventFixtures.some((e) => e.heroImage === null)).toBe(true)
    expect(eventFixtures.some((e) => e.venue === null)).toBe(true)
  })

  it('has startups of both types, some without a logo or website', () => {
    expect(startupFixtures.some((s) => s.type === 'alumni')).toBe(true)
    expect(startupFixtures.some((s) => s.type === 'student')).toBe(true)
    expect(startupFixtures.some((s) => s.logo === null)).toBe(true)
    expect(startupFixtures.some((s) => s.website === null)).toBe(true)
  })

  it('has a venture whose founders gave no contact consent', () => {
    // PRD §7: contact details must never be published without written approval, so
    // at least one fixture must exercise the stripped path.
    expect(
      startupFixtures.some((s) => s.founders.length > 0 && s.founders.every((f) => f.linkedin === null)),
    ).toBe(true)
  })

  it('covers every resource type', () => {
    const types = new Set(resourceFixtures.map((r) => r.type))
    expect(types.size).toBeGreaterThanOrEqual(5)
  })

  it('has schemes with a deadline, without one, and expired', () => {
    expect(schemeFixtures.some((s) => s.deadline !== null && !s.isExpired)).toBe(true)
    expect(schemeFixtures.some((s) => s.deadline === null)).toBe(true)
    expect(schemeFixtures.some((s) => s.isExpired)).toBe(true)
  })

  it('has two academic years of team members and a member with no photo', () => {
    const years = new Set(teamMemberFixtures.map((m) => m.academicYear))
    expect(years.size).toBeGreaterThanOrEqual(2)
    expect(teamMemberFixtures.some((m) => m.photo === null)).toBe(true)
    expect(teamMemberFixtures.some((m) => m.linkedin === null)).toBe(true)
  })

  it('has slugs that are unique within each collection', () => {
    const unique = <T extends { slug: string }>(items: T[]) =>
      new Set(items.map((i) => i.slug)).size === items.length
    expect(unique(eventFixtures)).toBe(true)
    expect(unique(startupFixtures)).toBe(true)
    expect(unique(resourceFixtures)).toBe(true)
    expect(unique(schemeFixtures)).toBe(true)
    expect(unique(teamMemberFixtures)).toBe(true)
  })

  it('gives every image alt text', () => {
    // `alt` is required at the type level, but a whitespace-only string would slip
    // through TypeScript and defeat the accessibility guarantee.
    for (const e of eventFixtures) {
      if (e.heroImage) expect(e.heroImage.alt.trim().length).toBeGreaterThan(0)
      for (const g of e.recap?.gallery ?? []) expect(g.alt.trim().length).toBeGreaterThan(0)
    }
    for (const s of startupFixtures) {
      if (s.logo) expect(s.logo.alt.trim().length).toBeGreaterThan(0)
    }
  })
})
