import type { CollectionConfig } from 'payload'

import { isSignedIn, publishedOnly } from './access'
import { slugField } from './fields/slug'
import { revalidateAfterChange, revalidateAfterDelete } from './hooks/revalidate'

/**
 * Events — the highest-frequency job on the site, in both directions: a student
 * registering from a WhatsApp link, and a club member publishing at 1 a.m. from a
 * phone before an event.
 *
 * Fields are grouped into tabs so the essential ones (title, date, venue, poster) come
 * first and the rest can be ignored. An event should be publishable having touched
 * only the Details tab.
 */
export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Event', plural: 'Events' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'startDateTime', 'eventType', '_status'],
    description:
      'Everything the club runs. Save as a draft while you work; nothing is public until you hit Publish. Past events move to the Past tab on the website automatically — you never have to tidy up.',
    livePreview: undefined,
    group: 'Content',
  },
  access: {
    read: publishedOnly,
    create: isSignedIn,
    update: isSignedIn,
    delete: isSignedIn,
  },
  versions: {
    drafts: true,
    // Version history, free. PRD asked for "the last 20 changes per document".
    maxPerDoc: 20,
  },
  hooks: {
    afterChange: [revalidateAfterChange('events')],
    afterDelete: [revalidateAfterDelete('events')],
  },

  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: { description: 'The name of the event, as it should appear everywhere.' },
    },
    slugField('title'),
    {
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
        description: 'Highlight this event on the homepage.',
      },
    },
    {
      type: 'tabs',
      tabs: [
        // ── Details ──────────────────────────────────────────────────────────
        {
          label: 'Details',
          description: 'Fill these in and you can publish. Everything else is optional.',
          fields: [
            {
              name: 'subtitle',
              type: 'text',
              admin: { description: 'One line under the title. Optional.' },
            },
            {
              name: 'description',
              type: 'richText',
              admin: { description: 'What the event is and who it is for.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'startDateTime',
                  type: 'date',
                  required: true,
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayAndTime' },
                    description: 'Start, in India time.',
                  },
                },
                {
                  name: 'endDateTime',
                  type: 'date',
                  required: true,
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayAndTime' },
                    description:
                      'End, in India time. The event moves to Past on the website once this passes.',
                  },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'format',
                  type: 'select',
                  required: true,
                  defaultValue: 'in_person',
                  options: [
                    { label: 'In person', value: 'in_person' },
                    { label: 'Online', value: 'online' },
                    { label: 'Hybrid', value: 'hybrid' },
                  ],
                  admin: { width: '50%' },
                },
                {
                  name: 'eventType',
                  type: 'text',
                  admin: {
                    width: '50%',
                    description:
                      'Category, e.g. "Speaker series", "Workshop". Becomes a filter on the events page, so reuse the same wording.',
                  },
                },
              ],
            },
            {
              name: 'venue',
              type: 'group',
              admin: {
                description: 'Where it happens.',
                condition: (data) => data?.format !== 'online',
              },
              fields: [
                { name: 'name', type: 'text', admin: { description: 'e.g. Ravi J. Matthai Auditorium' } },
                { name: 'address', type: 'textarea' },
                {
                  name: 'mapLink',
                  type: 'text',
                  admin: { description: 'A Google Maps link, so people can navigate in one tap.' },
                },
              ],
            },
            {
              name: 'onlineJoinUrl',
              type: 'text',
              admin: {
                description:
                  'Meeting link. Only sent to people who register — it is never shown publicly.',
                condition: (data) => data?.format !== 'in_person',
              },
            },
            {
              name: 'heroImage',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'The poster. This is also the preview image when the link is shared on WhatsApp or LinkedIn, so use something readable at thumbnail size.',
              },
            },
          ],
        },

        // ── Speakers & agenda ────────────────────────────────────────────────
        {
          label: 'Speakers & agenda',
          fields: [
            {
              name: 'speakers',
              type: 'array',
              labels: { singular: 'Speaker', plural: 'Speakers' },
              admin: { description: 'Leave empty if the event has no named speakers.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
                    { name: 'title', type: 'text', admin: { width: '50%', description: 'e.g. Partner' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'org', type: 'text', admin: { width: '50%', description: 'Company or fund.' } },
                    { name: 'linkedin', type: 'text', admin: { width: '50%' } },
                  ],
                },
                { name: 'photo', type: 'upload', relationTo: 'media' },
                { name: 'bio', type: 'richText' },
              ],
            },
            {
              name: 'agenda',
              type: 'array',
              labels: { singular: 'Agenda item', plural: 'Agenda' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'time',
                      type: 'text',
                      required: true,
                      admin: { width: '30%', description: 'e.g. 18:30, or "Sat 09:00" for a multi-day event.' },
                    },
                    { name: 'title', type: 'text', required: true, admin: { width: '70%' } },
                  ],
                },
                { name: 'description', type: 'textarea' },
                {
                  name: 'speakerNames',
                  type: 'text',
                  hasMany: true,
                  admin: {
                    description: 'Names, matching the Speakers above exactly, to link the two.',
                  },
                },
              ],
            },
          ],
        },

        // ── Registration ─────────────────────────────────────────────────────
        {
          label: 'Registration',
          description:
            'Registration closes automatically at the deadline, and again when the event ends. You never have to close it by hand.',
          fields: [
            {
              name: 'registrationEnabled',
              type: 'checkbox',
              defaultValue: true,
              admin: {
                description:
                  'Uncheck for events people cannot sign up for here — an external event we are only listing, for instance.',
              },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'capacity',
                  type: 'number',
                  min: 1,
                  admin: {
                    width: '50%',
                    description:
                      'Leave empty for unlimited. Once this many people have confirmed, everyone after joins a waitlist automatically.',
                    condition: (data) => data?.registrationEnabled !== false,
                  },
                },
                {
                  name: 'registrationDeadline',
                  type: 'date',
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayAndTime' },
                    description: 'Leave empty to accept registrations until the event starts.',
                    condition: (data) => data?.registrationEnabled !== false,
                  },
                },
              ],
            },
            {
              name: 'restrictToInstituteEmail',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                description:
                  'Only allow @iima.ac.in email addresses. Leave off for anything alumni or outside guests should be able to attend.',
                condition: (data) => data?.registrationEnabled !== false,
              },
            },
            {
              name: 'registrationFields',
              type: 'array',
              maxRows: 3, // Hard cap — a registration form that takes 60 seconds is the goal.
              labels: { singular: 'Question', plural: 'Extra questions' },
              admin: {
                description:
                  'Up to three extra questions, on top of name, email, phone and batch. Every question you add costs you sign-ups — add them only when you will act on the answer.',
                condition: (data) => data?.registrationEnabled !== false,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      admin: { width: '60%', description: 'The question, as the student reads it.' },
                    },
                    {
                      name: 'type',
                      type: 'select',
                      required: true,
                      defaultValue: 'text',
                      options: [
                        { label: 'Short answer', value: 'text' },
                        { label: 'Long answer', value: 'textarea' },
                        { label: 'Pick from a list', value: 'select' },
                        { label: 'Yes / no tickbox', value: 'checkbox' },
                      ],
                      admin: { width: '40%' },
                    },
                  ],
                },
                {
                  name: 'options',
                  type: 'text',
                  hasMany: true,
                  admin: {
                    description: 'The choices to pick from.',
                    condition: (_, siblingData) => siblingData?.type === 'select',
                  },
                },
                { name: 'required', type: 'checkbox', defaultValue: false },
              ],
            },
          ],
        },

        // ── After the event ──────────────────────────────────────────────────
        {
          label: 'After the event',
          description:
            'Fill this in once the event has happened. The page switches to recap mode by itself — photos and recording instead of a registration form.',
          fields: [
            {
              name: 'recap',
              type: 'group',
              fields: [
                {
                  name: 'text',
                  type: 'richText',
                  admin: { description: 'How it went. A short paragraph is plenty.' },
                },
                {
                  name: 'recordingUrl',
                  type: 'text',
                  admin: { description: 'YouTube link to the recording, if there is one.' },
                },
                {
                  name: 'gallery',
                  type: 'upload',
                  relationTo: 'media',
                  hasMany: true,
                  admin: { description: 'Photographs from the day.' },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export default Events
