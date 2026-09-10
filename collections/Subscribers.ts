import type { CollectionConfig } from 'payload'

import { personalDataAccess } from './access'

/**
 * Mailing list.
 *
 * Email only, and a stored record of the consent wording as it stood when they signed
 * up. Double opt-in is explicitly Phase 2 — the PRD defers it, and a single opt-in with
 * recorded consent text is defensible in the meantime.
 *
 * Unsubscribing sets `active` to false rather than deleting the row, so a re-signup
 * does not silently resurrect someone who asked to leave.
 */
export const Subscribers: CollectionConfig = {
  slug: 'subscribers',
  labels: { singular: 'Subscriber', plural: 'Mailing list' },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'source', 'active', 'createdAt'],
    description:
      'People who asked to hear from the club. Export to CSV before a newsletter send. Anyone who unsubscribes stays here marked inactive — never email an inactive address.',
    group: 'Registrations & enquiries',
    listSearchableFields: ['email'],
  },
  access: personalDataAccess,
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      index: true,
      hooks: {
        // Lowercased on write so "A@x.com" and "a@x.com" cannot both subscribe.
        beforeValidate: [({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value)],
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'Untick if they unsubscribe. Do not delete the record.',
      },
    },
    {
      name: 'source',
      type: 'select',
      required: true,
      defaultValue: 'homepage',
      options: [
        { label: 'Homepage', value: 'homepage' },
        { label: 'Footer', value: 'footer' },
        { label: 'Event registration', value: 'event' },
        { label: 'Contact form', value: 'contact' },
        { label: 'Imported', value: 'import' },
      ],
      admin: { position: 'sidebar', description: 'Where they signed up.' },
    },
    {
      name: 'consentText',
      type: 'textarea',
      admin: { readOnly: true, description: 'The exact wording this person agreed to.' },
    },
    {
      name: 'consentGiven',
      type: 'checkbox',
      defaultValue: false,
      admin: { readOnly: true },
    },
  ],
}

export default Subscribers
