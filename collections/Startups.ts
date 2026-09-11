import type { CollectionConfig } from 'payload'
import { APIError } from 'payload'

import { isSignedIn, publishedOnly } from './access'
import { slugField } from './fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

/**
 * The venture directory — the credibility artifact for investors and mentors.
 *
 * Two rules here are not style choices, they are the PRD's privacy requirements made
 * mechanical:
 *
 *   1. A listing cannot be published without recorded written consent
 *      (`beforeChange` below throws otherwise).
 *   2. A founder's contact details are only ever published when that founder
 *      individually consented — enforced again in lib/content, which strips them.
 *
 * "Alumni ventures listed without permission" is a High-impact risk in the PRD. Both
 * gates are in the data layer precisely so a mistake in a component cannot cause it.
 */
export const Startups: CollectionConfig = {
  slug: 'startups',
  labels: { singular: 'Venture', plural: 'Ventures' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'stage', '_status'],
    description:
      'Ventures built by students and alumni. We list these on their behalf, so every listing needs the founder\'s written permission before it goes live.',
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
    afterChange: [revalidateAfterChange('startups')],
    afterDelete: [revalidateAfterDelete('startups')],
    beforeChange: [
      ({ data }) => {
        // The publish gate. Refusing here rather than warning in the UI means there is
        // no path to a published listing without consent on file — including via the
        // REST API or a script.
        if (data?._status === 'published' && data?.listingApproval?.approved !== true) {
          throw new APIError(
            'This venture cannot be published yet: tick "Written permission received" on the Permission tab first, and record who gave it. We list ventures on the founders\' behalf, so we need their consent on file.',
            400,
          )
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    slugField('name'),
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'student',
      options: [
        { label: 'Alumni venture', value: 'alumni' },
        { label: 'Student venture', value: 'student' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Show on the homepage.' },
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: 'The venture',
          fields: [
            {
              name: 'tagline',
              type: 'text',
              required: true,
              admin: {
                description:
                  'One line, plain language. This is what appears on the directory card — "Reconciliation infrastructure for Indian SMB payments", not "revolutionising fintech".',
              },
            },
            { name: 'logo', type: 'upload', relationTo: 'media' },
            {
              name: 'description',
              type: 'richText',
              admin: { description: 'What they do, in a short paragraph.' },
            },
            {
              name: 'story',
              type: 'richText',
              admin: {
                description: 'The founding story, for the venture\'s own page. Optional.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'sectors',
                  type: 'text',
                  hasMany: true,
                  admin: {
                    width: '50%',
                    description:
                      'e.g. Fintech, B2B SaaS. These become filters, so reuse existing wording rather than inventing a new label.',
                  },
                },
                {
                  name: 'stage',
                  type: 'select',
                  admin: { width: '50%' },
                  options: [
                    { label: 'Idea', value: 'idea' },
                    { label: 'Pre-seed', value: 'pre_seed' },
                    { label: 'Seed', value: 'seed' },
                    { label: 'Series A', value: 'series_a' },
                    { label: 'Series B+', value: 'series_b_plus' },
                    { label: 'Bootstrapped', value: 'bootstrapped' },
                    { label: 'Acquired', value: 'acquired' },
                  ],
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'foundedYear', type: 'number', admin: { width: '33%' } },
                { name: 'website', type: 'text', admin: { width: '33%' } },
                { name: 'linkedin', type: 'text', admin: { width: '34%', description: 'Company page.' } },
              ],
            },
          ],
        },
        {
          label: 'Founders',
          description:
            'Tick contact consent only for founders who have actually agreed to have their LinkedIn shown publicly. Where it is unticked, we store nothing publicly — the website strips it.',
          fields: [
            {
              name: 'founders',
              type: 'array',
              labels: { singular: 'Founder', plural: 'Founders' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { width: '60%' } },
                    {
                      name: 'batch',
                      type: 'text',
                      admin: { width: '40%', description: 'e.g. PGP 2018' },
                    },
                  ],
                },
                { name: 'photo', type: 'upload', relationTo: 'media' },
                {
                  name: 'contactConsent',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description:
                      'This founder has agreed we may show their contact link publicly.',
                  },
                },
                {
                  name: 'linkedin',
                  type: 'text',
                  admin: {
                    description: 'Only published when consent above is ticked.',
                    condition: (_, siblingData) => siblingData?.contactConsent === true,
                  },
                },
              ],
            },
          ],
        },
        {
          label: 'Permission',
          description:
            'We publish these listings on the founders\' behalf, so we keep a record of who agreed and when. A venture cannot be published until this is filled in.',
          fields: [
            {
              name: 'listingApproval',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'approved',
                  type: 'checkbox',
                  defaultValue: false,
                  label: 'Written permission received',
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'approvedBy',
                      type: 'text',
                      admin: {
                        width: '50%',
                        description: 'Who gave permission — the founder\'s name.',
                        condition: (_, sibling) => sibling?.approved === true,
                      },
                    },
                    {
                      name: 'approvedAt',
                      type: 'date',
                      admin: {
                        width: '50%',
                        description: 'When.',
                        condition: (_, sibling) => sibling?.approved === true,
                      },
                    },
                  ],
                },
                {
                  name: 'evidenceUrl',
                  type: 'text',
                  admin: {
                    description:
                      'Link to the email or form response, so the next team can find it without asking.',
                    condition: (_, sibling) => sibling?.approved === true,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default Startups
