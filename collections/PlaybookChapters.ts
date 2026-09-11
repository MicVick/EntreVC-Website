import type { CollectionConfig } from 'payload'

import { isSignedIn, publishedOnly } from './access'
import { slugField } from './fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

/**
 * The playbook, chapter by chapter.
 *
 * [ASSUMPTION] Hybrid format: these web chapters are the SEO surface — the reason the
 * playbook is findable on a search engine at all — alongside an uploaded PDF for
 * download, set in Site Settings. No PDF is generated from these chapters.
 * EXECUTION_PLAN.md §3, decision 6.
 */
export const PlaybookChapters: CollectionConfig = {
  slug: 'playbook-chapters',
  labels: { singular: 'Playbook chapter', plural: 'Playbook chapters' },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['order', 'title', '_status'],
    description:
      'The web version of the EntreVC Startup Playbook. The downloadable PDF is set separately, in Site Settings.',
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
    afterChange: [revalidateAfterChange('playbook-chapters')],
    afterDelete: [revalidateAfterDelete('playbook-chapters')],
  },

  fields: [
    { name: 'title', type: 'text', required: true },
    slugField('title'),
    {
      name: 'order',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: {
        position: 'sidebar',
        description: 'Reading order. Lower numbers come first.',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      admin: { description: 'One line for the chapter index at the top of the page.' },
    },
    { name: 'body', type: 'richText' },
  ],
}

export default PlaybookChapters
