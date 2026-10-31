'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { RefreshIcon, TriangleAlertIcon } from '@/components/ui/icons'

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="flex min-h-[70vh] items-center border-b border-border">
      <div className="site-shell py-20">
        <TriangleAlertIcon aria-hidden="true" className="size-9 text-danger" />
        <p className="eyebrow mt-8">Something went wrong</p>
        <h1 className="display-type mt-6 max-w-4xl text-[clamp(2.6rem,6vw,4.75rem)]">This page didn’t load properly.</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-fg-muted">Your information is safe. Try the page again; if the problem continues, the club team can help.</p>
        <Button size="lg" className="mt-9" onClick={reset}>
          <RefreshIcon aria-hidden="true" className="size-4" /> Try again
        </Button>
      </div>
    </section>
  )
}
