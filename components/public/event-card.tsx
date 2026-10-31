import Link from 'next/link'
import { ArrowRightIcon as ArrowRight, ArrowUpRightIcon as ArrowUpRight, ClockIcon as Clock3, MapPinIcon as MapPin } from '@/components/ui/icons'

import { ContentImage } from '@/components/public/content-image'
import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'
import { eventFormatLabels, type Event } from '@/lib/schemas'
import { formatDateRangeInIST, formatDayMonthInIST } from '@/lib/format'

export type EventCardProps = {
  event: Event
  featured?: boolean
  registrationLabel?: string
  className?: string
}

/**
 * An event as an off-white sheet on the dark page: the card people act on most, so it
 * gets the most contrast. The photo sits inset with a calendar-style date chip; the
 * whole card links to the event and the button jumps straight to registration when it
 * is open.
 */
export function EventCard({ event, featured = false, registrationLabel, className }: EventCardProps) {
  const href = `/events/${event.slug}`
  const canRegister = !event.isPast && !event.isRegistrationClosed
  const cta = registrationLabel ?? (event.isPast ? 'View recap' : canRegister ? 'Register' : 'View details')
  const ctaHref = canRegister ? `${href}#register` : href
  const date = formatDayMonthInIST(event.startDateTime)

  return (
    <article
      className={cn(
        'paper spotlight group relative flex min-w-0 flex-col overflow-hidden rounded-xl p-2 shadow-card ring-1 ring-black/5 transition duration-500 hover:-translate-y-1 focus-within:ring-2 focus-within:ring-accent',
        featured && 'md:grid md:grid-cols-[1.1fr_0.9fr]',
        className,
      )}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-lg bg-surface-2',
          featured ? 'aspect-[16/10] md:aspect-auto md:min-h-full' : 'aspect-[16/10]',
        )}
      >
        <ContentImage
          image={event.heroImage}
          kind="event"
          label={event.title}
          sizes={featured ? '(min-width: 768px) 52vw, 100vw' : '(min-width: 1280px) 30vw, (min-width: 768px) 46vw, 100vw'}
          className={featured ? 'md:absolute md:inset-0' : undefined}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/45 to-transparent" />
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {event.eventType ? <Badge variant="brand">{event.eventType}</Badge> : null}
          <Badge>{eventFormatLabels[event.format]}</Badge>
        </div>
        {date ? (
          <div
            aria-hidden="true"
            className="absolute bottom-3 left-3 flex min-w-14 flex-col items-center rounded-md bg-paper px-2.5 pb-1.5 pt-1 text-ink shadow-lg"
          >
            <span className="text-2xl font-semibold leading-none tracking-[-0.04em] tabular-nums">{date.day}</span>
            <span className="meta-label mt-1 text-[0.6rem] text-paper-accent">{date.month}</span>
          </div>
        ) : null}
      </div>

      <div className={cn('flex min-w-0 flex-1 flex-col px-3.5 pb-3.5 pt-5', featured && 'sm:px-6 sm:pb-6')}>
        <h3 className={cn('display-type line-clamp-3 break-words text-fg', featured ? 'text-2xl sm:text-3xl' : 'text-[1.4rem]')}>
          <Link href={href} className="after:absolute after:inset-0 after:z-[2] focus-visible:outline-none">
            {event.title}
          </Link>
        </h3>
        {event.subtitle ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-fg-muted">{event.subtitle}</p>
        ) : null}

        <dl className="mt-4 grid gap-1.5 text-[0.84rem] text-fg-muted">
          <div className="flex items-start gap-2">
            <dt className="sr-only">When</dt>
            <Clock3 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-accent" />
            <dd>{formatDateRangeInIST(event.startDateTime, event.endDateTime)}</dd>
          </div>
          <div className="flex items-start gap-2">
            <dt className="sr-only">Where</dt>
            <MapPin aria-hidden="true" className="mt-0.5 size-3.5 shrink-0 text-accent" />
            <dd>{event.venue?.name ?? 'Online'}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center justify-between gap-4 pt-5">
          <Link
            href={ctaHref}
            className={cn(buttonVariants({ variant: canRegister ? 'primary' : 'outline', size: 'sm' }), 'relative z-[3] min-h-10 px-4')}
          >
            {cta}
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
          {event.capacity && canRegister ? (
            <span className="meta-label text-fg-subtle">{event.capacity} seats</span>
          ) : (
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full border border-border text-fg-muted transition duration-300 group-hover:rotate-45 group-hover:border-ink group-hover:bg-ink group-hover:text-paper"
            >
              <ArrowUpRight className="size-4" />
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
