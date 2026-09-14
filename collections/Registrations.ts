import type { CollectionConfig } from 'payload'

import { personalDataAccess } from './access'
import { clearWaitlistPositionOnConfirm, sendPromotionEmail } from './hooks/promotion'

/**
 * Event registrations — personal data, and the thing that proves this site replaced
 * the Google Form.
 *
 * Create is open to the public (that is the point of a registration form); reading
 * requires an account; deleting requires an admin, so a mis-click cannot destroy an
 * attendee list the night before an event.
 *
 * Written ONLY by POST /api/register, which enforces capacity inside a transaction.
 * Creating one by hand in the admin bypasses that check, so the form here is
 * deliberately read-oriented.
 *
 * Retention: PRD §7 asks for two academic years, then export and purge. That is an
 * annual task in docs/annual-checklist.md, not an automatic deletion — nobody wants a
 * cron job quietly deleting attendee history.
 */
export const Registrations: CollectionConfig = {
  slug: 'registrations',
  labels: { singular: 'Registration', plural: 'Registrations' },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'event', 'status', 'attended', 'createdAt'],
    description:
      'Everyone who has signed up for an event. Filter by event, then export to CSV — the export includes the answers to any extra questions you asked.',
    group: 'Registrations & enquiries',
    listSearchableFields: ['name', 'email', 'batchOrOrganisation'],
    components: {
      beforeListTable: ['/components/admin/export-registrations#ExportAllRegistrations'],
    },
  },
  access: personalDataAccess,
  hooks: {
    beforeChange: [clearWaitlistPositionOnConfirm],
    afterChange: [sendPromotionEmail],
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      index: true,
      admin: { description: 'Which event this registration is for.' },
    },
    {
      // Denormalised so an export still reads correctly if an event is ever renamed,
      // and so the CSV has a stable column without a join.
      name: 'eventSlug',
      type: 'text',
      required: true,
      index: true,
      label: 'Event web address',
      admin: {
        readOnly: true,
        description:
          'Stored alongside the event so exports still read correctly if the event is ever renamed. Set automatically — you never need to touch it.',
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        {
          name: 'email',
          type: 'email',
          required: true,
          index: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', admin: { width: '33%' } },
        {
          name: 'batchOrOrganisation',
          type: 'text',
          label: 'Batch / organisation',
          admin: { width: '33%' },
        },
        {
          name: 'attendeeType',
          type: 'select',
          required: true,
          defaultValue: 'student',
          options: [
            { label: 'Student', value: 'student' },
            { label: 'Alumni', value: 'alumni' },
            { label: 'External', value: 'external' },
          ],
          admin: { width: '34%' },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'confirmed',
      index: true,
      options: [
        { label: 'Confirmed', value: 'confirmed' },
        { label: 'Waitlisted', value: 'waitlisted' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      admin: {
        position: 'sidebar',
        description:
          'Changing someone from Waitlisted to Confirmed sends them a promotion email.',
      },
    },
    {
      name: 'waitlistPosition',
      type: 'number',
      label: 'Place in the queue',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description:
          'Number 1 is next in line. Cleared automatically when you confirm someone, and everyone behind them moves up.',
        condition: (data) => data?.status === 'waitlisted',
      },
    },
    {
      name: 'attended',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Tick on the day, for attendance records.' },
    },
    {
      name: 'customAnswers',
      type: 'json',
      admin: {
        description: 'Answers to the extra questions set on the event. Included in the CSV export.',
        readOnly: true,
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
          'Whether their confirmation email went out. "Failed" means the registration is safely recorded but the email did not send — you can resend it.',
      },
    },
    {
      // Consent text is stored as it was WORDED AT THE TIME, not as a boolean. If the
      // wording changes later, we can still say exactly what each person agreed to.
      name: 'consentText',
      type: 'textarea',
      admin: { readOnly: true, description: 'The exact wording this person agreed to.' },
    },
    {
      name: 'consentGiven',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        readOnly: true,
        description:
          'Recorded when they submitted the form. Read-only on purpose — consent is a record of what happened, not a setting.',
      },
    },
  ],
}

export default Registrations
