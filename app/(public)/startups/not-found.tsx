import { SectionNotFound } from '@/components/public/section-not-found'

export default function StartupNotFound() {
  return (
    <SectionNotFound
      eyebrow="Venture not found"
      title="That startup is not in the public directory."
      description="The profile may be awaiting approval or may have been removed at the founder’s request. Browse the ventures currently published."
      href="/startups"
      action="Explore the directory"
    />
  )
}
