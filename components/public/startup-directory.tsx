'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { EmptyState } from '@/components/public/empty-state'
import { FilterChips } from '@/components/public/filter-chips'
import { StartupCard } from '@/components/public/startup-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  startupStageLabels,
  startupTypeLabels,
  startupTypes,
  type Startup,
  type StartupFacets,
  type StartupType,
} from '@/lib/schemas'

const PAGE_SIZE = 60

function isStartupType(value: string | null): value is StartupType {
  return value !== null && startupTypes.some((type) => type === value)
}

type StartupDirectoryProps = {
  startups: Startup[]
  facets: StartupFacets
}

export function StartupDirectory({ startups, facets }: StartupDirectoryProps) {
  const searchParams = useSearchParams()
  const requestedType = searchParams.get('type')
  const [ventureType, setVentureType] = useState<StartupType | 'all'>(
    isStartupType(requestedType) ? requestedType : 'all',
  )
  const [sectors, setSectors] = useState<string[]>(
    searchParams.getAll('sector').filter((value) => facets.sectors.includes(value)),
  )
  const [stages, setStages] = useState<string[]>(
    searchParams.getAll('stage').filter((value) => facets.stages.some((stage) => stage === value)),
  )
  const [batches, setBatches] = useState<string[]>(
    searchParams.getAll('batch').filter((value) => facets.batches.includes(value)),
  )
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const requestedPage = Number(searchParams.get('page') ?? '1')
  const [page, setPage] = useState(Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1)

  const writeParam = (name: string, values: readonly string[], resetPage = true) => {
    const url = new URL(window.location.href)
    url.searchParams.delete(name)
    values.forEach((value) => url.searchParams.append(name, value))
    if (resetPage) {
      url.searchParams.delete('page')
      setPage(1)
    }
    window.history.replaceState(window.history.state, '', url)
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('en-IN')

    return startups.filter((startup) => {
      if (ventureType !== 'all' && startup.type !== ventureType) return false
      if (sectors.length && !sectors.some((sector) => startup.sectors.includes(sector))) return false
      if (stages.length && (!startup.stage || !stages.includes(startup.stage))) return false
      if (batches.length && !batches.some((batch) => startup.batches.includes(batch))) return false

      if (!needle) return true
      const haystack = [
        startup.name,
        startup.tagline,
        startup.description.plainText,
        ...startup.founders.map((founder) => founder.name),
      ]
        .join(' ')
        .toLocaleLowerCase('en-IN')
      return haystack.includes(needle)
    })
  }, [batches, query, sectors, stages, startups, ventureType])

  const totalPages = startups.length > 500 ? Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)) : 1
  const safePage = Math.min(page, totalPages)
  const visible = totalPages > 1 ? filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE) : filtered
  const hasFilters = ventureType !== 'all' || sectors.length > 0 || stages.length > 0 || batches.length > 0 || query.length > 0

  const clearFilters = () => {
    setVentureType('all')
    setSectors([])
    setStages([])
    setBatches([])
    setQuery('')
    setPage(1)
    window.history.replaceState(window.history.state, '', window.location.pathname)
  }

  const changePage = (nextPage: number) => {
    setPage(nextPage)
    writeParam('page', nextPage === 1 ? [] : [String(nextPage)], false)
    document.getElementById('startup-results')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-7">
        <div className="flex flex-col gap-6 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">Venture type</p>
            <div className="inline-flex rounded-full border border-border bg-bg p-1">
              {(['all', ...startupTypes] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  aria-pressed={ventureType === type}
                  onClick={() => {
                    setVentureType(type)
                    writeParam('type', type === 'all' ? [] : [type])
                  }}
                  className="min-h-9 rounded-full px-4 text-sm font-semibold text-fg-muted transition hover:text-fg aria-pressed:bg-fg aria-pressed:text-bg"
                >
                  {type === 'all' ? 'All ventures' : startupTypeLabels[type]}
                </button>
              ))}
            </div>
          </div>
          <div className="w-full md:max-w-sm">
            <label htmlFor="startup-search" className="mb-3 block text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">
              Search
            </label>
            <div className="relative">
              <Search aria-hidden="true" className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
              <Input
                id="startup-search"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  writeParam('q', event.target.value.trim() ? [event.target.value] : [])
                }}
                placeholder="Name, founder or idea"
                className="pl-11"
              />
            </div>
          </div>
        </div>

        <details className="group mt-6" open>
          <summary className="flex min-h-11 list-none items-center gap-2 text-sm font-bold text-fg transition hover:text-accent">
            <SlidersHorizontal aria-hidden="true" className="size-4" /> Refine the directory
          </summary>
          <div className="mt-5 grid gap-7 md:grid-cols-3">
            <FilterChips
              label="Sector"
              options={facets.sectors.map((sector) => ({ value: sector, label: sector }))}
              selected={sectors}
              onChange={(next) => {
                setSectors(next)
                writeParam('sector', next)
              }}
            />
            <FilterChips
              label="Stage"
              options={facets.stages.map((stage) => ({ value: stage, label: startupStageLabels[stage] }))}
              selected={stages}
              onChange={(next) => {
                setStages(next)
                writeParam('stage', next)
              }}
            />
            <FilterChips
              label="Founder batch"
              options={facets.batches.map((batch) => ({ value: batch, label: batch }))}
              selected={batches}
              onChange={(next) => {
                setBatches(next)
                writeParam('batch', next)
              }}
            />
          </div>
        </details>
      </div>

      <div id="startup-results" className="scroll-mt-28 pt-8">
        <h2 className="sr-only">Startup results</h2>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p aria-live="polite" className="text-sm text-fg-muted">
            Showing <span className="font-bold text-fg">{filtered.length}</span> {filtered.length === 1 ? 'venture' : 'ventures'}
          </p>
          {hasFilters ? (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X aria-hidden="true" className="size-4" /> Clear filters
            </Button>
          ) : null}
        </div>

        {visible.length ? (
          <div className="reveal-grid grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {visible.map((startup) => <StartupCard key={startup.id} startup={startup} />)}
          </div>
        ) : (
          <EmptyState
            title="No venture matches that combination."
            description="Try removing one filter or searching for a broader term. The directory only shows verified, approved listings."
          />
        )}

        {totalPages > 1 ? (
          <nav aria-label="Directory pages" className="mt-10 flex items-center justify-between border-t border-border pt-6">
            <Button variant="ghost" size="sm" disabled={safePage <= 1} onClick={() => changePage(safePage - 1)}>Previous</Button>
            <p className="text-sm text-fg-muted">Page {safePage} of {totalPages}</p>
            <Button variant="ghost" size="sm" disabled={safePage >= totalPages} onClick={() => changePage(safePage + 1)}>Next</Button>
          </nav>
        ) : null}
      </div>
    </div>
  )
}
