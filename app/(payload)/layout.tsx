/* THIS FILE IS PAYLOAD BOILERPLATE — keep it thin.
 *
 * The admin console has its own root layout, deliberately separate from the
 * public site's. Do not add a layout at app/layout.tsx: it would wrap this one
 * and inject the site's fonts and globals.css into the Payload admin, which
 * breaks its styling. The two route groups are siblings, each with its own root.
 */
import type { ServerFunctionClient } from 'payload'
import config from '@payload-config'
import '@payloadcms/next/css'
import { handleServerFunctions, RootLayout } from '@payloadcms/next/layouts'
import React from 'react'

import { importMap } from './admin/importMap.js'

type Args = {
  children: React.ReactNode
}

const serverFunction: ServerFunctionClient = async function (args) {
  'use server'
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  })
}

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
)

export default Layout
