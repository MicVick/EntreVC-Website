import { SectionNotFound } from '@/components/public/section-not-found'

export default function TeamYearNotFound() {
  return (
    <SectionNotFound
      eyebrow="Roster not found"
      title="That academic year is not in the archive."
      description="Choose another year to see the committee structure and the people behind EntreVC."
      href="/team"
      action="View the current team"
    />
  )
}
