import type { ComponentType, SVGProps } from 'react'
import Link from 'next/link'

import { SectionHeader } from '@/components/public/section-header'
import { StatBlock } from '@/components/public/stat-block'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/components/ui/cn'
import {
  ArrowRightIcon as ArrowRight,
  FlagIcon,
  GlobeIcon,
  HandshakeIcon,
  SproutIcon,
  TrophyIcon,
  UsersIcon,
} from '@/components/ui/icons'
import type { ClubStory, Pillar } from '@/lib/schemas'

/**
 * The homepage sections about the club, all edited under Site settings → Club story.
 * Each one renders nothing when its content is empty, so a new team can fill them in
 * one at a time.
 */

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>

const PILLAR_ICONS: readonly IconComponent[] = [UsersIcon, TrophyIcon, HandshakeIcon]
const PHASE_ICONS: readonly IconComponent[] = [GlobeIcon, SproutIcon, FlagIcon]

function iconAt(icons: readonly IconComponent[], index: number): IconComponent {
  return icons[index % icons.length] ?? UsersIcon
}

/** "Who we are": three facts about the club, as cards, or as a compact stacked list. */
export function Pillars({ pillars, layout = 'cards', className }: { pillars: Pillar[]; layout?: 'cards' | 'list'; className?: string }) {
  if (!pillars.length) return null
  if (layout === 'list') {
    return (
      <ul className={cn('reveal-grid grid gap-3', className)}>
        {pillars.map((pillar, index) => {
          const Icon = iconAt(PILLAR_ICONS, index)
          return (
            <li key={pillar.title} className="surface-card flex min-w-0 items-start gap-4 rounded-xl p-4 sm:p-5">
              <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-muted text-accent">
                <Icon className="size-5" />
              </span>
              <div className="min-w-0">
                <h3 className="display-type flex flex-wrap items-baseline gap-x-2 text-lg">
                  {pillar.figure ? <span className="tabular-nums text-accent">{pillar.figure}</span> : null}
                  {pillar.title}
                </h3>
                {pillar.description ? <p className="mt-1 text-sm leading-6 text-fg-muted">{pillar.description}</p> : null}
              </div>
            </li>
          )
        })}
      </ul>
    )
  }
  return (
    <ul className={cn('reveal-grid grid gap-4 sm:grid-cols-3', className)}>
      {pillars.map((pillar, index) => {
        const Icon = iconAt(PILLAR_ICONS, index)
        return (
          <li key={pillar.title} className="surface-card flex min-w-0 flex-col rounded-xl p-6">
            <div className="flex items-center justify-between gap-3">
              <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-muted text-accent">
                <Icon className="size-5" />
              </span>
              {pillar.figure ? <span className="display-xl text-[2rem] tabular-nums">{pillar.figure}</span> : null}
            </div>
            <h3 className="display-type mt-6 text-xl">{pillar.title}</h3>
            {pillar.description ? <p className="mt-2 text-sm leading-6 text-fg-muted">{pillar.description}</p> : null}
          </li>
        )
      })}
    </ul>
  )
}

/** The IIMA founder wall: well-known companies started by alumni, then an empty slot. */
export function FounderWall({ wall }: { wall: ClubStory['founderWall'] }) {
  if (!wall.companies.length) return null
  return (
    <section aria-labelledby="founder-wall-title" className="section-shell isolate">
      <div aria-hidden="true" className="glow-orb -left-48 top-1/3 size-[32rem]" />
      <div className="site-shell">
        <SectionHeader
          id="founder-wall-title"
          eyebrow="The IIMA founder wall"
          title="What do they have in common? All were founded by"
          accent="IIMA alumni."
          description="Some of India’s best-known companies began with someone who studied on this campus. Our job is to add the next names to this wall."
          className="mb-8 sm:mb-12"
        />

        <ol aria-label="Companies founded by IIMA alumni" className="snap-strip snap-strip-narrow reveal-grid grid gap-4 md:grid-cols-3 lg:grid-cols-5">
          {wall.companies.map((company) => (
            <li key={company.name} className="surface-card flex min-w-0 flex-col rounded-xl p-4 sm:p-6">
              {company.foundedYear ? <p className="meta-label text-fg-subtle">Founded {company.foundedYear}</p> : null}
              <h3 className="display-type mt-2 break-words text-[1.15rem] sm:text-[1.45rem]">{company.name}</h3>
              <p className="mt-1 text-[0.8rem] font-semibold leading-5 text-fg sm:text-sm">{company.founders}</p>
              {company.description ? (
                <p className="mt-auto pt-3 text-[0.8rem] leading-5 text-fg-muted sm:pt-4 sm:text-sm sm:leading-6">{company.description}</p>
              ) : null}
            </li>
          ))}
          <li className="flex min-w-0 flex-col rounded-xl border border-dashed border-accent/70 bg-brand-muted/40 p-4 sm:p-6">
            <p className="meta-label text-accent">Founded 20XX</p>
            <p className="accent-serif mt-2 text-[1.6rem] leading-none text-accent sm:text-[1.9rem]">You?</p>
            <p className="mt-2 text-[0.8rem] font-semibold text-fg sm:text-sm">Your name here</p>
            <p className="mt-1 text-[0.8rem] leading-5 text-fg-muted sm:text-sm sm:leading-6">The next consequential venture.</p>
            <Link href="/iima-ventures" prefetch={false} className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-accent underline-offset-4 hover:underline">
              Where to start <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </li>
        </ol>

        {wall.stats.length ? (
          <div className="mt-8 sm:mt-12">
            <div className="grid grid-cols-3 gap-x-4 sm:gap-x-8">
              {wall.stats.map((stat) => (
                <StatBlock key={stat.label} value={stat.figure} label={stat.label} size="sm" />
              ))}
            </div>
            {wall.source ? <p className="mt-5 text-xs text-fg-subtle">Source: {wall.source}</p> : null}
          </div>
        ) : null}
      </div>
    </section>
  )
}

