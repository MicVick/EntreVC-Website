import type { Metadata } from 'next'
import { ContentImage } from '@/components/public/content-image'
import { ArrowUpRight, CalendarClock, CheckCircle2, ExternalLink, Mail } from 'lucide-react'

import { SectionHeader } from '@/components/public/section-header'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'
import { getIimaVenturesContent, getVentureSchemes } from '@/lib/content'
import { formatDateInIST } from '@/lib/format'
import { publicExternalUrl } from '@/lib/public-link'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getIimaVenturesContent()
  return buildMetadata({
    title: 'IIMA Ventures',
    description: content.overview.plainText,
    path: '/iima-ventures',
    image: content.image,
  })
}

export default async function IimaVenturesPage() {
  const [content, schemes] = await Promise.all([getIimaVenturesContent(), getVentureSchemes()])
  const website = publicExternalUrl(content.website)

  return (
    <>
      <section className="overflow-hidden border-b border-border">
        <div className="site-shell grid gap-9 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end lg:py-16">
          <div>
            <p className="eyebrow">IIMA Ventures</p>
            <h1 className="display-xl mt-5 max-w-5xl text-[clamp(2.5rem,6vw,4.75rem)]">Support for founders</h1>
            <div className="rich-text mt-6 max-w-3xl" dangerouslySetInnerHTML={{ __html: content.overview.html }} />
            <div className="mt-7 flex flex-wrap gap-3">
              {website ? (
                <a href={website} target="_blank" rel="noopener noreferrer" className={buttonVariants({ size: 'lg' })}>
                  Visit IIMA Ventures <ExternalLink aria-hidden="true" className="size-4" />
                </a>
              ) : null}
              {content.contactEmail ? (
                <a href={`mailto:${content.contactEmail}`} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                  <Mail aria-hidden="true" className="size-4" /> Ask the office
                </a>
              ) : null}
            </div>
          </div>

          <div className="reveal-on-scroll relative min-h-72 overflow-hidden rounded-lg border border-border bg-surface shadow-lg">
            <ContentImage image={content.image} kind="event" label="IIMA Ventures" sizes="(min-width: 1024px) 40vw, 100vw" priority className="min-h-80" />
            {content.highlight ? (
              <div className="absolute inset-x-5 bottom-5 rounded-md border border-border bg-bg/88 p-5 backdrop-blur sm:inset-x-7 sm:bottom-7">
                <p className="meta-label text-accent">At a glance</p>
                <p className="display-type mt-3 text-2xl font-semibold leading-tight">{content.highlight}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="site-shell">
          <SectionHeader
            title="Programmes and grants"
            description="Deadlines, eligibility and how to apply, kept up to date by the EntreVC team. Closed calls stay listed so you know what to expect next time."
          />

          {schemes.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {schemes.map((scheme) => {
                const applicationUrl = publicExternalUrl(scheme.applicationLink)
                return <article
                  key={scheme.id}
                  className={cn(
                    'surface-card group flex min-w-0 flex-col rounded-lg p-6 transition sm:p-8',
                    scheme.isExpired ? 'opacity-60' : 'hover:border-border-strong',
                  )}
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={scheme.isExpired ? 'default' : 'brand'}>
                        {scheme.isExpired ? 'Applications closed' : scheme.deadline ? 'Deadline set' : 'Rolling'}
                      </Badge>
                    </div>
                    <CalendarClock aria-hidden="true" className="size-5 shrink-0 text-accent" />
                  </div>
                  <h2 className="display-type mt-7 break-words text-3xl font-semibold leading-tight">{scheme.name}</h2>
                  <p className="mt-4 text-base leading-7 text-fg-muted">{scheme.summary}</p>

                  <dl className="mt-8 grid gap-5 border-t border-border pt-6 sm:grid-cols-2">
                    {scheme.whoItIsFor ? (
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-[0.12em] text-fg-subtle">Who it’s for</dt>
                        <dd className="mt-2 text-sm leading-6 text-fg-muted">{scheme.whoItIsFor}</dd>
                      </div>
                    ) : null}
                    {scheme.whatYouGet ? (
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-[0.12em] text-fg-subtle">What you get</dt>
                        <dd className="mt-2 text-sm leading-6 text-fg-muted">{scheme.whatYouGet}</dd>
                      </div>
                    ) : null}
                  </dl>

                  {scheme.eligibility ? (
                    <div className="mt-6 flex items-start gap-3 rounded-md border border-border bg-bg p-4">
                      <CheckCircle2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-accent" />
                      <p className="text-sm leading-6 text-fg-muted"><span className="font-semibold text-fg">Eligibility:</span> {scheme.eligibility}</p>
                    </div>
                  ) : null}

                  <div className="mt-auto flex flex-col gap-5 pt-7 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-semibold text-fg-muted">
                      {scheme.deadline ? `Deadline: ${formatDateInIST(scheme.deadline)}` : 'Applications accepted on a rolling basis'}
                    </p>
                    {applicationUrl && !scheme.isExpired ? (
                      <a href={applicationUrl} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        Apply <ArrowUpRight aria-hidden="true" className="size-4" />
                      </a>
                    ) : !scheme.isExpired ? <span className="text-xs font-semibold text-fg-subtle">Application link coming soon</span> : null}
                  </div>
                </article>
              })}
            </div>
          ) : (
            <div className="rounded-lg surface-card border-dashed border-border-strong p-8">
              <h2 className="display-type text-2xl font-semibold">No schemes are listed yet.</h2>
              <p className="mt-3 text-fg-muted">Contact the IIMA Ventures office for the latest opportunities.</p>
            </div>
          )}
        </div>
      </section>

      {content.contactEmail || content.contactName ? (
        <section className="relative">
          <div className="site-shell flex flex-col gap-7 py-14 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Talk to a person</p>
              <h2 className="display-type mt-3 text-3xl">{content.contactName ?? 'IIMA Ventures Office'}</h2>
            </div>
            {content.contactEmail ? (
              <a href={`mailto:${content.contactEmail}`} className={buttonVariants({ size: 'lg' })}>
                {content.contactEmail} <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            ) : null}
          </div>
        </section>
      ) : null}
    </>
  )
}
