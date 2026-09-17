import path from 'path'
import sharp from 'sharp'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'

import { Events } from './collections/Events'
import { Media } from './collections/Media'
import { PlaybookChapters } from './collections/PlaybookChapters'
import { Registrations } from './collections/Registrations'
import { Resources } from './collections/Resources'
import { Schemes } from './collections/Schemes'
import { Startups } from './collections/Startups'
import { Submissions } from './collections/Submissions'
import { Subscribers } from './collections/Subscribers'
import { TeamMembers } from './collections/TeamMembers'
import { Users } from './collections/Users'
import { SiteSettings } from './globals/SiteSettings'

// The config sits at the project root, so the working directory is the base for
// the generated import map and type output. Using cwd rather than
// import.meta.url keeps this file loadable by both the Next bundler and the
// Payload CLI without an ESM/CJS interop dance.
const rootDir = process.cwd()

export default buildConfig({
  // ── Routing ───────────────────────────────────────────────────────────────
  // Payload's REST API is mounted at /api/cms, NOT the default /api, so it
  // cannot collide with the public write endpoints in app/api/ (register,
  // contact, subscribe, ics). See CONTRACT.md §5.
  routes: {
    admin: '/admin',
    api: '/api/cms',
  },

  admin: {
    user: Users.slug,
    importMap: { baseDir: rootDir },
    meta: {
      titleSuffix: '— EntreVC Console',
    },
  },

  // Ordered as the club uses them: content first, then the things people submit,
  // then settings and accounts. The admin sidebar follows this order.
  collections: [
    Events,
    Startups,
    Resources,
    PlaybookChapters,
    Schemes,
    TeamMembers,
    Media,
    Registrations,
    Submissions,
    Subscribers,
    Users,
  ],

  globals: [SiteSettings],

  editor: lexicalEditor(),

  // Required for the image sizes declared on the Media collection. Without this
  // Payload warns and silently skips resizing — every image would then be served at
  // full upload resolution, which is exactly what the 2.5s LCP target cannot afford
  // on a single VM with no CDN in front of it.
  sharp,

  // libSQL talks to both a local file and a hosted Turso database, so the VM and
  // the team preview share one adapter and one SQLite dialect. On the VM
  // DATABASE_AUTH_TOKEN is unset and this is the previous behaviour exactly:
  // a plain file on local disk.
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./data/entrevc.db',
      authToken: process.env.DATABASE_AUTH_TOKEN,
    },
  }),

  // Media normally lives on the VM's local disk (collections/Media.ts), which a
  // platform with an ephemeral filesystem cannot do — uploads would vanish on the
  // next deploy. When S3_BUCKET is set the uploads go to S3-compatible storage
  // instead. Unset on the VM, where this array is empty and nothing changes.
  plugins: process.env.S3_BUCKET
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.S3_BUCKET,
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION,
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
            },
            // Supabase Storage addresses buckets by path, not by subdomain.
            forcePathStyle: true,
          },
        }),
      ]
    : [],

  secret: process.env.PAYLOAD_SECRET || '',

  typescript: {
    outputFile: path.resolve(rootDir, 'payload-types.ts'),
  },

  // Public site pages are statically generated; freshness comes from on-demand
  // revalidation fired by collection afterChange hooks (CONTRACT.md §4).
  graphQL: {
    disablePlaygroundInProduction: true,
  },
})
