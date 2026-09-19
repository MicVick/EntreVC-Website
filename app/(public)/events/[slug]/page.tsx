import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock,
  ExternalLink,
  MapPin,
  PlayCircle,
  Video,
} from 'lucide-react'

import { RegistrationForm } from '@/components/public/registration-form'
import { ShareButton } from '@/components/public/share-button'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'
import { getAllEventSlugs, getEventBySlug } from '@/lib/content'
import { formatDateInIST, formatDateRangeInIST, formatTimeInIST } from '@/lib/format'
import { eventFormatLabels, type Event } from '@/lib/schemas'
import { absoluteUrl, buildMetadata } from '@/lib/seo'

import { EventGallery } from './event-gallery'
import { StickyRegister } from './sticky-register'

const REGISTER_ANCHOR = 'register'

export async function generateStaticParams() {
  const slugs = await getAllEventSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps<'/events/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)

  if (!event) {
    return buildMetadata({
      title: 'Event not found',
      description: 'This event is not available.',
      path: `/events/${slug}`,
    })
  }

  return buildMetadata({
    title: event.title,
    // The subtitle is written for humans; the description is a fallback that at least
    // says something specific rather than repeating the club boilerplate.
    description:
      event.subtitle ??
      event.description.plainText.slice(0, 180) ??
      `An EntreVC event at IIM Ahmedabad on ${formatDateInIST(event.startDateTime)}.`,
    path: `/events/${event.slug}`,
    // Dynamic OG image generation was cut; the hero poster the editor already uploaded
    // does the job and costs the VM nothing.
    image: event.heroImage,
  })
}

/**
 * Turn a recording link into something safe to embed.
 *
 * Only the two hosts the club actually uses are recognised. Anything else falls back to
 * a plain link rather than an iframe, because framing an arbitrary editor-supplied URL
 * would let a mistake in the admin put third-party content inside our page.
 */
function embedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, '')

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = parsed.searchParams.get('v')
      if (id) return `https://www.youtube-nocookie.com/embed/${id}`
      if (parsed.pathname.startsWith('/embed/')) {
        return `https://www.youtube-nocookie.com${parsed.pathname}`
      }
      return null
    }
    if (host === 'vimeo.com') {
      const id = parsed.pathname.slice(1)
      return /^\d+$/.test(id) ? `https://player.vimeo.com/video/${id}` : null
    }
    return null
  } catch {
    return null
  }
}

function eventJsonLd(event: Event): string {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description.plainText.slice(0, 400),
    startDate: event.startDateTime,
    endDate: event.endDateTime,
    eventAttendanceMode:
      event.format === 'online'
        ? 'https://schema.org/OnlineEventAttendanceMode'
        : event.format === 'hybrid'
          ? 'https://schema.org/MixedEventAttendanceMode'
          : 'https://schema.org/OfflineEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    url: absoluteUrl(`/events/${event.slug}`),
    image: event.heroImage ? [absoluteUrl(event.heroImage.url)] : undefined,
    location: event.venue
      ? {
          '@type': 'Place',
          name: event.venue.name,
          address: event.venue.address ?? 'IIM Ahmedabad, Ahmedabad, India',
        }
      : { '@type': 'VirtualLocation', url: absoluteUrl(`/events/${event.slug}`) },
    organizer: {
      '@type': 'Organization',
      name: 'Entrepreneurship & Venture Capital Club, IIM Ahmedabad',
      url: absoluteUrl('/'),
    },
  }).replace(/</g, '\\u003c')
}