/** Last year's headline figures as one band: the short homepage version of YearHighlights. */
export function YearStats({ highlights, className }: { highlights: ClubStory['highlights']; className?: string }) {
  if (!highlights.stats.length) return null
  return (
    <div className={className}>
      <p className="meta-label text-fg-subtle">{highlights.yearLabel ? `EntreVC in ${highlights.yearLabel}` : 'Last year'}</p>
      <div className="mt-4 grid grid-cols-2 gap-y-8 border-y border-border py-7 sm:py-9 lg:grid-cols-4">
        {highlights.stats.map((stat, index) => (
          <StatBlock
            key={stat.label}
            value={stat.figure}
            label={stat.label}
            size="md"
            className={cn('px-1 sm:px-6', index % 2 === 1 && 'border-l border-border pl-5', index > 0 && 'lg:border-l lg:border-border lg:pl-6')}
          />
        ))}
      </div>
    </div>
  )
}

/** Last year in numbers: headline figures, the flagships and the rest of the calendar. */
export function YearHighlights({ highlights }: { highlights: ClubStory['highlights'] }) {
  if (!highlights.stats.length && !highlights.flagships.length) return null
  return (
    <section aria-labelledby="highlights-title" className="section-shell isolate">
      <div aria-hidden="true" className="glow-orb -right-48 top-10 size-[30rem]" />
      <div className="site-shell">
        <SectionHeader
          id="highlights-title"
          eyebrow={highlights.yearLabel ? `EntreVC in ${highlights.yearLabel}` : 'Last year'}
          title="Last year,"
          accent="in numbers."
          description="What the club ran, who came and what came out of it."
        />

        {highlights.stats.length ? (
          <div className="grid grid-cols-2 gap-y-10 border-y border-border py-10 lg:grid-cols-4">
            {highlights.stats.map((stat, index) => (
              <StatBlock
                key={stat.label}
                value={stat.figure}
                label={stat.label}
                className={cn('px-1 sm:px-6', index % 2 === 1 && 'border-l border-border', index > 0 && 'lg:border-l lg:border-border')}
              />
            ))}
          </div>
        ) : null}

        {highlights.flagships.length ? (
          <>
            <h3 className="eyebrow mt-14">Flagships</h3>
            <ul className="reveal-grid mt-6 grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,14rem),1fr))]">
              {highlights.flagships.map((flagship) => (
                <li key={flagship.name} className="surface-card flex min-w-0 flex-col rounded-xl p-6">
                  {flagship.figure ? (
                    <p className="display-xl text-[2.4rem] tabular-nums text-accent">{flagship.figure}</p>
                  ) : null}
                  {flagship.unit ? <p className="meta-label mt-1 text-fg-subtle">{flagship.unit}</p> : null}
                  <h4 className="display-type mt-5 text-xl">{flagship.name}</h4>
                  {flagship.description ? <p className="mt-2 text-sm leading-6 text-fg-muted">{flagship.description}</p> : null}
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {highlights.otherEvents.length ? (
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <h3 className="meta-label shrink-0 text-fg-muted">Also on the calendar</h3>
            <ul className="flex flex-wrap gap-2">
              {highlights.otherEvents.map((name) => (
                <li key={name} className="rounded-full border border-border-strong px-4 py-2 text-sm text-fg">
                  {name}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}

/** The plan for this year, in phases. */
export function RoadAhead({ roadmap }: { roadmap: ClubStory['roadmap'] }) {
  if (!roadmap.phases.length) return null
  return (
    <section aria-labelledby="road-ahead-title" className="section-shell isolate">
      <div className="site-shell">
        <SectionHeader
          id="road-ahead-title"
          eyebrow={roadmap.yearLabel ? `The plan for ${roadmap.yearLabel}` : 'This year'}
          title="The road"
          accent="ahead"
          description="What the club is building towards this year. New ones are marked."
        />
        <div className="relative">
          {/* The dotted line joining the phases, behind their icons. */}
          <span aria-hidden="true" className="absolute inset-x-[16%] top-7 hidden border-t-2 border-dotted border-accent/50 lg:block" />
          <ol className="reveal-grid relative grid gap-5 lg:grid-cols-3">
            {roadmap.phases.map((phase, index) => {
              const Icon = iconAt(PHASE_ICONS, index)
              return (
                <li key={phase.name} className="min-w-0">
                  <div className="flex items-center gap-4 lg:flex-col lg:gap-3">
                    <span aria-hidden="true" className="flex size-14 shrink-0 items-center justify-center rounded-full border-2 border-accent bg-bg text-accent">
                      <Icon className="size-6" />
                    </span>
                    <h3 className="meta-label text-sm text-accent">{phase.name}</h3>
                  </div>
                  <ul className="surface-card mt-5 divide-y divide-border rounded-xl px-6">
                    {phase.items.map((item) => (
                      <li key={item.title} className="py-5">
                        <p className="flex flex-wrap items-center gap-2 font-semibold text-fg">
                          {item.title}
                          {item.isNew ? <Badge variant="brand">New</Badge> : null}
                        </p>
                        {item.description ? <p className="mt-1 text-sm leading-6 text-fg-muted">{item.description}</p> : null}
                      </li>
                    ))}
                  </ul>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </section>
  )
}
