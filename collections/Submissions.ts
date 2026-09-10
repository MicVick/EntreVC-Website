import type { CollectionConfig } from 'payload'

import { personalDataAccess } from './access'

/**
 * Contact-form enquiries — the inbox.
 *
 * Every submission is stored BEFORE any email is attempted, so a mail failure loses
 * nothing. `emailStatus` surfaces failures here with a retry, which is the difference
 * between "we never got your message" and "we got it, the notification just bounced".
 */
export const Submissions: CollectionConfig = {
  slug: 'submissions',
  labels: { singular: 'Enquiry', plural: 'Enquiries' },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'subjectLine',
    defaultColumns: ['name', 'category', 'status', 'emailStatus', 'createdAt'],
    description:
      'Messages sent through the contact form. Mark each one resolved once it is dealt with, so the next person knows what still needs a reply.',
    group: 'Registrations & enquiries',
    listSearchableFields: ['name', 'email', 'message'],
  },
  access: personalDataAccess,
  fields: [
    {
      // A readable list title — Payload shows `useAsTitle`, and "Sponsorship — Ananya
      // Rao" scans far better in an inbox than a row of email addresses.
      name: 'subjectLine',
      type: 'text',
      admin: { readOnly: true, hidden: true },
      hooks: {
        beforeChange: [
          ({ data }) => {
            const category = String(data?.category ?? 'general').replace(/_/g, ' ')
            return `${category} — ${data?.name ?? 'Unknown'}`
          },
        ],
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      index: true,
      options: [
        { label: 'General enquiry', value: 'general' },
        { label: 'Events', value: 'event' },
        { label: 'Startup listing', value: 'startup_listing' },
        { label: 'Sponsorship', value: 'sponsorship' },
        { label: 'Speaking invitation', value: 'speaking' },
        { label: 'Mentorship', value: 'mentorship' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'In progress', value: 'in_progress' },
        { label: 'Resolved', value: 'resolved' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'assignedTo',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', description: 'Who is handling this.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
      ],
    },
    {
      name: 'batchOrOrganisation',
      type: 'text',
      label: 'Batch / organisation',
    },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'routedTo',
      type: 'text',
      admin: {
        readOnly: true,
        description:
          'The mailbox this was forwarded to, based on the category routing in Site Settings.',
      },
    },
    {
      name: 'emailStatus',
      type: 'select',
      defaultValue: 'pending',
      options: [
        { label: 'Sent', value: 'sent' },
        { label: 'Failed', value: 'failed' },
        { label: 'Pending', value: 'pending' },
      ],
      admin: {
        position: 'sidebar',
        description:
          '"Failed" means the message is safely stored here but the notification email did not go out — reply directly, and check the mail settings.',
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: { description: 'Notes for the team. Never shown to the sender.' },
    },
  ],
}

export default Submissions
