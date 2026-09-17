import type { Metadata } from 'next'
import { Suspense } from 'react'

import { PageHero } from '@/components/public/page-hero'
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
      <PageHero
        eyebrow="Startup directory"
        title={<>Discover ventures built by the <span className="text-accent">IIMA community.</span></>}
        description="Search verified student and alumni ventures by sector, stage or founder batch—whether you want to invest, mentor, collaborate or simply learn what is being built."
      />
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
