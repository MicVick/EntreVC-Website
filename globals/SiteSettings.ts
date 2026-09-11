import type { GlobalConfig } from 'payload'

import { anyone, isSignedIn } from '@/collections/access'
import { revalidateSiteSettings } from '@/collections/hooks/revalidate'

/**
 * Everything about the site that is not a piece of content.
 *
 * The category routing map lives here for a specific reason: the PRD requires that
 * changing which mailbox an enquiry goes to needs no deploy. It is read at request time
 * by POST /api/contact, so an edit here takes effect on the next submission.
 */
export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site settings',
  admin: {
    description:
      'The club\'s details, contact routing and homepage numbers. Worth a look at handover — see the annual checklist.',
    group: 'Settings',
  },
  access: {
    read: anyone,
    update: isSignedIn,
  },
  hooks: {
    afterChange: [revalidateSiteSettings],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Homepage',
          fields: [
            {
              name: 'positioningStatement',
              type: 'textarea',
              required: true,
              admin: {
                description:
                  'The first thing a visitor reads. One or two sentences on what EntreVC is.',
              },
            },
            { name: 'intro', type: 'richText', admin: { description: 'A short paragraph under it.' } },
            {
              name: 'keyNumbers',
              type: 'group',
              label: 'Key numbers',
              admin: {
                description:
                  'Events held and ventures listed are counted automatically from the site. Fill in an override only if you need a different figure.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'eventsHeldOverride',
                      type: 'number',
                      admin: { width: '50%', description: 'Leave empty to count automatically.' },
                    },
                    {
                      name: 'eventsHeldLabel',
                      type: 'text',
                      defaultValue: 'Events held',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'startupsListedOverride',
                      type: 'number',
                      admin: { width: '50%', description: 'Leave empty to count automatically.' },
                    },
                    {
                      name: 'startupsListedLabel',
                      type: 'text',
                      defaultValue: 'Ventures listed',
                      admin: { width: '50%' },
                    },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'alumniNetwork',
                      type: 'number',
                      admin: {
                        width: '50%',
                        description: 'The site cannot count this one — set it by hand.',
                      },
                    },
                    {
                      name: 'alumniNetworkLabel',
                      type: 'text',
                      defaultValue: 'Alumni network',
                      admin: { width: '50%' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Contact & routing',
          fields: [
            {
              name: 'clubEmail',
              type: 'email',
              required: true,
              admin: { description: 'The club\'s main address.' },
            },
            { name: 'campusAddress', type: 'textarea' },
            {
              name: 'takedownEmail',
              type: 'email',
              admin: {
                description:
                  'Where someone writes to ask for their venture listing to be removed. This must be a working address — we publish listings on founders\' behalf, so there has to be a route back.',
              },
            },
            {
              name: 'categoryRouting',
              type: 'array',
              label: 'Where enquiries go',
              admin: {
                description:
                  'Each contact-form category forwards to one mailbox. Change these at handover and enquiries follow the new team immediately — no developer needed.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'category',
                      type: 'select',
                      required: true,
                      admin: { width: '40%' },
                      options: [
                        { label: 'General enquiry', value: 'general' },
                        { label: 'Events', value: 'event' },
                        { label: 'Startup listing', value: 'startup_listing' },
                        { label: 'Sponsorship', value: 'sponsorship' },
                        { label: 'Speaking invitation', value: 'speaking' },
                        { label: 'Mentorship', value: 'mentorship' },
                      ],
                    },
                    { name: 'email', type: 'email', required: true, admin: { width: '35%' } },
                    { name: 'vertical', type: 'text', admin: { width: '25%' } },
                  ],
                },
              ],
            },
            {
              name: 'roleContacts',
              type: 'array',
              label: 'Named contacts',
              admin: {
                description:
                  'Shown on the contact page, so nobody has to guess who to email about sponsorship.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'role', type: 'text', required: true, admin: { width: '35%' } },
                    { name: 'name', type: 'text', admin: { width: '30%' } },
                    { name: 'email', type: 'email', required: true, admin: { width: '35%' } },
                  ],
                },
                { name: 'description', type: 'text', admin: { description: 'When to use this contact.' } },
              ],
            },
            {
              name: 'socialLinks',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      admin: { width: '35%' },
                      options: [
                        { label: 'LinkedIn', value: 'linkedin' },
                        { label: 'Instagram', value: 'instagram' },
                        { label: 'X', value: 'x' },
                        { label: 'YouTube', value: 'youtube' },
                        { label: 'Substack', value: 'substack' },
                        { label: 'Website', value: 'website' },
                      ],
                    },
                    { name: 'url', type: 'text', required: true, admin: { width: '45%' } },
                    { name: 'label', type: 'text', admin: { width: '20%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Structure',
          fields: [
            {
              name: 'verticals',
              type: 'array',
              label: 'Verticals',
              admin: {
                description:
                  'The club\'s sub-teams. These group the team page and draw the structure diagram, so it updates itself when you reorganise. The vertical name on a team member must match one of these exactly.',
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { width: '40%' } },
                    { name: 'order', type: 'number', required: true, defaultValue: 1, admin: { width: '20%' } },
                    { name: 'description', type: 'text', admin: { width: '40%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'IIMA Ventures',
          description:
            'The block at the top of the IIMA Ventures page. The schemes themselves are edited separately.',
          fields: [
            {
              name: 'iimaVentures',
              type: 'group',
              label: false,
              fields: [
                { name: 'overview', type: 'richText' },
                {
                  name: 'highlight',
                  type: 'text',
                  admin: { description: 'One striking fact, e.g. "Over 1,600 ventures supported since 2002."' },
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'contactName', type: 'text', admin: { width: '50%' } },
                    { name: 'contactEmail', type: 'email', admin: { width: '50%' } },
                  ],
                },
                { name: 'website', type: 'text' },
                { name: 'image', type: 'upload', relationTo: 'media' },
              ],
            },
          ],
        },
        {
          label: 'Playbook & media',
          fields: [
            {
              name: 'playbook',
              type: 'group',
              fields: [
                { name: 'title', type: 'text', defaultValue: 'The EntreVC Startup Playbook' },
                { name: 'intro', type: 'richText' },
                {
                  name: 'pdf',
                  type: 'upload',
                  relationTo: 'media',
                  admin: {
                    description:
                      'The downloadable PDF. The chaptered web version is edited under Playbook chapters.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                { name: 'youtubeChannelUrl', type: 'text', admin: { width: '50%' } },
                {
                  name: 'youtubeChannelId',
                  type: 'text',
                  admin: { width: '50%', description: 'Needed to show the latest videos automatically.' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default SiteSettings
