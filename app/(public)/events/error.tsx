'use client'

import { SectionError } from '@/components/public/section-error'

export default function EventsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <SectionError
      error={error}
      reset={reset}
      eyebrow="The calendar paused"
      title="The events desk did not answer this time."
      description="Try again to reload the programme. If it keeps failing, the contact page routes your note directly to the events team."
    />
  )
}
