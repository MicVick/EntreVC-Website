'use client'

import { useMemo, useState } from 'react'
import { Search, X } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

import { EmptyState } from '@/components/public/empty-state'
import { FilterChips } from '@/components/public/filter-chips'
import { ResourceCard } from '@/components/public/resource-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { resourceTypeLabels, resourceTypes, type Resource } from '@/lib/schemas'

type ResourceDirectoryProps = {
  resources: Resource[]
  tags: string[]
}

export function ResourceDirectory({ resources, tags }: ResourceDirectoryProps) {
  const searchParams = useSearchParams()
  const [types, setTypes] = useState<string[]>(
    searchParams.getAll('type').filter((value) => resourceTypes.some((type) => type === value)),
  )
  const [selectedTags, setSelectedTags] = useState<string[]>(
    searchParams.getAll('tag').filter((value) => tags.includes(value)),
  )
  const [query, setQuery] = useState(searchParams.get('q') ?? '')

  const writeParam = (name: string, values: readonly string[]) => {
    const url = new URL(window.location.href)
    url.searchParams.delete(name)
    values.forEach((value) => url.searchParams.append(name, value))
    window.history.replaceState(window.history.state, '', url)
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase('en-IN')

    return resources.filter((resource) => {
      if (types.length && !types.includes(resource.type)) return false
      if (selectedTags.length && !selectedTags.every((tag) => resource.tags.includes(tag))) return false
      if (!needle) return true

      const haystack = [resource.title, resource.description ?? '', resource.author ?? '', ...resource.tags]
        .join(' ')
        .toLocaleLowerCase('en-IN')
      return haystack.includes(needle)
    })
  }, [query, resources, selectedTags, types])

  const hasFilters = types.length > 0 || selectedTags.length > 0 || query.length > 0

  const clear = () => {
    setTypes([])
    setSelectedTags([])
    setQuery('')
    window.history.replaceState(window.history.state, '', window.location.pathname)
  }

  return (
    <div>
      <div className="rounded-lg border border-border bg-surface p-5 shadow-sm sm:p-7">
        <div className="grid gap-7 lg:grid-cols-[1fr_1fr_20rem]">
          <FilterChips
            label="Format"
            options={resourceTypes.map((type) => ({ value: type, label: resourceTypeLabels[type] }))}
            selected={types}
            onChange={(next) => {
              setTypes(next)
              writeParam('type', next)
            }}
          />
          <FilterChips
            label="Topic"
            options={tags.map((tag) => ({ value: tag, label: tag }))}
            selected={selectedTags}
            onChange={(next) => {
              setSelectedTags(next)
              writeParam('tag', next)
            }}
          />
          <div>
            <label htmlFor="resource-search" className="mb-3 block text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">Search</label>
            <div className="relative">
              <Search aria-hidden="true" className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
              <Input
                id="resource-search"
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  writeParam('q', event.target.value.trim() ? [event.target.value] : [])
                }}
                placeholder="Title, author or tag"
                className="pl-11"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <p aria-live="polite" className="text-sm text-fg-muted">
          <span className="font-bold text-fg">{filtered.length}</span> {filtered.length === 1 ? 'resource' : 'resources'}
        </p>
        {hasFilters ? (
          <Button variant="ghost" size="sm" onClick={clear}><X aria-hidden="true" className="size-4" /> Clear filters</Button>
        ) : null}
      </div>

      {filtered.length ? (
        <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((resource) => <ResourceCard key={resource.id} resource={resource} />)}
        </div>
      ) : (
        <EmptyState
          className="mt-6"
          title="Nothing matches those filters."
          description="Try a broader search or remove one topic. Every listed resource opens directly—there are no email gates."
        />
      )}
    </div>
  )
}
