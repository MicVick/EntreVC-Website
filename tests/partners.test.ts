import { describe, expect, it } from 'vitest'

import { pathsFor } from '@/lib/revalidation'
import { PARTNER_KINDS, partnerKindLabels, partnerSchema } from '@/lib/schemas'

describe('partners', () => {
  it('accepts a partner without a logo or website', () => {
    const parsed = partnerSchema.safeParse({
      id: '1',
      name: 'IIMA Ventures',
      kind: 'institutional',
      logo: null,
      website: null,
      blurb: null,
      displayOrder: 1,
    })
    expect(parsed.success).toBe(true)
  })

  it('rejects an empty name and an unknown kind', () => {
    const base = { id: '1', logo: null, website: null, blurb: null, displayOrder: 1 }
    expect(partnerSchema.safeParse({ ...base, name: '', kind: 'sponsor' }).success).toBe(false)
    expect(partnerSchema.safeParse({ ...base, name: 'Acme', kind: 'friend' }).success).toBe(false)
  })

  it('has a label for every kind', () => {
    for (const kind of PARTNER_KINDS) expect(partnerKindLabels[kind]).toBeTruthy()
  })

  it('refreshes the homepage and About page when a partner changes', () => {
    expect(pathsFor('partners')).toEqual(expect.arrayContaining(['/', '/about']))
    expect(pathsFor('site-settings')).toContain('/about')
  })
})
