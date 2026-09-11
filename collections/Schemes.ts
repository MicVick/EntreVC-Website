import type { CollectionConfig } from 'payload'

import { isSignedIn, publishedOnly } from './access'
import { slugField } from './fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

/**
 * IIMA Ventures schemes available to IIMA students — an explicit ask in the club brief.
 *
 * This content is supplied and approved by IIMA Ventures; the club republishes it. If a
 * scheme's terms change and nobody updates this, a student applies on wrong
 * information — so the PRD asks for a named owner on the IIMA Ventures side.
 */
export const Schemes: CollectionConfig = {
  slug: 'schemes',
  labels: { singular: 'Scheme', plural: 'IIMA Ventures schemes' },
  defaultSort: 'displayOrder',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'deadline', 'displayOrder', '_status'],
    description:
      'Programmes, grants and facilities IIMA students can apply to. Check these against the IIMA Ventures site at the start of each term — a student applying on out-of-date terms is worse than no listing.',
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
    afterChange: [revalidateAfterChange('schemes')],
    afterDelete: [revalidateAfterDelete('schemes')],
  },

  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    {
      name: 'displayOrder',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
    {
      name: 'deadline',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly' },
        description:
          'Leave empty if applications are rolling. Past deadlines stay visible but are shown greyed out, so nobody applies to something closed.',
      },
    },
    {
      name: 'summary',
      type: 'textarea',
      required: true,
      admin: { description: 'One or two lines — what this scheme is, in plain language.' },
    },
    {
      name: 'whoItIsFor',
      type: 'textarea',
      admin: { description: 'Who should apply.' },
    },
    {
      name: 'whatYouGet',
      type: 'textarea',
      admin: { description: 'Money, space, mentorship, introductions — be specific.' },
    },
    {
      name: 'eligibility',
      type: 'textarea',
      admin: { description: 'The conditions someone must meet.' },
    },
    {
      name: 'applicationLink',
      type: 'text',
      admin: { description: 'Where to apply. Leave empty if there is no online form.' },
    },
  ],
}

export default Schemes
