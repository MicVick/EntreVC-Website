'use client'

import { useEffect } from 'react'
import { RefreshCw, TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function PublicError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="surface-grid flex min-h-[70vh] items-center border-b border-border">
      <div className="site-shell py-20">
        <TriangleAlert aria-hidden="true" className="size-9 text-danger" />
        <p className="eyebrow mt-8">A temporary interruption</p>
        <h1 className="display-type mt-6 max-w-4xl text-5xl font-semibold leading-[0.9] sm:text-7xl">Something did not load the way it should.</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-fg-muted">Your information is safe. Try the page again; if the problem continues, the club team can help.</p>
        <Button size="lg" className="mt-9" onClick={reset}>
          <RefreshCw aria-hidden="true" className="size-4" /> Try again
        </Button>
      </div>
    </section>
  )
}
