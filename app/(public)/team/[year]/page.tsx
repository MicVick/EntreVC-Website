import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { TeamRoster } from '@/components/public/team-roster'
import { getTeam, getTeamYears, getVerticals } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

export async function generateStaticParams() {
  const years = await getTeamYears()
  return years.slice(1).map((year) => ({ year }))
}

export async function generateMetadata({ params }: PageProps<'/team/[year]'>): Promise<Metadata> {
  const { year } = await params
  return buildMetadata({
    title: `Team ${year}`,
    description: `Meet the EntreVC team from the ${year} academic year.`,
    path: `/team/${year}`,
  })
}

export default async function ArchivedTeamPage({ params }: PageProps<'/team/[year]'>) {
  const { year } = await params
  const years = await getTeamYears()
  if (!years.includes(year)) notFound()

  const [members, verticals] = await Promise.all([getTeam(year), getVerticals()])
  const currentYear = years[0] ?? year

  return (
    <>
      <section className="surface-grid border-b border-border">
        <div className="site-shell py-16 sm:py-24">
          <p className="eyebrow">Team archive · {year}</p>
          <h1 className="display-type mt-6 max-w-5xl text-5xl font-semibold leading-[0.9] sm:text-7xl lg:text-8xl">
            The people who moved the club{' '}
            <span className="text-accent">forward.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-fg-muted">Every committee leaves behind events, relationships and knowledge for the next one to build on.</p>
        </div>
      </section>
      <TeamRoster members={members} verticals={verticals} years={years} activeYear={year} currentYear={currentYear} />
    </>
  )
}
