'use client'

import { SectionError } from '@/components/public/section-error'

export default function StartupsError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <SectionError
      error={error}
      reset={reset}
      eyebrow="Directory interrupted"
      title="The venture map could not be drawn."
      description="No filters or selections were lost. Try the directory again to reload the published IIMA ventures."
    />
  )
}
