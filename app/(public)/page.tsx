import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Lightbulb,
  Mail,
  Users,
} from 'lucide-react'

import { EmptyState } from '@/components/public/empty-state'
import { EventCard } from '@/components/public/event-card'
import { NewsletterSignup } from '@/components/public/newsletter-signup'
import { ResourceCard } from '@/components/public/resource-card'
import { SectionHeader } from '@/components/public/section-header'
import { StartupCard } from '@/components/public/startup-card'
import { StatBlock } from '@/components/public/stat-block'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'
import {
  getFeaturedStartups,
  getKeyNumbers,
  getLatestResource,
  getSiteSettings,
  getUpcomingEvents,
} from '@/lib/content'
import { absoluteUrl, buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()
  return buildMetadata({
    title: 'EntreVC · IIM Ahmedabad',
    description: settings.positioningStatement,
    path: '/',
    absoluteTitle: true,
  })
}

const entryPoints = [
  {
    href: '/events',
    label: 'Events',
    description: 'Meet founders, investors and operators—then stay for the honest questions.',
    icon: CalendarDays,
    index: '01',
  },
  {
    href: '/startups',
    label: 'Startup directory',
    description: 'A living map of the ventures being built by IIMA students and alumni.',
    icon: Building2,
    index: '02',
  },
  {
    href: '/resources',
    label: 'Resources',
    description: 'Playbooks, reports and practical tools curated for the building stage.',
    icon: BookOpen,
    index: '03',
  },
  {
    href: '/iima-ventures',
    label: 'IIMA Ventures',
    description: 'Find the schemes, grants, incubation and institutional support available now.',
    icon: Lightbulb,
    index: '04',
  },
  {
    href: '/team',
    label: 'The team',
    description: 'Meet the student team carrying this community—and its knowledge—forward.',
    icon: Users,
    index: '05',
  },
  {
    href: '/contact',
    label: 'Contact',
    description: 'Speak, mentor, partner, sponsor or simply ask the right person directly.',
    icon: Mail,
    index: '06',
  },
] as const

