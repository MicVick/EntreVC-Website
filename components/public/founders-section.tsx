import Link from 'next/link'

import { EmptyState } from '@/components/public/empty-state'
import { SectionHeader } from '@/components/public/section-header'
import { StartupCard } from '@/components/public/startup-card'
import { StatBlock } from '@/components/public/stat-block'
import { buttonVariants } from '@/components/ui/button'
import { ArrowRightIcon as ArrowRight } from '@/components/ui/icons'
import type { ClubStory, Startup } from '@/lib/schemas'

/**
 * One homepage section for IIMA founders, then and now: the alumni founder wall (from
 * Site settings → Club story) as a compact grid of names, and the featured startups
 * from the directory below it. They used to be two long sections telling one story.
 */
export function FoundersSection({ wall, startups }: { wall: ClubStory['founderWall']; startups: Startup[] }) {
  return (
    <section aria-labelledby="founders-title" className="section-shell isolate">
      <div aria-hidden="true" className="glow-orb -left-48 top-1/4 size-[32rem]" />
      <div className="site-shell">
        <SectionHeader
          id="founders-title"
          eyebrow="Founded at IIMA"
          title="From these classrooms to"
          accent="companies you know."
          description="Some of India’s best-known companies began on this campus. Here are the alumni who built them, and the students and alumni building what comes next."
          action={
            <Link href="/startups" prefetch={false} className={buttonVariants({ variant: 'outline', size: 'md' })}>
              All startups <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          }
          className="mb-8 sm:mb-10"
        />

        {wall.stats.length ? (
          <div className="border-y border-border py-6 sm:py-8">
            <div className="grid grid-cols-3 gap-x-4 sm:gap-x-8">
              {wall.stats.map((stat) => (
                <StatBlock key={stat.label} value={stat.figure} label={stat.label} size="sm" />
              ))}
            </div>
          </div>
        ) : null}

        {wall.companies.length ? (
          <div className="mt-10 sm:mt-12">
            <p className="meta-label flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-fg-subtle">
              <span>
                <span className="text-accent">Then</span> · founded by IIMA alumni
              </span>
              {wall.source ? <span className="normal-case tracking-normal">Source: {wall.source}</span> : null}
            </p>
            <ol aria-label="Companies founded by IIMA alumni" className="reveal-grid mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
              {wall.companies.map((company) => (
                <li key={company.name} className="surface-card min-w-0 rounded-lg px-3.5 py-3 sm:px-5 sm:py-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="display-type min-w-0 text-[1rem] sm:text-lg">{company.name}</h3>
                    {company.foundedYear ? (
                      <span className="meta-label shrink-0 text-[0.65rem] text-fg-subtle">{company.foundedYear}</span>
                    ) : null}
                  </div>
                  <p className="mt-0.5 text-[0.75rem] font-semibold leading-snug text-fg-muted sm:text-sm">{company.founders}</p>
                  {company.description ? (
                    <p className="mt-1 hidden truncate text-sm text-fg-subtle sm:block">{company.description}</p>
                  ) : null}
                </li>
              ))}
            </ol>
          </div>
        ) : null}

        <div className="mt-10 sm:mt-14">
          <p className="meta-label text-fg-subtle">
            <span className="text-accent">Now</span> · building at IIMA
          </p>
          {startups.length ? (
            <div className="snap-strip reveal-grid mt-4 grid gap-4 md:[grid-template-columns:repeat(auto-fit,minmax(min(100%,16rem),1fr))]">
              {startups.map((startup, index) => (
                <StartupCard key={startup.id} startup={startup} priority={index === 0} compact />
              ))}
              <div className="flex min-w-0 flex-col rounded-xl border border-dashed border-accent/70 bg-brand-muted/40 p-5">
                <p className="meta-label text-accent">Founded 20XX</p>
                <p className="accent-serif mt-3 text-[1.9rem] leading-none text-accent">Your startup?</p>
                <p className="mt-3 text-sm leading-6 text-fg-muted">
                  The next name on this wall could be yours. Get listed, or find the support to start.
                </p>
                <div className="mt-auto flex flex-col gap-2 pt-5 text-sm font-semibold">
                  <Link href="/contact?category=startup_listing" prefetch={false} className="inline-flex items-center gap-2 text-accent underline-offset-4 hover:underline">
                    List your startup <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                  <Link href="/iima-ventures" prefetch={false} className="inline-flex items-center gap-2 text-fg underline-offset-4 hover:underline">
                    Where to start <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <EmptyState
              compact
              className="mt-4"
              title="The directory is on its way"
              description="We’re checking details with founders before the first profiles go live. Started something at IIMA? We’d love to list it."
              action={{ href: '/contact?category=startup_listing', label: 'List your startup' }}
            />
          )}
        </div>
      </div>
    </section>
  )
}
