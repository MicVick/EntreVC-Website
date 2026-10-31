import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { EmptyState } from '@/components/public/empty-state'
import { PersonCard } from '@/components/public/person-card'
import { cn } from '@/components/ui/cn'
import type { TeamMember, Vertical } from '@/lib/schemas'

type TeamRosterProps = {
  members: TeamMember[]
  verticals: Vertical[]
  years: string[]
  activeYear: string
  currentYear: string
}

export function TeamRoster({ members, verticals, years, activeYear, currentYear }: TeamRosterProps) {
  const ungrouped = members.filter((member) => !member.vertical || !verticals.some((vertical) => vertical.name === member.vertical))

  return (
    <>
      <section className="site-shell">
        <div className="glass rounded-xl px-6 py-7 sm:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">Academic year</p>
              <p className="display-type mt-2 text-3xl font-semibold">{activeYear}</p>
            </div>
            <nav aria-label="Team year" className="flex max-w-full flex-wrap gap-2">
              {years.map((year) => {
                const href = year === currentYear ? '/team' : `/team/${year}`
                return (
                  <Link
                    key={year}
                    href={href}
                    aria-current={activeYear === year ? 'page' : undefined}
                    className="min-h-10 rounded-full border border-border bg-bg/60 px-4 py-2 text-sm font-semibold text-fg-muted transition hover:border-border-strong hover:text-fg aria-[current=page]:border-brand aria-[current=page]:bg-brand-muted aria-[current=page]:text-accent"
                  >
                    {year}{year === currentYear ? ' · Current' : ''}
                  </Link>
                )
              })}
            </nav>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="site-shell">
          <div className="mb-12">
            <p className="eyebrow">How the club is organised</p>
            <h2 className="display-type mt-3 max-w-4xl text-[clamp(2rem,4.2vw,3rem)]">Who does what</h2>
            {verticals.length ? (
              <div className="reveal-grid relative mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {verticals.map((vertical, index) => (
                  <div key={vertical.name} className="surface-card spotlight min-h-52 rounded-xl p-6 transition duration-500 hover:-translate-y-1">
                    <span className="flex size-9 items-center justify-center rounded-full bg-brand-muted font-mono text-xs font-medium tabular-nums text-accent">{String(index + 1).padStart(2, '0')}</span>
                    <h3 className="display-type mt-8 text-2xl font-semibold">{vertical.name}</h3>
                    {vertical.description ? <p className="mt-3 text-sm leading-6 text-fg-muted">{vertical.description}</p> : null}
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {members.length ? (
            <div className="space-y-16">
              {verticals.map((vertical) => {
                const group = members.filter((member) => member.vertical === vertical.name)
                if (!group.length) return null
                return (
                  <section key={vertical.name} aria-labelledby={`vertical-${vertical.order}`}>
                    <div className="flex items-end justify-between gap-4 border-b border-border pb-5">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">Vertical</p>
                        <h2 id={`vertical-${vertical.order}`} className="display-type mt-2 text-3xl font-semibold sm:text-4xl">{vertical.name}</h2>
                      </div>
                      <p className="text-sm text-fg-subtle">{group.length} {group.length === 1 ? 'member' : 'members'}</p>
                    </div>
                    <div className={cn('reveal-grid mt-7 grid gap-x-5 gap-y-9 sm:grid-cols-2 lg:grid-cols-4', group.length < 4 && 'lg:grid-cols-3')}>
                      {group.map((person) => <PersonCard key={person.id} person={person} />)}
                    </div>
                  </section>
                )
              })}

              {ungrouped.length ? (
                <section aria-labelledby="vertical-other">
                  <h2 id="vertical-other" className="display-type border-b border-border pb-5 text-3xl font-semibold">Across the club</h2>
                  <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {ungrouped.map((person) => <PersonCard key={person.id} person={person} />)}
                  </div>
                </section>
              ) : null}
            </div>
          ) : (
            <EmptyState
              title="This year’s team isn’t up yet"
              description="Pick another year to see past teams, or write to us if you need someone on the current team."
              action={{ href: '/contact', label: 'Contact EntreVC' }}
            />
          )}

          <div className="mt-16 flex flex-col gap-6 rounded-lg border border-brand bg-brand-muted p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
              <h2 className="display-type text-2xl">Not sure who to talk to?</h2>
              <p className="mt-2 text-sm leading-6 text-fg-muted">Use the category-based contact form and your note will reach the relevant vertical.</p>
            </div>
            <Link href="/contact" className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md bg-brand px-5 text-sm font-semibold text-brand-fg transition hover:bg-brand-strong">
              Find a contact <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
