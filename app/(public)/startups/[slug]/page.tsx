import type { Metadata } from 'next'
import { ContentImage } from '@/components/public/content-image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ArrowUpRight, CalendarDays, ExternalLink } from 'lucide-react'

import { ShareButton } from '@/components/public/share-button'
import { StartupViewTracker } from '@/components/public/startup-view-tracker'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'
import { getAllStartupSlugs, getStartupBySlug } from '@/lib/content'
import { absoluteUrl, buildMetadata } from '@/lib/seo'
import { publicExternalUrl } from '@/lib/public-link'
import { startupStageLabels, startupTypeLabels } from '@/lib/schemas'

export async function generateStaticParams() {
  const slugs = await getAllStartupSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<'/startups/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const startup = await getStartupBySlug(slug)

  if (!startup) return buildMetadata({ title: 'Startup not found', description: 'This venture profile is not available.', path: `/startups/${slug}` })

  return buildMetadata({
    title: startup.name,
    description: startup.tagline,
    path: `/startups/${startup.slug}`,
    image: startup.logo,
  })
}

export default async function StartupDetailPage({ params }: PageProps<'/startups/[slug]'>) {
  const { slug } = await params
  const startup = await getStartupBySlug(slug)
  if (!startup) notFound()
  const website = publicExternalUrl(startup.website)
  const linkedin = publicExternalUrl(startup.linkedin)

  const breadcrumbJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
      { '@type': 'ListItem', position: 2, name: 'Startups', item: absoluteUrl('/startups') },
      { '@type': 'ListItem', position: 3, name: startup.name, item: absoluteUrl(`/startups/${startup.slug}`) },
    ],
  }).replace(/</g, '\\u003c')

  return (
    <>
      <StartupViewTracker slug={startup.slug} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbJsonLd }} />

      <section>
        <div className="site-shell py-12 sm:py-18">
          <Link href="/startups" className="inline-flex items-center gap-2 text-sm font-semibold text-fg-muted transition hover:text-accent">
            <ArrowLeft aria-hidden="true" className="size-4" /> Back to the directory
          </Link>
          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="brand">{startupTypeLabels[startup.type]}</Badge>
                {startup.stage ? <Badge>{startupStageLabels[startup.stage]}</Badge> : null}
                {startup.foundedYear ? <Badge variant="outline">Founded {startup.foundedYear}</Badge> : null}
              </div>
              <h1 className="display-type mt-6 break-words text-[clamp(3rem,7vw,6rem)]">{startup.name}</h1>
              <p className="mt-7 max-w-3xl text-xl leading-8 text-fg-muted sm:text-2xl">{startup.tagline}</p>
            </div>
            <div className="flex aspect-square w-full max-w-72 items-center justify-center overflow-hidden rounded-lg border border-border bg-bg shadow-lg lg:ml-auto">
              <ContentImage image={startup.logo} kind="startup" label={startup.name} sizes="288px" priority className="aspect-square object-contain" />
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="site-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div>
            <p className="eyebrow">The venture</p>
            {startup.description.plainText ? (
              <div className="rich-text mt-7 max-w-3xl" dangerouslySetInnerHTML={{ __html: startup.description.html }} />
            ) : (
              <p className="mt-7 max-w-3xl text-lg leading-8 text-fg-muted">{startup.tagline}</p>
            )}

            <div className="mt-8 rounded-lg border border-border bg-surface p-5 sm:p-6">
              <h2 className="text-sm font-bold uppercase tracking-[0.13em] text-fg-subtle">At a glance</h2>
              <dl className="mt-5 grid gap-5 text-sm sm:grid-cols-2">
                <div><dt className="text-fg-subtle">Focus</dt><dd className="mt-1 font-semibold leading-6 text-fg">{startup.tagline}</dd></div>
                {startup.sectors.length ? <div><dt className="text-fg-subtle">Sector</dt><dd className="mt-1 font-semibold leading-6 text-fg">{startup.sectors.join(', ')}</dd></div> : null}
                {startup.founders.length ? <div><dt className="text-fg-subtle">Founders</dt><dd className="mt-1 font-semibold leading-6 text-fg">{startup.founders.map((founder) => founder.name).join(', ')}</dd></div> : null}
                {startup.stage ? <div><dt className="text-fg-subtle">Stage</dt><dd className="mt-1 font-semibold leading-6 text-fg">{startupStageLabels[startup.stage]}</dd></div> : null}
              </dl>
            </div>

            {startup.story?.html ? (
              <div className="mt-16 border-t border-border pt-12">
                <h2 className="display-type text-[clamp(2rem,4.2vw,3rem)]">How it started</h2>
                <div className="rich-text mt-7 max-w-3xl" dangerouslySetInnerHTML={{ __html: startup.story.html }} />
              </div>
            ) : null}
          </div>

          <aside className="h-fit rounded-lg border border-border bg-surface p-6 lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">Company profile</p>
            {startup.sectors.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {startup.sectors.map((sector) => <Badge key={sector}>{sector}</Badge>)}
              </div>
            ) : null}
            {startup.batches.length ? (
              <div className="mt-6 flex items-start gap-3 text-sm leading-6 text-fg-muted">
                <CalendarDays aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" />
                <span>Founder batches: {startup.batches.join(', ')}</span>
              </div>
            ) : null}
            <div className="mt-7 flex flex-col gap-3 border-t border-border pt-6">
              {website ? (
                <a href={website} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: 'sm' })}>
                  Visit website <ExternalLink aria-hidden="true" className="size-4" />
                </a>
              ) : null}
              {linkedin ? (
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                  Company LinkedIn <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
              ) : null}
              <ShareButton title={startup.name} text={startup.tagline} />
            </div>
          </aside>
        </div>
      </section>

      <section className="section-shell">
        <div className="site-shell">
          <p className="eyebrow">Founding team</p>
          <h2 className="display-type mt-3 text-[clamp(2rem,4.2vw,3rem)]">Founders</h2>
          {startup.founders.length ? (
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {startup.founders.map((founder) => {
                const founderLink = publicExternalUrl(founder.linkedin)
                return <article key={`${startup.id}-${founder.name}`} className="flex items-center gap-5 rounded-lg border border-border bg-bg p-5">
                  <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-2">
                    <ContentImage image={founder.photo} kind="person" label={founder.name} sizes="64px" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-fg">{founder.name}</h3>
                    {founder.batch ? <p className="mt-1 text-sm text-fg-muted">{founder.batch}</p> : null}
                    {founderLink ? (
                      <a href={founderLink} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-accent">
                        LinkedIn <ArrowUpRight aria-hidden="true" className="size-3.5" />
                      </a>
                    ) : null}
                  </div>
                </article>
              })}
            </div>
          ) : (
            <p className="mt-8 text-fg-muted">Founding team details will be added soon.</p>
          )}
          <p className="mt-8 max-w-2xl text-xs leading-5 text-fg-subtle">
            Personal profile links appear only where the founder has explicitly consented to publication.
          </p>
        </div>
      </section>

      <section className="site-shell py-14">
        <div className="flex flex-col gap-6 rounded-lg border border-brand bg-brand-muted p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="display-type text-2xl">Is something here out of date?</h2>
            <p className="mt-2 text-sm leading-6 text-fg-muted">The club team manages every listing and handles removal requests directly.</p>
          </div>
          <Link href="/contact?category=startup_listing" className={cn(buttonVariants(), 'shrink-0')}>
            Request an update <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
