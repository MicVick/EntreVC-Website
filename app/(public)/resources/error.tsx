'use client'

import { SectionError } from '@/components/public/section-error'

export default function ResourcesError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <SectionError
      error={error}
      reset={reset}
      eyebrow="Library interrupted"
      title="The shelf did not load cleanly."
      description="Try again to reopen the curated resources and founder playbook. Every resource remains ungated."
    />
  )
}
