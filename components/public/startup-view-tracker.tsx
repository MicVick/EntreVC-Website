'use client'

import { useEffect } from 'react'

import { trackAnalytics } from '@/lib/analytics'

export function StartupViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    trackAnalytics('startup_view', { slug })
  }, [slug])

  return null
}
