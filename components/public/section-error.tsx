'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'
import { RefreshIcon, TriangleAlertIcon } from '@/components/ui/icons'

type SectionErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
  eyebrow: string
  title: string
  description: string
}

export function SectionError({ error, reset, eyebrow, title, description }: SectionErrorProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className="surface-grid flex min-h-[62vh] items-center border-b border-border">
      <div className="site-shell py-20">
        <div className="flex size-12 items-center justify-center rounded-full border border-danger bg-danger-muted">
          <TriangleAlertIcon aria-hidden="true" className="size-5 text-danger" />
        </div>
        <p className="eyebrow mt-8">{eyebrow}</p>
        <h1 className="display-type mt-6 max-w-4xl text-5xl font-semibold leading-[0.9] sm:text-7xl">{title}</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-fg-muted">{description}</p>
        <Button size="lg" className="mt-9" onClick={reset}>
          <RefreshIcon aria-hidden="true" className="size-4" /> Try this section again
        </Button>
      </div>
    </section>
  )
}
