import 'server-only'

import { cache } from 'react'

import { partnerKindSchema, partnerSchema, type Partner } from '@/lib/schemas'

import { client, str, toImageRef } from './payload'

/** Published partners, in display order. A row that fails validation is skipped, not fatal. */
export const getPartners = cache(async (): Promise<Partner[]> => {
  const payload = await client()
  const res = await payload.find({
    collection: 'partners',
    where: { _status: { equals: 'published' } },
    sort: 'displayOrder',
    limit: 100,
    depth: 1,
    overrideAccess: false,
  })

  return res.docs.flatMap((doc) => {
    const kind = partnerKindSchema.safeParse(doc.kind)
    const parsed = partnerSchema.safeParse({
      id: String(doc.id ?? ''),
      name: String(doc.name ?? '').trim(),
      kind: kind.success ? kind.data : 'ecosystem',
      logo: toImageRef(doc.logo),
      website: str(doc.website),
      blurb: str(doc.blurb),
      displayOrder: typeof doc.displayOrder === 'number' ? doc.displayOrder : 0,
    })
    return parsed.success ? [parsed.data] : []
  })
})
