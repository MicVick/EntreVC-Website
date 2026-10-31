import type { Metadata } from 'next'
import { Suspense } from 'react'

import { PageHero } from '@/components/public/page-hero'
import { Skeleton } from '@/components/ui/skeleton'
import { getEventTypes, getPastEvents, getUpcomingEvents } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

import { EventsBrowser } from './events-browser'

export const metadata: Metadata = buildMetadata({
  title: 'Events',
  description:
    'Speaker sessions, workshops, competitions and founder clinics run by the Entrepreneurship & Venture Capital Club at IIM Ahmedabad.',
  path: '/events',
})

/**
 * The events index.
 *
 * Upcoming and past are two separate reads rather than one list split in the browser,
 * because the split is decided by `endDateTime` against the clock at render time. An
 * event that finishes tonight moves itself to Past at the next revalidation with nobody
 * touching the admin — which is the only way the homepage can be trusted not to show a
 * session that already happened.
 */
export default async function EventsPage() {
  const [upcoming, past, eventTypes] = await Promise.all([
    getUpcomingEvents(),
    getPastEvents(),
    getEventTypes(),
  ])

  return (
    <>
      <PageHero
        eyebrow="What’s on"
        title="Events"
        description="Talks, workshops and competitions through the year. Most are open to everyone at IIMA. Registering takes about a minute, and the calendar invite lands in your inbox straight away."
      />

      <section className="section-shell">
        <div className="site-shell">
          {/* useSearchParams needs a Suspense boundary for this page to stay static. */}
          <Suspense fallback={<Skeleton className="min-h-[40rem] w-full" />}>
            <EventsBrowser upcoming={upcoming} past={past} eventTypes={eventTypes} />
          </Suspense>
        </div>
      </section>
    </>
  )
}