export default async function HomePage() {
  const [settings, events, startups, latestResource, numbers] = await Promise.all([
    getSiteSettings(),
    getUpcomingEvents({ limit: 3 }),
    getFeaturedStartups({ limit: 3 }),
    getLatestResource(),
    getKeyNumbers(),
  ])

  const organizationJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EntreVC, IIM Ahmedabad',
    url: absoluteUrl('/'),
    email: settings.clubEmail,
    address: settings.campusAddress ?? undefined,
    sameAs: settings.socialLinks.map((social) => social.url),
  }).replace(/</g, '\\u003c')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJsonLd }} />

      <section className="surface-grid relative overflow-hidden border-b border-border">
        <div className="site-shell grid min-h-[calc(100svh-var(--header-height))] gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,1.22fr)_minmax(19rem,0.78fr)] lg:items-end lg:py-24">
          <div className="animate-enter self-center">
            <p className="eyebrow">Entrepreneurship × Venture Capital · IIM Ahmedabad</p>
            <h1 className="display-type mt-7 max-w-5xl text-[clamp(3.5rem,9vw,8.3rem)] font-semibold leading-[0.88]">
              Ideas deserve a place to become{' '}
              <span className="text-accent">real.</span>
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-fg-muted sm:text-xl">
              {settings.positioningStatement}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/events" className={buttonVariants({ size: 'lg' })}>
                Find your next room
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link href="/startups" className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                Explore the ecosystem
              </Link>
            </div>
          </div>

          <div className="animate-enter-delayed relative mx-auto w-full max-w-lg lg:mx-0 lg:ml-auto">
            <div className="relative aspect-square overflow-hidden rounded-full border border-border bg-surface shadow-lg">
              <div className="surface-grid absolute inset-0" />
              <div className="absolute inset-[13%] rounded-full border border-border-strong" />
              <div className="absolute inset-[27%] rounded-full border border-brand/70" />
              <div className="absolute left-1/2 top-1/2 size-[34%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand shadow-[0_0_90px_var(--color-brand)]" />
              <p className="display-type absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-4xl font-semibold text-brand-fg sm:text-5xl">
                Build<br />here<span className="text-accent">.</span>
              </p>
              <span className="absolute left-[8%] top-[48%] size-3 rounded-full bg-accent shadow-[0_0_30px_var(--color-accent)]" />
              <span className="absolute right-[17%] top-[14%] size-2 rounded-full bg-fg" />
              <span className="absolute bottom-[17%] right-[9%] size-2 rounded-full bg-brand" />
            </div>
            <div className="absolute -bottom-4 left-2 rounded-md border border-border bg-bg/90 px-4 py-3 text-xs font-bold uppercase tracking-[0.13em] text-fg-muted shadow-md backdrop-blur sm:left-8">
              Student-led · Alumni-powered
            </div>
          </div>
        </div>

        <a
          href="#intro"
          aria-label="Scroll to learn more"
          className="absolute bottom-6 left-[var(--page-gutter)] hidden items-center gap-3 text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle transition hover:text-accent lg:flex"
        >
          Scroll to explore <ArrowDownRight aria-hidden="true" className="size-4" />
        </a>
      </section>

      <section id="intro" className="border-b border-border bg-surface">
        <div className="site-shell grid gap-8 py-16 md:grid-cols-[0.58fr_1.42fr] md:py-22">
          <p className="eyebrow self-start">What we do</p>
          <div
            className="rich-text max-w-4xl text-xl leading-9 sm:text-2xl sm:leading-10"
            dangerouslySetInnerHTML={{ __html: settings.intro.html }}
          />
        </div>
      </section>

      {events.length ? (
        <section className="section-shell">
          <div className="site-shell">
            <SectionHeader
              eyebrow="Up next"
              title="Rooms worth being in."
              description="Workshops, candid conversations and the occasional useful argument—open to the IIMA entrepreneurship community."
              action={
                <Link href="/events" className={buttonVariants({ variant: 'outline' })}>
                  All events <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              }
            />
            <div className="grid gap-5 lg:grid-cols-3">
              {events.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="section-shell border-y border-border bg-surface">
        <div className="site-shell">
          <SectionHeader
            eyebrow="Built from here"
            title="The campus is already building."
            description="Meet the student and alumni ventures turning sharp observations into durable companies."
            action={
              <Link href="/startups" className={buttonVariants({ variant: 'outline' })}>
                Browse the directory <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            }
          />
          {startups.length ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {startups.map((startup, index) => <StartupCard key={startup.id} startup={startup} priority={index === 0} />)}
            </div>
          ) : (
            <EmptyState
              title="The directory is being assembled."
              description="We’re verifying venture details and founder permissions before the first profiles go live."
              action={{ href: '/contact?category=startup_listing', label: 'Talk to the ventures team' }}
            />
          )}
        </div>
      </section>

      <section className="section-shell">
        <div className="site-shell grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <div>
            <p className="eyebrow">Latest thinking</p>
            <h2 className="display-type mt-5 text-4xl font-semibold leading-none sm:text-5xl">Useful before it is impressive.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-fg-muted">
              Practical reading, listening and tools for the messy middle between an idea and a company.
            </p>
            <Link href="/resources" className={cn(buttonVariants({ variant: 'outline' }), 'mt-7')}>
              Open the library <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          {latestResource ? (
            <ResourceCard resource={latestResource} featured />
          ) : (
            <EmptyState compact title="The library opens soon." description="The first set of founder resources is being curated now." />
          )}
        </div>
      </section>

      <section className="border-y border-border bg-brand text-brand-fg">
        <div className="site-shell grid gap-10 py-14 sm:grid-cols-3 sm:py-18">
          <StatBlock value={numbers.eventsHeld} suffix="+" label={numbers.labels.eventsHeld} className="border-brand-fg/35" />
          <StatBlock value={numbers.startupsListed} suffix="+" label={numbers.labels.startupsListed} className="border-brand-fg/35" />
          {numbers.alumniNetwork === null ? null : (
            <StatBlock value={numbers.alumniNetwork} suffix="+" label={numbers.labels.alumniNetwork} className="border-brand-fg/35" />
          )}
        </div>
      </section>

      <section className="section-shell surface-grid">
        <div className="site-shell">
          <SectionHeader
            eyebrow="One ecosystem"
            title="Start wherever you are."
            description="There is no single route into entrepreneurship. Pick the door that is useful today."
          />
          <div className="grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-3">
            {entryPoints.map((entry) => {
              const Icon = entry.icon
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  className="group relative min-h-72 border-b border-r border-border bg-bg/70 p-6 transition hover:z-10 hover:bg-surface hover:shadow-md sm:p-8"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="text-xs font-bold tabular-nums tracking-[0.13em] text-fg-subtle">{entry.index}</span>
                    <Icon aria-hidden="true" className="size-6 text-brand transition group-hover:text-accent" strokeWidth={1.5} />
                  </div>
                  <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
                    <h3 className="display-type text-2xl font-semibold">{entry.label}</h3>
                    <p className="mt-3 max-w-sm text-sm leading-6 text-fg-muted">{entry.description}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-fg transition group-hover:text-accent">
                      Explore <ArrowRight aria-hidden="true" className="size-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-surface">
        <div className="site-shell grid gap-8 py-16 md:grid-cols-[0.8fr_1.2fr] md:items-end md:py-22">
          <div>
            <p className="eyebrow">No noise, just signal</p>
            <h2 className="display-type mt-5 text-4xl font-semibold leading-none sm:text-5xl">Know what is happening before the poster hits the group.</h2>
          </div>
          <NewsletterSignup source="homepage" />
        </div>
      </section>
    </>
  )
}
