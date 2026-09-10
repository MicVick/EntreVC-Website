import path from 'path'
import { buildConfig } from 'payload'
import { sqliteAdapter } from '@payloadcms/db-sqlite'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

import { Users } from './collections/Users'

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

  collections: [Users],

  editor: lexicalEditor(),

  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./data/entrevc.db',
    },
  }),

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
