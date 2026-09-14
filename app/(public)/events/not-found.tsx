import { SectionNotFound } from '@/components/public/section-not-found'

export default function EventNotFound() {
  return (
    <SectionNotFound
      eyebrow="Event not found"
      title="That session is no longer on the programme."
      description="It may have moved, ended or been unpublished. The current calendar has every event that is open to view."
      href="/events"
      action="See all events"
    />
  )
}
