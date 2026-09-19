import type { Metadata } from 'next'
import Image from 'next/image'
import { ArrowUpRight, CalendarClock, CheckCircle2, ExternalLink, Mail } from 'lucide-react'

import { SectionHeader } from '@/components/public/section-header'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'
import { getIimaVenturesContent, getVentureSchemes } from '@/lib/content'
import { formatDateInIST } from '@/lib/format'
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

  return (
    <>
      <section className="surface-grid overflow-hidden border-b border-border">
        <div className="site-shell grid gap-9 py-10 sm:py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end lg:py-16">
          <div>
            <p className="eyebrow">Institutional support</p>
            <h1 className="display-type mt-5 max-w-5xl text-[clamp(2.6rem,5.8vw,5.8rem)] font-semibold leading-[0.91]">
              Find the support that fits your{' '}
              <span className="text-accent">next stage.</span>
            </h1>
            <div className="rich-text mt-6 max-w-3xl" dangerouslySetInnerHTML={{ __html: content.overview.html }} />
            <div className="mt-7 flex flex-wrap gap-3">
              {content.website ? (
                <a href={content.website} target="_blank" rel="noreferrer" className={buttonVariants({ size: 'lg' })}>
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
            {content.image ? (
              <Image
                src={content.image.url}
                alt={content.image.alt}
                width={content.image.width}
                height={content.image.height}
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
                className="h-full min-h-72 w-full object-cover opacity-80"
              />
            ) : (
              <Image
                src="/images/editorial/ideas-in-motion-light.webp"
                alt=""
                width={1600}
                height={900}
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
                className="absolute inset-0 h-full w-full object-cover opacity-80"
                aria-hidden="true"
              />
            )}
            {content.highlight ? (
              <div className="absolute inset-x-5 bottom-5 rounded-md border border-border bg-bg/88 p-5 backdrop-blur sm:inset-x-7 sm:bottom-7">
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-accent">At a glance</p>
                <p className="display-type mt-3 text-2xl font-semibold leading-tight">{content.highlight}</p>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="site-shell">
          <SectionHeader
            eyebrow="Open opportunities"
            title="Find the support that fits the stage."
            description="Deadlines, eligibility and application routes are maintained by the club team. Expired calls remain visible for context."
          />

          {schemes.length ? (
            <div className="grid gap-5 lg:grid-cols-2">
              {schemes.map((scheme, index) => (
                <article
                  key={scheme.id}
                  className={cn(
                    'group flex min-w-0 flex-col rounded-lg border bg-surface p-6 transition hover:-translate-y-1 hover:shadow-md sm:p-8',
                    scheme.isExpired ? 'border-border opacity-60' : 'border-border hover:border-border-strong',
                  )}
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={scheme.isExpired ? 'default' : 'brand'}>
                        {scheme.isExpired ? 'Applications closed' : scheme.deadline ? 'Deadline set' : 'Rolling'}
                      </Badge>
                      <Badge variant="outline">0{index + 1}</Badge>
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
                    {scheme.applicationLink && !scheme.isExpired ? (
                      <a href={scheme.applicationLink} target="_blank" rel="noreferrer" className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                        Apply <ArrowUpRight aria-hidden="true" className="size-4" />
                      </a>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8">
              <h2 className="display-type text-2xl font-semibold">No schemes are listed yet.</h2>
              <p className="mt-3 text-fg-muted">Contact the IIMA Ventures office for the latest opportunities.</p>
            </div>
          )}
        </div>
      </section>

      {content.contactEmail || content.contactName ? (
        <section className="border-t border-border bg-surface">
          <div className="site-shell flex flex-col gap-7 py-14 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="eyebrow">Talk to a person</p>
              <h2 className="display-type mt-5 text-3xl font-semibold">{content.contactName ?? 'IIMA Ventures Office'}</h2>
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
