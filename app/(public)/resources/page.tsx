import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRight, BookMarked, ExternalLink, Play } from 'lucide-react'

import { ResourceDirectory } from '@/components/public/resource-directory'
import { SectionHeader } from '@/components/public/section-header'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getResources, getResourceTags, getSiteSettings } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Resources',
  description: 'Explore the EntreVC startup playbook and a practical library of articles, books, podcasts, reports, videos and templates.',
  path: '/resources',
})

export default async function ResourcesPage() {
  const [resources, tags, settings] = await Promise.all([getResources(), getResourceTags(), getSiteSettings()])

  return (
    <>
      <section className="surface-grid border-b border-border">
        <div className="site-shell grid gap-10 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end">
          <div>
            <p className="eyebrow">The EntreVC library</p>
            <h1 className="display-type mt-6 max-w-5xl text-5xl font-semibold leading-[0.9] sm:text-7xl lg:text-8xl">
              Read less. Learn the thing that{' '}
              <span className="text-accent">moves you.</span>
            </h1>
          </div>
          <div className="rounded-lg border border-brand bg-brand-muted p-6 sm:p-8">
            <BookMarked aria-hidden="true" className="size-7 text-accent" />
            <h2 className="display-type mt-6 text-3xl font-semibold">The Startup Playbook</h2>
            <p className="mt-3 text-sm leading-6 text-fg-muted">A web-first field guide written here, revised by every team that inherits it.</p>
            <Link href="/resources/playbook" className={`${buttonVariants({ size: 'sm' })} mt-6`}>
              Read the playbook <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="site-shell">
          <SectionHeader
            eyebrow="Curated, not collected"
            title="A practical shelf for builders."
            description="Filter by format and topic. Every result takes you directly to the source—no interstitials and no email gates."
          />
          <Suspense fallback={<Skeleton className="min-h-[40rem] w-full" />}>
            <ResourceDirectory resources={resources} tags={tags} />
          </Suspense>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="site-shell grid gap-8 py-14 sm:py-18 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="eyebrow">Watch and listen</p>
            <h2 className="display-type mt-5 text-3xl font-semibold sm:text-4xl">Sessions from the room, available outside it.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-fg-muted">
              The live video feed is intentionally non-blocking. If it is unavailable, the channel is always one click away.
            </p>
          </div>
          {settings.youtubeChannelUrl ? (
            <a href={settings.youtubeChannelUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
              <Play aria-hidden="true" className="size-4" /> Open the channel <ExternalLink aria-hidden="true" className="size-4" />
            </a>
          ) : (
            <p className="text-sm text-fg-muted">The channel link will be added soon.</p>
          )}
        </div>
      </section>
    </>
  )
}
