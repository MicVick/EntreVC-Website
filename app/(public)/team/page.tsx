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
        title={<>Meet the team carrying the work <span className="text-accent">forward.</span></>}
        description="See the current committee, understand how the club is organised and revisit the teams that built what we inherited."
        aside={
          <figure className="group relative aspect-[16/10] overflow-hidden rounded-lg border border-border bg-surface shadow-md">
            <Image
              src="/images/editorial/founder-workroom-light.webp"
              alt="Students collaborating around a worktable"
              width={1600}
              height={900}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="h-full w-full object-cover transition duration-1000 group-hover:scale-[1.025]"
            />
            <figcaption className="absolute bottom-4 left-4 rounded-full border border-border bg-bg/85 px-3 py-2 text-[0.65rem] font-bold uppercase tracking-[0.13em] text-fg backdrop-blur">
              One team · Four verticals
            </figcaption>
          </figure>
        }
      />
      <TeamRoster members={members} verticals={verticals} years={years} activeYear={currentYear} currentYear={currentYear} />
    </>
  )
}
