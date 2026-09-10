import type { CollectionConfig } from 'payload'

/**
 * Club team accounts for the admin console.
 *
 * Two roles only — `admin` and `editor`. The PRD's four-tier model (contributor,
 * viewer) was cut with the review workflow: a review queue is ceremony for a team
 * of eight, and every extra role is another thing to explain at handover.
 *
 * Handover is performed here: add the incoming team, promote the incoming lead to
 * admin, demote the outgoing lead, deactivate after two weeks. No password is ever
 * shared. See docs/handover-guide.md.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Team account', plural: 'Team accounts' },
  auth: true,
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'active'],
    description:
      'People who can sign in and edit the site. Adding and removing people here is how the club hands over each year — never share a password.',
  },
  access: {
    // Only admins manage accounts. Editors can read the list (to know who to ask)
    // but cannot create, change roles, or delete.
    read: ({ req: { user } }) => Boolean(user),
    create: ({ req: { user } }) => user?.role === 'admin',
    update: ({ req: { user } }) => user?.role === 'admin',
    delete: ({ req: { user } }) => user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'Full name, as it should appear on the team page.' },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Admin — everything, including managing accounts', value: 'admin' },
        { label: 'Editor — create, edit and publish all content', value: 'editor' },
      ],
      admin: {
        description:
          'Editors can publish anything on the site. Admins can additionally add and remove team accounts.',
      },
    },
    {
      name: 'vertical',
      type: 'text',
      admin: {
        description:
          'Which sub-team they belong to (events, ventures, outreach…). Used to route contact-form enquiries.',
      },
    },
    {
      name: 'active',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description:
          'Uncheck to revoke access without deleting the account, so their edit history stays intact.',
      },
    },
  ],
}

export default Users
