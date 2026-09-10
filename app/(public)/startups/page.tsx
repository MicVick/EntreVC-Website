import type { Metadata } from 'next'
import { Suspense } from 'react'

import { StartupDirectory } from '@/components/public/startup-directory'
import { Skeleton } from '@/components/ui/skeleton'
import { getStartupFacets, getStartups } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Startup directory',
  description: 'Explore ventures built by IIM Ahmedabad students and alumni, filtered by sector, stage and founder batch.',
  path: '/startups',
})

export default async function StartupsPage() {
  const [startups, facets] = await Promise.all([getStartups(), getStartupFacets()])

  return (
    <>
      <section className="surface-grid border-b border-border">
        <div className="site-shell py-16 sm:py-24">
          <p className="eyebrow">Built from IIMA</p>
          <h1 className="display-type mt-6 max-w-5xl text-5xl font-semibold leading-[0.92] sm:text-7xl lg:text-8xl">
            A directory of people turning insight into{' '}
            <span className="text-accent">enterprise.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-fg-muted">
            Verified student and alumni ventures, made browsable for investors, mentors, collaborators and the next person ready to begin.
          </p>
        </div>
      </section>
      <section className="section-shell">
        <div className="site-shell">
          <Suspense fallback={<Skeleton className="min-h-[48rem] w-full" />}>
            <StartupDirectory startups={startups} facets={facets} />
          </Suspense>
        </div>
      </section>
    </>
  )
}
