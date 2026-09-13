'use client'

import { useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { EmptyState } from '@/components/public/empty-state'
import { EventCard } from '@/components/public/event-card'
import { FilterChips } from '@/components/public/filter-chips'
import { Button } from '@/components/ui/button'
import type { Event } from '@/lib/schemas'

/**
 * Browsing controls for the events index.
 *
 * Every control writes itself into the URL, because the single most common way this
 * page is shared is someone pasting a link into a WhatsApp group. A filtered view that
 * cannot be linked to is a filtered view nobody else ever sees.
 *
 * The segmented control is plain buttons with `aria-pressed` rather than the `Tabs`
 * primitive: `TabsTrigger` puts `tabIndex={-1}` on the unselected tab without arrow-key
 * handling, so the inactive panel cannot be reached by keyboard at all. Logged for
 * Agent B as A-011.
 */

type When = 'upcoming' | 'past'

const WHEN_VALUES: readonly When[] = ['upcoming', 'past']

function isWhen(value: string | null): value is When {
  return value !== null && WHEN_VALUES.some((item) => item === value)
}

type EventsBrowserProps = {
  upcoming: Event[]
  past: Event[]
  eventTypes: string[]
}

export function EventsBrowser({ upcoming, past, eventTypes }: EventsBrowserProps) {
  const searchParams = useSearchParams()
  const requestedWhen = searchParams.get('when')

  // An empty upcoming list should land the visitor somewhere useful rather than on a
  // blank tab, so past events become the default when there is nothing coming up.
  const [when, setWhen] = useState<When>(
    isWhen(requestedWhen) ? requestedWhen : upcoming.length === 0 && past.length > 0 ? 'past' : 'upcoming',
  )
  const [types, setTypes] = useState<string[]>(
    searchParams.getAll('type').filter((value) => eventTypes.includes(value)),
  )

  const writeParam = (name: string, values: readonly string[]) => {
    const url = new URL(window.location.href)
    url.searchParams.delete(name)
    values.forEach((value) => url.searchParams.append(name, value))
    window.history.replaceState(window.history.state, '', url)
  }

  const source = when === 'upcoming' ? upcoming : past

  const filtered = useMemo(() => {
    if (types.length === 0) return source
    return source.filter((event) => event.eventType !== null && types.includes(event.eventType))
  }, [source, types])

  const clearFilters = () => {
    setTypes([])
    writeParam('type', [])
  }

  // The lead card only earns the extra width when the list is unfiltered — a filtered
  // result of one should not render as a hero.
  const featureFirst = when === 'upcoming' && types.length === 0 && filtered.length > 2
  const [lead, ...rest] = filtered

  return (
    <div>
      <div className="flex flex-col gap-6 border-b border-border pb-7 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">Showing</p>
          <div className="inline-flex rounded-full border border-border bg-surface p-1">
            {WHEN_VALUES.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={when === value}
                onClick={() => {
                  setWhen(value)
                  writeParam('when', value === 'upcoming' ? [] : [value])
                }}
                className="min-h-9 rounded-full px-4 text-sm font-semibold text-fg-muted transition hover:text-fg aria-pressed:bg-fg aria-pressed:text-bg"
              >
                {value === 'upcoming' ? 'Upcoming' : 'Past'}
                <span className="ml-2 text-xs font-bold opacity-70">
                  {value === 'upcoming' ? upcoming.length : past.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        {eventTypes.length > 1 ? (
          <FilterChips
            label="Type"
            options={eventTypes.map((type) => ({ value: type, label: type }))}
            selected={types}
            onChange={(next) => {
              setTypes(next)
              writeParam('type', next)
            }}
            className="md:max-w-2xl"
          />
        ) : null}
      </div>

      <div className="pt-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p aria-live="polite" className="text-sm text-fg-muted">
            Showing <span className="font-bold text-fg">{filtered.length}</span>{' '}
            {when === 'upcoming' ? 'upcoming' : 'past'} {filtered.length === 1 ? 'event' : 'events'}
          </p>
          {types.length > 0 ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X aria-hidden="true" className="size-4" /> Clear filters
            </Button>
          ) : null}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            title={
              types.length > 0
                ? 'Nothing matches that filter.'
                : when === 'upcoming'
                  ? 'Nothing on the calendar just yet.'
                  : 'No past events to show.'
            }
            description={
              types.length > 0
                ? 'Try clearing the type filter, or look at what has already happened.'
                : when === 'upcoming'
                  ? 'The next term’s line-up is being put together. Join the mailing list and you will hear about it first.'
                  : 'Once an event has finished it appears here with photos and a recording.'
            }
            action={
              when === 'upcoming' && types.length === 0
                ? { label: 'Browse past events', href: '/events?when=past' }
                : undefined
            }
          />
        ) : featureFirst && lead ? (
          <div className="grid gap-5">
            <EventCard event={lead} featured />
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {rest.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
