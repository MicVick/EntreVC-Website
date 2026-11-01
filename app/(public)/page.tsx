import type { CSSProperties } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRightIcon as ArrowRight,
  ArrowUpRightIcon as ArrowUpRight,
  BookOpenIcon as BookOpen,
  FlagIcon as Flag,
  MailIcon as Mail,
  RocketIcon as Rocket,
  UsersIcon as Users,
} from '@/components/ui/icons'

import { FounderWall, Pillars, YearStats } from '@/components/public/club-story'
import { EmptyState } from '@/components/public/empty-state'
import { EventCard } from '@/components/public/event-card'
import { Marquee } from '@/components/public/marquee'
import { OrbitBadge } from '@/components/public/orbit-badge'
import { PartnerWall } from '@/components/public/partner-wall'
import { PlazaLaunch } from '@/components/public/plaza-launch'
import { SectionHeader } from '@/components/public/section-header'
import { StartupCard } from '@/components/public/startup-card'
import { StatBlock } from '@/components/public/stat-block'
import { buttonVariants } from '@/components/ui/button'
import {
  getClubStory,
  getFeaturedStartups,
  getKeyNumbers,
  getPartners,
  getPastEvents,
  getResources,
  getSiteSettings,
  getTeam,
  getUpcomingEvents,
  getVentureSchemes,
} from '@/lib/content'
import { formatShortDateInIST } from '@/lib/format'
import { publicExternalUrl } from '@/lib/public-link'
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

type Indexed = CSSProperties & Record<'--w' | '--i', number>
const indexed = (index: number): Indexed => ({ '--w': index, '--i': index })

type Delayed = CSSProperties & Record<'--delay', string>
const delay = (ms: number): Delayed => ({ '--delay': `${ms}ms` })

const HEADLINE = ['Build', 'the', 'thing', 'you', 'keep'] as const
const HEADLINE_ACCENT = ['talking', 'about.'] as const

const COMMUNITY = ['Founders', 'Investors', 'Alumni', 'Mentors', 'First-time builders', 'Ahmedabad'] as const

const CONTACT_TOPICS = [
  { label: 'List or update your startup', category: 'startup_listing' },
  { label: 'Speak at an event', category: 'speaking' },
  { label: 'Mentor IIMA founders', category: 'mentorship' },
  { label: 'Sponsor or partner with us', category: 'sponsorship' },
] as const

/** Four-point stars in the hero sky: [left, top, size in rem]. */
const SPARKLES: readonly (readonly [string, string, number])[] = [
  ['58%', '12%', 0.9],
  ['76%', '7%', 0.6],
  ['91%', '20%', 1.1],
  ['66%', '30%', 0.5],
  ['47%', '6%', 0.55],
]

const SPARKLE_PATH = 'M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z'

function SeeAll({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} prefetch={false} className={buttonVariants({ variant: 'outline', size: 'md' })}>
      {label} <ArrowRight aria-hidden="true" className="size-4" />
    </Link>
  )
}

/**
 * The homepage is a short tour, kept short on purpose (members open it on a phone):
 * the hero, what's on, what the club is, the founder wall, startups, partners, then
 * one row of links to everything else. Card rows swipe sideways on phones. The longer
 * club story lives on /about.
 */
