import type { CollectionConfig } from 'payload'

import { isSignedIn, publishedOnly } from './access'
import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

/**
 * Organisations the club works with: sponsors, the institute's incubator, other
 * campuses' clubs, media partners. They appear as a logo wall on the homepage and the
 * About page. Adding one is a two-minute job: name, kind, logo, publish.
 */
export const Partners: CollectionConfig = {
  slug: 'partners',
  labels: { singular: 'Partner', plural: 'Partners' },
  defaultSort: 'displayOrder',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'kind', 'displayOrder', '_status'],
    description:
      'Sponsors and organisations EntreVC works with. Published partners appear on the homepage. When a partnership ends, unpublish it rather than deleting it, so it can come back next year.',
    group: 'Content',
  },
  access: {
    read: publishedOnly,
    create: isSignedIn,
    update: isSignedIn,
    delete: isSignedIn,
  },
  versions: { drafts: true, maxPerDoc: 20 },
  hooks: {
    afterChange: [revalidateAfterChange('partners')],
    afterDelete: [revalidateAfterDelete('partners')],
  },

  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'The organisation’s name as they write it, e.g. “IIMA Ventures”.' },
    },
    {
      name: 'kind',
      label: 'Kind of partner',
      type: 'select',
      required: true,
      defaultValue: 'ecosystem',
      options: [
        { label: 'Institutional partner (the institute, its incubator, other campuses)', value: 'institutional' },
        { label: 'Sponsor (pays for an event or the year)', value: 'sponsor' },
        { label: 'Ecosystem partner (funds, accelerators, startup programmes)', value: 'ecosystem' },
        { label: 'Knowledge partner (firms that run sessions or judge)', value: 'knowledge' },
        { label: 'Community partner (other clubs and founder groups)', value: 'community' },
        { label: 'Media partner', value: 'media' },
      ],
      admin: { description: 'Shown as a small label under the logo.' },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description:
          'A PNG or SVG with a transparent background works best: logos sit on a white tile. Leave empty and the name is shown in type instead.',
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: { description: 'Optional. The full address, starting with https://. The logo links here.' },
    },
    {
      name: 'blurb',
      label: 'What we do together',
      type: 'text',
      maxLength: 120,
      admin: { description: 'Optional, one short line, e.g. “Co-hosts EntreFair”. Shown on the About page.' },
    },
    {
      name: 'displayOrder',
      type: 'number',
      required: true,
      defaultValue: 10,
      admin: { position: 'sidebar', description: 'Lower numbers appear first. Put your biggest partners first.' },
    },
  ],
}

export default Partners
