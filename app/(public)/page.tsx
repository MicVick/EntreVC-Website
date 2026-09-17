import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Lightbulb,
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
    label: 'Attend an event',
    description: 'See what is coming up and reserve your place.',
    icon: CalendarDays,
    index: '01',
  },
  {
    href: '/startups',
    label: 'Explore IIMA startups',
    description: 'Search ventures by sector, stage or founder batch.',
    icon: Building2,
    index: '02',
  },
  {
    href: '/resources',
    label: 'Find a useful resource',
    description: 'Open practical playbooks, reports, tools and talks.',
    icon: BookOpen,
    index: '03',
  },
  {
    href: '/iima-ventures',
    label: 'Get venture support',
    description: 'Find grants, incubation and institutional routes.',
    icon: Lightbulb,
    index: '04',
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
        <div className="site-shell grid gap-9 py-12 sm:py-16 lg:min-h-[clamp(34rem,72svh,42rem)] lg:grid-cols-[minmax(0,1.16fr)_minmax(20rem,0.84fr)] lg:items-center lg:py-18">
          <div className="self-center">
            <p className="eyebrow">Entrepreneurship × Venture Capital · IIM Ahmedabad</p>
            <h1 className="display-type mt-6 max-w-5xl text-[clamp(3.25rem,8vw,7.15rem)] font-semibold leading-[0.88]">
              Ideas deserve a place to become{' '}
              <span className="text-accent">real.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-7 text-fg-muted sm:text-lg sm:leading-8">
              {settings.positioningStatement}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/events" prefetch={false} className={buttonVariants({ size: 'lg' })}>
                Browse upcoming events
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link href="/startups" prefetch={false} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                Explore IIMA startups
              </Link>
            </div>
          </div>

          <div className="animate-enter-delayed group relative mx-auto w-full max-w-xl lg:mx-0 lg:ml-auto">
            <div className="relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-surface shadow-lg lg:aspect-[4/3]">
              <Image
                src="/images/editorial/ideas-in-motion.webp"
                alt="Abstract architectural forms built around a red focal point"
                width={1600}
                height={900}
                sizes="(min-width: 1024px) 40vw, 100vw"
                priority
                className="h-full w-full object-cover transition duration-1000 group-hover:scale-[1.025]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/70 via-transparent to-transparent" />
              <div className="surface-grid absolute inset-0 opacity-35" aria-hidden="true" />
              <p className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/20 bg-bg/70 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-fg backdrop-blur">
                <span className="signal-dot size-1.5 rounded-full bg-accent" />
                Ideas in motion
              </p>
            </div>
            <div className="absolute -bottom-4 left-4 rounded-md border border-border bg-bg/92 px-4 py-3 text-xs font-bold uppercase tracking-[0.13em] text-fg-muted shadow-md backdrop-blur sm:left-8">
              Student-led · Alumni-connected
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="choose-path" className="border-b border-border bg-surface">
        <div className="site-shell py-10 sm:py-12">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Choose your next step</p>
              <h2 id="choose-path" className="display-type mt-4 text-3xl font-semibold sm:text-4xl">What are you here to do?</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-fg-muted">Go straight to the part of the EntreVC ecosystem that is useful today.</p>
          </div>
          <div className="reveal-grid mt-7 grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
            {entryPoints.map((entry) => {
              const Icon = entry.icon
              return (
                <Link
                  key={entry.href}
                  href={entry.href}
                  prefetch={false}
                  className="group flex min-h-48 flex-col border-b border-r border-border bg-bg/70 p-5 transition hover:z-10 hover:bg-surface-2 sm:p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <Icon aria-hidden="true" className="size-5 text-accent" strokeWidth={1.7} />
                    <span className="text-xs font-bold tabular-nums tracking-[0.13em] text-fg-subtle">{entry.index}</span>
                  </div>
                  <div className="mt-auto pt-8">
                    <h3 className="display-type text-xl font-semibold">{entry.label}</h3>
                    <p className="mt-2 text-sm leading-6 text-fg-muted">{entry.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-fg transition group-hover:text-accent">
                      Go there <ArrowRight aria-hidden="true" className="size-4 transition group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      <section id="intro" className="border-b border-border bg-surface">
        <div className="site-shell grid gap-7 py-12 md:grid-cols-[0.58fr_1.42fr] md:py-16">
          <p className="eyebrow self-start">What EntreVC does</p>
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
            <div className="reveal-grid grid gap-5 lg:grid-cols-3">
              {events.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-y border-border bg-surface">
        <div className="site-shell grid gap-6 py-10 md:grid-cols-[0.8fr_1.2fr] md:items-end md:py-12">
          <div>
            <p className="eyebrow">Event alerts</p>
            <h2 className="display-type mt-4 text-3xl font-semibold leading-none sm:text-4xl">Know what is coming up.</h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-fg-muted">Occasional updates with new sessions, deadlines and useful club news.</p>
          </div>
          <NewsletterSignup source="homepage" compact />
        </div>
      </section>

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
            <div className="reveal-grid grid gap-5 md:grid-cols-2 xl:grid-cols-3">
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
          <StatBlock value={numbers.eventsHeld} suffix="+" label={numbers.labels.eventsHeld} className="border-brand-fg/35 [&>p]:text-brand-fg" />
          <StatBlock value={numbers.startupsListed} suffix="+" label={numbers.labels.startupsListed} className="border-brand-fg/35 [&>p]:text-brand-fg" />
          {numbers.alumniNetwork === null ? null : (
            <StatBlock value={numbers.alumniNetwork} suffix="+" label={numbers.labels.alumniNetwork} className="border-brand-fg/35 [&>p]:text-brand-fg" />
          )}
        </div>
      </section>

      <section className="section-shell surface-grid">
        <div className="site-shell grid gap-9 lg:grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] lg:items-center">
          <figure className="reveal-on-scroll group relative overflow-hidden rounded-lg border border-border bg-surface shadow-md">
            <Image
              src="/images/editorial/founder-workroom.webp"
              alt="A small group of students developing an idea around a worktable"
              width={1600}
              height={900}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="aspect-[16/10] w-full object-cover opacity-90 transition duration-1000 group-hover:scale-[1.025] group-hover:opacity-100"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-bg/78 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.13em] text-fg backdrop-blur">
              The work happens together
            </figcaption>
          </figure>
          <div>
            <p className="eyebrow">The people behind the platform</p>
            <h2 className="display-type mt-4 max-w-xl text-4xl font-semibold leading-[0.98] sm:text-5xl">A student team, built to be useful.</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-fg-muted">
              EntreVC connects builders, operators, alumni and investors—then makes the next conversation easier to start.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/team" className={buttonVariants({ variant: 'outline' })}>
                Meet the team <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link href="/contact" className={buttonVariants()}>
                Contact EntreVC <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