export default async function HomePage() {
  const [settings, story, upcoming, recent, startups, resources, schemes, team, numbers, partners] = await Promise.all([
    getSiteSettings(),
    getClubStory(),
    getUpcomingEvents({ limit: 3 }),
    getPastEvents({ limit: 3 }),
    getFeaturedStartups({ limit: 3 }),
    getResources(),
    getVentureSchemes(),
    getTeam(),
    getKeyNumbers(),
    getPartners(),
  ])

  const nextEvent = upcoming[0] ?? null
  const founderNames = story.founderWall.companies.map((company) => company.name)
  const openSchemes = schemes.filter((scheme) => !scheme.isExpired).length
  const explore = [
    {
      href: '/resources',
      icon: BookOpen,
      title: 'Resources',
      description: resources.length
        ? `${resources.length} free reads, templates and talks, plus the startup playbook.`
        : 'Reading lists, templates and the startup playbook.',
    },
    {
      href: '/iima-ventures',
      icon: Rocket,
      title: 'Founder support',
      description: openSchemes
        ? `${openSchemes} open ${openSchemes === 1 ? 'call' : 'calls'} for grants and incubation at IIMA Ventures.`
        : 'Grants, incubation and funding routes through IIMA Ventures.',
    },
    {
      href: '/team',
      icon: Users,
      title: 'The team',
      description: team.length ? `${team.length} students run the club this year. Meet them.` : 'Run by students. A new team takes over every year.',
    },
    {
      href: '/about',
      icon: Flag,
      title: 'Our story',
      description: 'Last year’s flagships, this year’s plan and the campus we run it from.',
    },
  ] as const

  const organizationJsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'EntreVC, IIM Ahmedabad',
    url: absoluteUrl('/'),
    email: settings.clubEmail,
    address: settings.campusAddress ?? undefined,
    sameAs: settings.socialLinks.map((social) => publicExternalUrl(social.url)).filter((url): url is string => Boolean(url)),
  }).replace(/</g, '\\u003c')

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: organizationJsonLd }} />

      {/* ── Landing ─────────────────────────────────────────────────────────── */}
      {/* Pulled up under the floating header so the dusk glow runs behind the glass. */}
      <section aria-labelledby="home-title" className="relative isolate -mt-[var(--header-height)] overflow-hidden pt-[var(--header-height)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_60%_at_72%_88%,color-mix(in_srgb,var(--color-brand)_26%,transparent),transparent_70%)]"
        />
        {SPARKLES.map(([left, top, size], index) => (
          <svg
            key={`${left}-${top}`}
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            className="sparkle hidden md:block"
            style={{ left, top, width: `${size}rem`, height: `${size}rem`, ...indexed(index) }}
          >
            <path fill="currentColor" d={SPARKLE_PATH} />
          </svg>
        ))}

        <div className="site-shell grid grid-cols-[minmax(0,1fr)] items-center gap-4 pb-14 pt-6 sm:gap-6 sm:pt-12 lg:min-h-[calc(100svh-var(--header-height))] lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-6 lg:pb-28 lg:pt-8">
          <div className="relative z-10 min-w-0">
            <p className="eyebrow animate-enter">Entrepreneurship &amp; Venture Capital Club · IIM Ahmedabad</p>
            <h1 id="home-title" className="display-xl mt-6 text-[clamp(2.6rem,5.4vw,5.25rem)]">
              {HEADLINE.map((word, index) => (
                <span key={word}>
                  <span className="hero-word">
                    <span style={indexed(index)}>{word}</span>
                  </span>{' '}
                </span>
              ))}
              {HEADLINE_ACCENT.map((word, index) => (
                <span key={word}>
                  <span className="hero-word accent-serif">
                    <span className="text-accent" style={indexed(HEADLINE.length + index)}>
                      {word}
                    </span>
                  </span>
                  {index < HEADLINE_ACCENT.length - 1 ? ' ' : null}
                </span>
              ))}
            </h1>
            <p className="animate-enter mt-6 max-w-xl text-base leading-7 text-fg-muted sm:text-lg sm:leading-8" style={delay(450)}>
              EntreVC is IIM Ahmedabad’s Entrepreneurship &amp; Venture Capital Club: the E-cell, as many campuses
              call it. Come to a talk, find a co-founder, pitch an idea, or meet the founders who sat in the same
              classrooms.
            </p>
            <div className="animate-enter mt-9 flex flex-col gap-3 sm:flex-row" style={delay(600)}>
              <Link href="#upcoming-events" className={buttonVariants({ size: 'lg' })}>
                See upcoming events <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <Link href="/startups" prefetch={false} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                Explore startups
              </Link>
            </div>
            {nextEvent ? (
              <Link
                href={`/events/${nextEvent.slug}`}
                prefetch={false}
                className="glass animate-enter group mt-8 inline-flex max-w-full items-center gap-3 rounded-full py-2 pl-4 pr-2 text-sm text-fg-muted transition hover:text-fg"
                style={delay(750)}
              >
                <span aria-hidden="true" className="pulse-dot size-2 shrink-0 rounded-full bg-accent" />
                <span className="meta-label shrink-0 text-accent">Next up</span>
                <span className="truncate">
                  {nextEvent.title} · {formatShortDateInIST(nextEvent.startDateTime)}
                </span>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-fg/10 transition group-hover:rotate-45 group-hover:bg-brand group-hover:text-brand-fg">
                  <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </span>
              </Link>
            ) : null}
          </div>

          {/* First on phones, so the launch is the first thing in view; beside the text on desktop. */}
          <div className="relative -mx-3 order-first sm:mx-0 lg:order-none">
            <PlazaLaunch />
          </div>
        </div>

        <div className="site-shell pointer-events-none absolute inset-x-0 bottom-6 hidden lg:block">
          <OrbitBadge
            href="#upcoming-events"
            label="Scroll to upcoming events"
            ring="Scroll to explore · From the ground up · "
            className="pointer-events-auto"
          />
        </div>
      </section>

      {/* ── Founded by IIMA alumni ──────────────────────────────────────────── */}
      <div className="border-y border-fg/[0.06] bg-bg/40 py-5 backdrop-blur-sm sm:py-7">
        <p className="site-shell meta-label mb-3 text-fg-subtle">{founderNames.length ? 'Started by IIMA alumni' : 'Who it’s for'}</p>
        <Marquee words={founderNames.length ? founderNames : COMMUNITY} />
      </div>

      {/* ── Upcoming events ─────────────────────────────────────────────────── */}
      <section id="upcoming-events" aria-labelledby="upcoming-events-title" className="section-shell isolate">
        <div aria-hidden="true" className="glow-orb -left-56 top-10 size-[36rem]" />
        <div className="site-shell">
          <SectionHeader
            id="upcoming-events-title"
            eyebrow="What’s on"
            title="Upcoming"
            accent="events"
            description="Talks, workshops and competitions coming up at IIMA. Registering takes about a minute."
            action={<SeeAll href="/events" label="All events" />}
          />
          {upcoming.length ? (
            <div className="snap-strip reveal-grid grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {upcoming.map((event) => <EventCard key={event.id} event={event} />)}
            </div>
          ) : (
            <div className="grid gap-12">
              <EmptyState
                compact
                title="Nothing on the calendar right now"
                description="New events usually go up a week or two in advance. Leave your email at the bottom of this page and we’ll tell you when registration opens."
              />
              {recent.length ? (
                <div>
                  <h3 className="meta-label mb-5 text-fg-subtle">Recent events</h3>
                  <div className="snap-strip reveal-grid grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {recent.map((event) => <EventCard key={event.id} event={event} />)}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* ── What is EntreVC ─────────────────────────────────────────────────── */}
      <section aria-labelledby="about-title" className="section-shell isolate">
        <div aria-hidden="true" className="glow-orb -right-48 top-1/3 size-[32rem]" />
        <div className="site-shell">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
            <div>
              <p className="eyebrow">About the club</p>
              <h2 id="about-title" className="display-type mt-4 text-[clamp(1.9rem,3.6vw,3rem)]">
                What is <span className="accent-serif text-accent">EntreVC?</span>
              </h2>
              <p className="scroll-fill-block display-type mt-6 max-w-3xl text-[clamp(1.3rem,2.4vw,2.05rem)] leading-[1.2]">
                <span className="scroll-fill">{settings.positioningStatement}</span>
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/about" prefetch={false} className={buttonVariants({ variant: 'outline', size: 'md' })}>
                  Our story <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
                <Link href="/team" prefetch={false} className={buttonVariants({ variant: 'ghost', size: 'md' })}>
                  Meet the team
                </Link>
              </div>
            </div>
            {story.pillars.length ? (
              <Pillars pillars={story.pillars} layout="list" className="lg:self-end" />
            ) : (
              <div className="grid grid-cols-2 gap-x-8 gap-y-10 self-end sm:grid-cols-3">
                <StatBlock value={numbers.eventsHeld} suffix="+" label={numbers.labels.eventsHeld} size="md" />
                <StatBlock value={numbers.startupsListed} suffix="+" label={numbers.labels.startupsListed} size="md" />
                {numbers.alumniNetwork === null ? null : (
                  <StatBlock value={numbers.alumniNetwork} suffix="+" label={numbers.labels.alumniNetwork} size="md" />
                )}
              </div>
            )}
          </div>
          <YearStats highlights={story.highlights} className="mt-12 sm:mt-16" />
        </div>
      </section>

      {/* ── The founder wall ────────────────────────────────────────────────── */}
      <FounderWall wall={story.founderWall} />

      {/* ── Startups ────────────────────────────────────────────────────────── */}
      <section aria-labelledby="startups-title" className="section-shell isolate">
        <div aria-hidden="true" className="glow-orb -left-40 bottom-0 size-[30rem]" />
        <div className="site-shell">
          <SectionHeader
            id="startups-title"
            eyebrow="Startup directory"
            title="What IIMA students and alumni are"
            accent="building"
            description="A few of the companies in our startup directory, with the founders, their stage and how to reach them."
            action={<SeeAll href="/startups" label="All startups" />}
          />
          {startups.length ? (
            <div className="snap-strip reveal-grid grid gap-6 md:[grid-template-columns:repeat(auto-fit,minmax(min(100%,20rem),1fr))]">
              {startups.map((startup, index) => <StartupCard key={startup.id} startup={startup} priority={index === 0} />)}
            </div>
          ) : (
            <EmptyState
              title="The directory is on its way"
              description="We’re checking details with founders before the first profiles go live. Started something at IIMA? We’d love to list it."
              action={{ href: '/contact?category=startup_listing', label: 'List your startup' }}
            />
          )}
        </div>
      </section>

      {/* ── Partners ────────────────────────────────────────────────────────── */}
      <PartnerWall partners={partners} />

      {/* ── Everything else, one tap away ───────────────────────────────────── */}
      <section aria-labelledby="explore-title" className="section-shell isolate">
        <div className="site-shell">
          <SectionHeader id="explore-title" eyebrow="Keep exploring" title="More from" accent="EntreVC" className="mb-8 sm:mb-10" />
          <ul className="reveal-grid grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
            {explore.map((item) => (
              <li key={item.href} className="min-w-0">
                <Link
                  href={item.href}
                  prefetch={false}
                  className="surface-card spotlight group flex h-full items-center gap-4 rounded-xl p-4 transition duration-500 hover:-translate-y-1 sm:flex-col sm:items-start sm:p-6"
                >
                  <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-muted text-accent">
                    <item.icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="display-type block text-lg sm:text-xl">{item.title}</span>
                    <span className="mt-1 block text-sm leading-6 text-fg-muted">{item.description}</span>
                  </span>
                  <span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full border border-fg/15 transition duration-300 group-hover:translate-x-1 group-hover:border-brand group-hover:bg-brand group-hover:text-brand-fg sm:mt-auto">
                    <ArrowRight className="size-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Get in touch ────────────────────────────────────────────────────── */}
      <section aria-labelledby="contact-title" className="section-shell isolate">
        <div className="site-shell">
          <div className="paper relative isolate overflow-hidden rounded-2xl p-6 shadow-panel sm:p-12 lg:p-16">
            <div aria-hidden="true" className="absolute -right-24 -top-24 -z-10 size-[22rem] rounded-full bg-paper-brand-muted" />
            <svg aria-hidden="true" focusable="false" viewBox="0 0 400 400" className="spin-slow absolute -right-24 -top-24 -z-10 hidden size-[26rem] md:block">
              <circle className="line-art" cx="200" cy="200" r="190" opacity="0.16" />
              <circle className="line-art" cx="200" cy="200" r="150" opacity="0.22" strokeDasharray="2 7" />
              <circle className="line-art" cx="200" cy="200" r="110" opacity="0.1" />
            </svg>
            <div className="grid gap-8 sm:gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="eyebrow">Work with us</p>
                <h2 id="contact-title" className="display-type mt-4 text-[clamp(2.1rem,4.2vw,3.4rem)]">
                  Get in <span className="accent-serif text-accent">touch</span>
                </h2>
                <p className="mt-5 max-w-xl text-base leading-7 text-fg-muted sm:text-lg sm:leading-8">
                  Want to speak at IIMA, list your startup, mentor students or sponsor an event? Write to us and the right
                  person on the team will get back to you.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Link href="/contact" prefetch={false} className={buttonVariants({ size: 'lg' })}>
                    Contact us <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                  <a href={`mailto:${settings.clubEmail}`} className="inline-flex min-h-12 items-center gap-2 px-1 text-sm font-semibold text-fg underline decoration-border-strong underline-offset-4 transition hover:text-accent">
                    <Mail aria-hidden="true" className="size-4" /> {settings.clubEmail}
                  </a>
                </div>
              </div>
              <ul className="flex flex-wrap gap-2.5 lg:justify-end">
                {CONTACT_TOPICS.map((item) => (
                  <li key={item.category}>
                    <Link
                      href={`/contact?category=${item.category}`}
                      prefetch={false}
                      className="group inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface-2/60 py-2 pl-4 pr-2 text-sm font-semibold text-fg transition hover:border-fg hover:bg-fg hover:text-bg"
                    >
                      {item.label}
                      <span aria-hidden="true" className="flex size-7 items-center justify-center rounded-full bg-fg/[0.07] transition group-hover:rotate-45 group-hover:bg-brand group-hover:text-brand-fg">
                        <ArrowUpRight className="size-3.5" />
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