export default async function EventDetailPage({ params }: PageProps<'/events/[slug]'>) {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) notFound()

  const recording = event.recap?.recordingUrl ? embedUrl(event.recap.recordingUrl) : null
  const gallery = event.recap?.gallery ?? []
  const showRegistration = !event.isRegistrationClosed

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: eventJsonLd(event) }} />

      <section className="surface-grid border-b border-border">
        <div className="site-shell py-12 sm:py-18">
          <Link
            href={event.isPast ? '/events?when=past' : '/events'}
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-fg-muted transition hover:text-accent"
          >
            <ArrowLeft aria-hidden="true" className="size-4" /> All events
          </Link>

          <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                {event.eventType ? <Badge variant="brand">{event.eventType}</Badge> : null}
                <Badge>{eventFormatLabels[event.format]}</Badge>
                {event.isPast ? <Badge variant="outline">Past event</Badge> : null}
                {!event.isPast && event.isRegistrationClosed ? (
                  <Badge variant="warning">Registrations closed</Badge>
                ) : null}
              </div>

              <h1 className="display-type mt-6 break-words text-4xl font-semibold leading-[0.94] sm:text-6xl lg:text-7xl">
                {event.title}
              </h1>
              {event.subtitle ? (
                <p className="mt-6 max-w-2xl text-lg leading-8 text-fg-muted sm:text-xl">
                  {event.subtitle}
                </p>
              ) : null}

              <dl className="mt-9 grid gap-5 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <CalendarDays aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
                  <div>
                    <dt className="text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">
                      When
                    </dt>
                    <dd className="mt-1 text-sm font-semibold leading-6 text-fg">
                      {formatDateRangeInIST(event.startDateTime, event.endDateTime)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  {event.venue ? (
                    <MapPin aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
                  ) : (
                    <Video aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-accent" />
                  )}
                  <div className="min-w-0">
                    <dt className="text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">
                      Where
                    </dt>
                    <dd className="mt-1 text-sm font-semibold leading-6 text-fg">
                      {event.venue ? (
                        <>
                          {event.venue.name}
                          {event.venue.address ? (
                            <span className="block font-normal text-fg-muted">
                              {event.venue.address}
                            </span>
                          ) : null}
                          {event.venue.mapLink ? (
                            <a
                              href={event.venue.mapLink}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex min-h-11 items-center gap-1 font-bold text-accent hover:underline"
                            >
                              Open in maps <ExternalLink aria-hidden="true" className="size-3.5" />
                            </a>
                          ) : null}
                        </>
                      ) : (
                        <>
                          Online
                          <span className="block font-normal text-fg-muted">
                            The joining link is emailed to everyone who registers.
                          </span>
                        </>
                      )}
                    </dd>
                  </div>
                </div>
              </dl>
            </div>

            <div className="overflow-hidden rounded-lg border border-border bg-surface-2">
              {event.heroImage ? (
                <Image
                  src={event.heroImage.url}
                  alt={event.heroImage.alt}
                  width={event.heroImage.width}
                  height={event.heroImage.height}
                  sizes="(min-width: 1024px) 42vw, 100vw"
                  priority
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="relative aspect-[16/10] overflow-hidden" aria-hidden="true">
                  <Image
                    src="/images/editorial/ideas-in-motion-light.webp"
                    alt=""
                    width={1600}
                    height={900}
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    priority
                    className="h-full w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-fg/55 via-transparent to-transparent" />
                  <span className="display-type absolute bottom-7 left-7 text-4xl font-semibold text-brand-fg sm:text-5xl">
                    {formatDateInIST(event.startDateTime)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="site-shell grid gap-12 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <p className="eyebrow">About this event</p>
            <div
              className="rich-text mt-7 max-w-3xl"
              dangerouslySetInnerHTML={{ __html: event.description.html }}
            />

            {/* ── Recap mode ─────────────────────────────────────────────── */}
            {event.hasRecap ? (
              <div className="mt-16 border-t border-border pt-12">
                <p className="eyebrow">How it went</p>
                <h2 className="display-type mt-5 text-4xl font-semibold sm:text-5xl">
                  The recap.
                </h2>

                {event.recap?.text?.html ? (
                  <div
                    className="rich-text mt-7 max-w-3xl"
                    dangerouslySetInnerHTML={{ __html: event.recap.text.html }}
                  />
                ) : null}

                {event.recap?.recordingUrl ? (
                  recording ? (
                    <div className="mt-10 overflow-hidden rounded-lg border border-border bg-surface-2">
                      <iframe
                        src={recording}
                        title={`Recording — ${event.title}`}
                        loading="lazy"
                        allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="aspect-video h-full w-full border-0"
                      />
                    </div>
                  ) : (
                    <a
                      href={event.recap.recordingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className={cn(buttonVariants({ variant: 'outline' }), 'mt-8')}
                    >
                      <PlayCircle aria-hidden="true" className="size-4" /> Watch the recording
                    </a>
                  )
                ) : null}

                {gallery.length > 0 ? (
                  <div className="mt-12">
                    <h3 className="display-type text-2xl font-semibold">
                      {gallery.length} {gallery.length === 1 ? 'photo' : 'photos'} from the day
                    </h3>
                    <EventGallery images={gallery} eventTitle={event.title} />
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* ── Speakers ───────────────────────────────────────────────── */}
            {event.speakers.length > 0 ? (
              <div className="mt-16 border-t border-border pt-12">
                <p className="eyebrow">Who you will hear from</p>
                <h2 className="display-type mt-5 text-4xl font-semibold sm:text-5xl">
                  {event.speakers.length === 1 ? 'The speaker.' : 'The speakers.'}
                </h2>
                <ul className="mt-10 grid list-none gap-6 p-0 sm:grid-cols-2">
                  {event.speakers.map((speaker) => (
                    <li
                      key={`${event.id}-${speaker.name}`}
                      className="rounded-lg border border-border bg-surface p-5 sm:p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-surface-2">
                          {speaker.photo ? (
                            <Image
                              src={speaker.photo.url}
                              alt={speaker.photo.alt}
                              width={speaker.photo.width}
                              height={speaker.photo.height}
                              sizes="64px"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="display-type text-xl font-semibold text-fg-muted">
                              {speaker.name.slice(0, 1)}
                            </span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-bold text-fg">{speaker.name}</h3>
                          {speaker.title || speaker.org ? (
                            <p className="mt-1 text-sm leading-6 text-fg-muted">
                              {[speaker.title, speaker.org].filter(Boolean).join(' · ')}
                            </p>
                          ) : null}
                          {speaker.linkedin ? (
                            <a
                              href={speaker.linkedin}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-accent hover:underline"
                            >
                              LinkedIn <ArrowUpRight aria-hidden="true" className="size-3.5" />
                            </a>
                          ) : null}
                        </div>
                      </div>
                      {speaker.bio?.html ? (
                        <div
                          className="rich-text mt-4 text-sm"
                          dangerouslySetInnerHTML={{ __html: speaker.bio.html }}
                        />
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* ── Agenda ─────────────────────────────────────────────────── */}
            {event.agenda.length > 0 ? (
              <div className="mt-16 border-t border-border pt-12">
                <p className="eyebrow">Running order</p>
                <h2 className="display-type mt-5 text-4xl font-semibold sm:text-5xl">
                  What happens when.
                </h2>
                <ol className="mt-10 list-none space-y-0 p-0">
                  {event.agenda.map((block, index) => (
                    <li
                      key={`${event.id}-agenda-${index}`}
                      className="grid gap-2 border-t border-border py-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:gap-6"
                    >
                      <p className="flex items-center gap-2 text-sm font-bold text-accent">
                        <Clock aria-hidden="true" className="size-4 shrink-0" />
                        {block.time}
                      </p>
                      <div className="min-w-0">
                        <h3 className="font-bold text-fg">{block.title}</h3>
                        {block.description ? (
                          <p className="mt-1 text-sm leading-6 text-fg-muted">
                            {block.description}
                          </p>
                        ) : null}
                        {block.speakerNames.length > 0 ? (
                          <p className="mt-2 text-sm text-fg-subtle">
                            {block.speakerNames.join(', ')}
                          </p>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>

          {/* ── Aside ────────────────────────────────────────────────────── */}
          <aside className="min-w-0 lg:sticky lg:top-28 lg:h-fit">
            <div id={REGISTER_ANCHOR} className="scroll-mt-28">
              <RegistrationForm event={event} />
            </div>

            <div className="mt-5 rounded-lg border border-border bg-surface p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">
                Event details
              </p>
              <dl className="mt-4 grid gap-3 text-sm">
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                  <dt className="text-fg-subtle">Starts</dt>
                  <dd className="font-semibold text-fg">{formatTimeInIST(event.startDateTime)}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                  <dt className="text-fg-subtle">Ends</dt>
                  <dd className="font-semibold text-fg">{formatTimeInIST(event.endDateTime)}</dd>
                </div>
                <div className="flex flex-wrap justify-between gap-x-4 gap-y-1">
                  <dt className="text-fg-subtle">Format</dt>
                  <dd className="font-semibold text-fg">{eventFormatLabels[event.format]}</dd>
                </div>
              </dl>
              <div className="mt-5 border-t border-border pt-5">
                <ShareButton title={event.title} text={event.subtitle ?? undefined} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Keeps the one action that matters within thumb reach on a phone. */}
      {showRegistration ? (
        <StickyRegister label="Register for this event" targetId={REGISTER_ANCHOR} />
      ) : null}
    </>
  )
}
