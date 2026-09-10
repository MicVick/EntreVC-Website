import type { Metadata } from 'next'

import { TeamRoster } from '@/components/public/team-roster'
import { getTeam, getTeamYears, getVerticals } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Team',
  description: 'Meet the current EntreVC team and explore the club structure and past committee archive.',
  path: '/team',
})

export default async function TeamPage() {
  const [members, years, verticals] = await Promise.all([getTeam(), getTeamYears(), getVerticals()])
  const currentYear = years[0] ?? members[0]?.academicYear ?? 'Current'

  return (
    <>
      <section className="surface-grid border-b border-border">
        <div className="site-shell py-16 sm:py-24">
          <p className="eyebrow">The people carrying it forward</p>
          <h1 className="display-type mt-6 max-w-5xl text-5xl font-semibold leading-[0.9] sm:text-7xl lg:text-8xl">
            A club should feel like a{' '}
            <span className="text-accent">lineage, not a reset.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-fg-muted">Meet the current committee, understand how the work is organised, and revisit the teams that built what we inherited.</p>
        </div>
      </section>
      <TeamRoster members={members} verticals={verticals} years={years} activeYear={currentYear} currentYear={currentYear} />
    </>
  )
}
