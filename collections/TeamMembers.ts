import type { CollectionConfig } from 'payload'

import { isSignedIn, publishedOnly } from './access'
import { slugField } from './fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

/**
 * The club team, by academic year.
 *
 * The year field is what makes handover a lineage rather than a reset: last year's
 * roster stays permanently at /team/2025-26 instead of being overwritten. Rolling over
 * is duplicating last year's entries and editing them — an admin action, never a
 * migration.
 */
export const TeamMembers: CollectionConfig = {
  slug: 'team-members',
  labels: { singular: 'Team member', plural: 'Team' },
  defaultSort: 'displayOrder',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'role', 'vertical', 'academicYear', '_status'],
    description:
      'Who is on the team this year. To roll over at handover, duplicate last year\'s entries, change the year, and edit the names — the old roster stays online as an archive.',
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
    afterChange: [revalidateAfterChange('team-members')],
    afterDelete: [revalidateAfterDelete('team-members')],
  },

  fields: [
    { name: 'name', type: 'text', required: true },
    slugField('name'),
    {
      name: 'academicYear',
      type: 'text',
      required: true,
      // Defaults to the current academic year, which rolls in June — so someone adding
      // a member in August gets the right year without thinking about it.
      defaultValue: () => {
        const now = new Date()
        const startYear = now.getUTCMonth() >= 5 ? now.getUTCFullYear() : now.getUTCFullYear() - 1
        return `${startYear}-${String((startYear + 1) % 100).padStart(2, '0')}`
      },
      admin: {
        position: 'sidebar',
        description: 'Format: 2026-27. This decides which year\'s team page they appear on.',
      },
    },
    {
      name: 'displayOrder',
      type: 'number',
      required: true,
      defaultValue: 1,
      admin: {
        position: 'sidebar',
        description: 'Order within their vertical. Lower numbers appear first.',
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'role',
          type: 'text',
          required: true,
          admin: { width: '50%', description: 'e.g. Head of Events' },
        },
        {
          name: 'vertical',
          type: 'text',
          admin: {
            width: '50%',
            description:
              'Which sub-team, e.g. Events. Must match a vertical in Site Settings to be grouped correctly.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'batch', type: 'text', admin: { width: '50%', description: 'e.g. PGP 2027' } },
        { name: 'linkedin', type: 'text', admin: { width: '50%' } },
      ],
    },
    { name: 'photo', type: 'upload', relationTo: 'media' },
  ],
}

export default TeamMembers
