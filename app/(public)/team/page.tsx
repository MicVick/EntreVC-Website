import type { Metadata } from 'next'
import Image from 'next/image'

import { PageHero } from '@/components/public/page-hero'
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
      <PageHero
        eyebrow="The people behind EntreVC"
        title="Team"
        description="EntreVC is run by students, and a new team takes over every year. Here’s who is running it now, how the club is organised, and the teams that came before."
        aside={
          <figure className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-surface shadow-md">
            <Image
              src="/images/editorial/founder-workroom.webp"
              alt="Students collaborating around a worktable"
              width={1600}
              height={900}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="h-full w-full object-cover transition duration-1000 group-hover:scale-[1.025]"
            />
            <figcaption className="meta-label absolute bottom-4 left-4 rounded-sm border border-border bg-bg/85 px-3 py-2 text-fg backdrop-blur">
              Planning the next event
            </figcaption>
          </figure>
        }
      />
      <TeamRoster members={members} verticals={verticals} years={years} activeYear={currentYear} currentYear={currentYear} />
    </>
  )
}
