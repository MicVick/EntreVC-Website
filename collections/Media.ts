import path from 'path'
import type { CollectionConfig } from 'payload'

import { anyone, isSignedIn } from './access'

/**
 * Uploaded images and files, stored on local disk and served by the app.
 *
 * On the VM this directory is part of the nightly backup — losing it means losing
 * every event poster the club has ever published. See deploy/backup.sh.
 */
export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'File', plural: 'Media library' },
  admin: {
    description:
      'Every image and file used on the site. Upload once here and reuse anywhere. Keep posters under about 300KB — this site is served from a single small server with no CDN, and heavy images are the fastest way to make it feel slow on a phone.',
  },
  access: {
    read: anyone, // Media URLs are public by nature — they are embedded in public pages.
    create: isSignedIn,
    update: isSignedIn,
    delete: isSignedIn,
  },
  upload: {
    staticDir: process.env.MEDIA_DIR || path.resolve(process.cwd(), 'public/media'),
    mimeTypes: ['image/*', 'application/pdf', 'text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    // Generated once at upload, so no image is resized per request. That matters on a
    // small VM: on-the-fly optimisation is CPU we do not have to spare on event day.
    imageSizes: [
      { name: 'thumbnail', width: 400, height: 300, position: 'centre' },
      { name: 'card', width: 768, height: 432, position: 'centre' },
      { name: 'hero', width: 1600, height: 900, position: 'centre' },
      { name: 'square', width: 600, height: 600, position: 'centre' },
    ],
    adminThumbnail: 'thumbnail',
    formatOptions: {
      format: 'webp',
      options: { quality: 82 },
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      // THE accessibility guarantee. An upload cannot complete without it, which is why
      // it is enforced here rather than left to a checklist nobody reads.
      required: true,
      admin: {
        description:
          'Describe what is in the image for someone who cannot see it — "Panellists on stage at the VC Teardown", not "image1.jpg". Required.',
      },
    },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Photographer or source, if one needs crediting.' },
    },
  ],
}

export default Media
