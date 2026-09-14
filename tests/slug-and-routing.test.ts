import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { slugify } from '@/collections/fields/slug'
import { resolveContactRecipient } from '@/lib/contact-routing'
import { client } from '@/lib/content/payload'
import type { CategoryRoutingEntry } from '@/lib/schemas'

/**
 * Slugs and contact routing — two pieces of plumbing whose failures are silent.
 *
 * A slug that regenerates on edit breaks every link already shared into a WhatsApp
 * group, and nobody finds out until an attendee reports a 404 on the morning of the
 * event. A routing table that resolves to the wrong mailbox loses enquiries with no
 * error anywhere. Neither shows up in a build, a typecheck or a page render.
 */

const PREFIX = 'test-slug-'

async function cleanup() {
  const payload = await client()
  await payload.delete({
    collection: 'events',
    where: { slug: { like: PREFIX } },
    overrideAccess: true,
  })
}

beforeAll(cleanup)
afterAll(cleanup)

function eventData(title: string, slug?: string) {
  const now = Date.now()
  return {
    title,
    ...(slug ? { slug } : {}),
    _status: 'published' as const,
    startDateTime: new Date(now + 7 * 86_400_000).toISOString(),
    endDateTime: new Date(now + 7 * 86_400_000 + 7_200_000).toISOString(),
    format: 'in_person' as const,
    venue: { name: 'Test Venue' },
    registrationEnabled: true,
  }
}

describe('slugify', () => {
  it('produces lowercase, hyphen-separated ASCII', () => {
    expect(slugify('VC Teardown 2026')).toBe('vc-teardown-2026')
    expect(slugify('Term Sheets: Decoded!')).toBe('term-sheets-decoded')
  })

  it('strips diacritics rather than dropping the letters', () => {
    // "Café" must not become "caf".
    expect(slugify('Café Session')).toBe('cafe-session')
    expect(slugify('Ngô Thanh')).toBe('ngo-thanh')
  })

  it('never leaves leading, trailing or doubled hyphens', () => {
    expect(slugify('  --Build   Weekend--  ')).toBe('build-weekend')
    expect(slugify('A // B')).toBe('a-b')
  })

  it('caps length so a very long title cannot produce an unusable URL', () => {
    const slug = slugify('word '.repeat(60))
    expect(slug.length).toBeLessThanOrEqual(80)
    expect(slug.startsWith('-')).toBe(false)
    expect(slug.endsWith('-')).toBe(false)
  })

  it('agrees with the slug schema’s own pattern', () => {
    const pattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    for (const title of ['VC Teardown 2026', 'Café Session', 'A // B', 'Ngô Thanh, Jr']) {
      expect(slugify(title)).toMatch(pattern)
    }
  })
})

describe('slug uniqueness is enforced by the database', () => {
  it('refuses a second document with the same slug', async () => {
    const payload = await client()
    const slug = `${PREFIX}duplicate`

    await payload.create({ collection: 'events', data: eventData('First', slug), overrideAccess: true })

    // The constraint must come from the collection, not from a check someone remembered
    // to write in one code path.
    await expect(
      payload.create({ collection: 'events', data: eventData('Second', slug), overrideAccess: true }),
    ).rejects.toThrow()
  })

  it('does not regenerate the slug when the title is edited', async () => {
    const payload = await client()
    const slug = `${PREFIX}stable`

    const created = await payload.create({
      collection: 'events',
      data: eventData('Original Title', slug),
      overrideAccess: true,
    })

    const updated = await payload.update({
      collection: 'events',
      id: created.id,
      data: { title: 'A Completely Different Title After A Typo Fix' },
      overrideAccess: true,
    })

    // This is the property that protects every link already shared.
    expect(updated.slug).toBe(slug)
  })

  it('fills the slug from the title when none is given', async () => {
    const payload = await client()
    const created = await payload.create({
      collection: 'events',
      data: eventData(`${PREFIX}Generated From Title`),
      overrideAccess: true,
    })

    expect(created.slug).toBe('test-slug-generated-from-title')
  })
})

describe('contact routing resolver', () => {
  const routing: CategoryRoutingEntry[] = [
    { category: 'sponsorship', email: 'sponsorship@entrevc.in', vertical: null },
    { category: 'startup_listing', email: 'ventures@entrevc.in', vertical: null },
    // A row an editor half-filled: present, but no address on it.
    { category: 'mentorship', email: '   ', vertical: null },
  ]

  it('sends a category to its configured mailbox', () => {
    expect(resolveContactRecipient({ category: 'sponsorship', routing })).toEqual({
      recipient: 'sponsorship@entrevc.in',
      source: 'category',
    })
  })

  it('prefers the admin-editable map over the environment', () => {
    // Re-routing sponsorship must never require a deploy.
    const result = resolveContactRecipient({
      category: 'sponsorship',
      routing,
      fallbackEmail: 'ops@example.com',
      clubEmail: 'hello@entrevc.in',
    })
    expect(result.recipient).toBe('sponsorship@entrevc.in')
  })

  it('falls back to the environment address for an unmapped category', () => {
    expect(
      resolveContactRecipient({ category: 'speaking', routing, fallbackEmail: 'ops@example.com' }),
    ).toEqual({ recipient: 'ops@example.com', source: 'fallback' })
  })

  it('falls back to the club address when nothing else is set', () => {
    expect(
      resolveContactRecipient({ category: 'speaking', routing, clubEmail: 'hello@entrevc.in' }),
    ).toEqual({ recipient: 'hello@entrevc.in', source: 'club' })
  })

  it('treats a blank configured address as unconfigured', () => {
    // The half-filled mentorship row must not win and send mail to nowhere.
    expect(
      resolveContactRecipient({ category: 'mentorship', routing, clubEmail: 'hello@entrevc.in' }),
    ).toEqual({ recipient: 'hello@entrevc.in', source: 'club' })
  })

  it('reports "none" rather than inventing a recipient', () => {
    expect(resolveContactRecipient({ category: 'general', routing: [] })).toEqual({
      recipient: null,
      source: 'none',
    })
  })
})
