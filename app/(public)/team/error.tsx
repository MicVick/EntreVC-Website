'use client'

import { SectionError } from '@/components/public/section-error'

export default function TeamError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <SectionError
      error={error}
      reset={reset}
      eyebrow="Roster interrupted"
      title="The team archive could not be assembled."
      description="Try again to reload the current committee and past academic-year rosters from the club archive."
    />
  )
}
