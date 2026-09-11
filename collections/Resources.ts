import type { CollectionConfig } from 'payload'

import { isSignedIn, publishedOnly } from './access'
import { slugField } from './fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

/**
 * The curated library — what makes the site worth returning to between events.
 *
 * Gating was cut from V1, so every resource here is directly usable: one click from
 * the list to the source, no email interstitial.
 */
export const Resources: CollectionConfig = {
  slug: 'resources',
  labels: { singular: 'Resource', plural: 'Resources' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'publishedAt', '_status'],
    description:
      'Articles, books, podcasts, reports, videos and templates worth keeping. Either link out to something, or upload a file.',
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
    afterChange: [revalidateAfterChange('resources')],
    afterDelete: [revalidateAfterDelete('resources')],
  },

  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'article',
      options: [
        { label: 'Article', value: 'article' },
        { label: 'Book', value: 'book' },
        { label: 'Podcast', value: 'podcast' },
        { label: 'Report', value: 'report' },
        { label: 'Video', value: 'video' },
        { label: 'Template', value: 'template' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        position: 'sidebar',
        description: 'Used for ordering. Defaults to today.',
      },
      defaultValue: () => new Date().toISOString(),
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'One or two lines on why this is worth someone\'s time.',
      },
    },
    {
      name: 'author',
      type: 'text',
      admin: { description: 'Who made it. Optional.' },
    },
    {
      name: 'linkType',
      type: 'radio',
      defaultValue: 'external',
      options: [
        { label: 'Link to somewhere else', value: 'external' },
        { label: 'Upload a file', value: 'file' },
      ],
      admin: { layout: 'horizontal' },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        description: 'The full web address, including https://',
        condition: (data) => data?.linkType !== 'file',
      },
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      admin: { condition: (data) => data?.linkType === 'file' },
    },
    { name: 'coverImage', type: 'upload', relationTo: 'media' },
    {
      name: 'tags',
      type: 'text',
      hasMany: true,
      admin: {
        description:
          'e.g. fundraising, metrics, getting started. Tags become filters — reuse existing ones rather than inventing near-duplicates.',
      },
    },
  ],
}

export default Resources
