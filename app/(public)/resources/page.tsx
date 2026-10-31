import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRight, BookMarked, ExternalLink, Play } from 'lucide-react'

import { PageHero } from '@/components/public/page-hero'
import { ResourceDirectory } from '@/components/public/resource-directory'
import { SectionHeader } from '@/components/public/section-header'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getResources, getResourceTags, getSiteSettings } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'
import { publicExternalUrl } from '@/lib/public-link'

export const metadata: Metadata = buildMetadata({
  title: 'Resources',
  description: 'Explore the EntreVC startup playbook and a practical library of articles, books, podcasts, reports, videos and templates.',
  path: '/resources',
})

export default async function ResourcesPage() {
  const [resources, tags, settings] = await Promise.all([getResources(), getResourceTags(), getSiteSettings()])
  const youtubeChannelUrl = publicExternalUrl(settings.youtubeChannelUrl)

  return (
    <>
      <PageHero
        eyebrow="The EntreVC library"
        title="Resources"
        description="Reading lists, templates, reports and recorded talks we’ve found useful, plus the EntreVC playbook. Everything is free and opens at the source."
        aside={
          <div className="group relative min-h-60 overflow-hidden rounded-lg border border-border bg-surface shadow-md sm:min-h-64">
            <Image
              src="/images/editorial/field-notes.webp"
              alt="A dark worktable with a notebook, sketches and a red pencil"
              width={1600}
              height={900}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="absolute inset-0 h-full w-full object-cover opacity-60 transition duration-1000 group-hover:scale-[1.025] group-hover:opacity-70"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/75 to-bg/10" />
            <div className="relative flex min-h-60 flex-col justify-end p-6 sm:min-h-64 sm:p-7">
              <BookMarked aria-hidden="true" className="size-6 text-accent" />
              <h2 className="display-type mt-4 text-3xl">New here? Start with the playbook</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-fg-muted">A practical guide to starting up, written at IIMA and kept up to date by each year’s team.</p>
              <Link href="/resources/playbook" className={`${buttonVariants({ size: 'sm' })} mt-5 w-fit`}>
                Read the playbook <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        }
      />

      <section className="section-shell">
        <div className="site-shell">
          <SectionHeader
            title="Browse the library"
            description="Filter by format or topic. Links open at the source, with no sign-up and no email gate."
          />
          <Suspense fallback={<Skeleton className="min-h-[40rem] w-full" />}>
            <ResourceDirectory resources={resources} tags={tags} />
          </Suspense>
        </div>
      </section>

      <section className="relative">
        <div className="site-shell grid gap-8 py-14 sm:py-18 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="eyebrow">Watch and listen</p>
            <h2 className="display-type mt-3 text-3xl sm:text-4xl">Missed a session?</h2>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-fg-muted">
              When a talk or workshop is recorded, it goes up on the EntreVC YouTube channel.
            </p>
          </div>
          {youtubeChannelUrl ? (
            <a href={youtubeChannelUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
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
