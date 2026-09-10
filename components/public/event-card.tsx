import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, CalendarDays, MapPin } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/components/ui/cn'
import { eventFormatLabels, type Event } from '@/lib/schemas'
import { formatDateRangeInIST } from '@/lib/format'

export type EventCardProps = {
  event: Event
  featured?: boolean
  registrationLabel?: string
  className?: string
}

export function EventCard({
  event,
  featured = false,
  registrationLabel,
  className,
}: EventCardProps) {
  const href = `/events/${event.slug}`
  const cta = registrationLabel ?? (event.isPast ? 'View recap' : event.isRegistrationClosed ? 'View event' : 'Register')

  return (
    <article
      className={cn(
        'group relative grid min-w-0 overflow-hidden rounded-lg border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-md',
        featured && 'md:grid-cols-[1.08fr_0.92fr]',
        className,
      )}
    >
      <div className={cn('relative overflow-hidden bg-surface-2', featured ? 'min-h-64 md:min-h-full' : 'aspect-[16/10]')}>
        {event.heroImage ? (
          <Image
            src={event.heroImage.url}
            alt={event.heroImage.alt}
            width={event.heroImage.width}
            height={event.heroImage.height}
            sizes={featured ? '(min-width: 768px) 52vw, 100vw' : '(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw'}
            className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.035] group-hover:opacity-100"
          />
        ) : (
          <div className="surface-grid flex h-full min-h-56 items-end p-6" aria-hidden="true">
            <span className="display-type text-7xl font-semibold text-border-strong">E/{event.startDateTime.slice(5, 7)}</span>
          </div>
        )}
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <Badge variant="brand">{event.eventType ?? 'EntreVC'}</Badge>
          <Badge>{eventFormatLabels[event.format]}</Badge>
        </div>
      </div>

      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <div className="space-y-3 text-sm leading-6 text-fg-muted">
          <p className="flex items-start gap-2">
            <CalendarDays aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" />
            <span>{formatDateRangeInIST(event.startDateTime, event.endDateTime)}</span>
          </p>
          <p className="flex items-start gap-2">
            <MapPin aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" />
            <span>{event.venue?.name ?? 'Online'}</span>
          </p>
        </div>

        <h3 className={cn('display-type mt-6 break-words font-semibold leading-[1.04]', featured ? 'text-3xl sm:text-4xl' : 'text-2xl')}>
          <Link href={href} className="after:absolute after:inset-0">
            {event.title}
          </Link>
        </h3>
        {event.subtitle ? (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-fg-muted sm:text-base">
            {event.subtitle}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-4 pt-8">
          <span className="text-sm font-bold text-fg transition group-hover:text-accent">{cta}</span>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 transition group-hover:border-brand group-hover:bg-brand group-hover:text-brand-fg">
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </span>
        </div>
      </div>
    </article>
  )
}
