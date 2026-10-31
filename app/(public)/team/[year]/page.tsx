import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { PageHero } from '@/components/public/page-hero'
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
      <PageHero
        eyebrow="Team archive"
        title={`Team ${year}`}
        description={`The EntreVC team for the ${year} academic year. Every team leaves behind events, contacts and know-how for the next one to build on.`}
      />
      <TeamRoster members={members} verticals={verticals} years={years} activeYear={year} currentYear={currentYear} />
    </>
  )
}
