'use client'

import { cn } from '@/components/ui/cn'

export type FilterChipOption = {
  value: string
  label: string
  count?: number
}

type FilterChipsProps = {
  label: string
  options: readonly FilterChipOption[]
  selected: readonly string[]
  onChange: (selected: string[]) => void
  multiple?: boolean
  className?: string
}

export function FilterChips({
  label,
  options,
  selected,
  onChange,
  multiple = true,
  className,
}: FilterChipsProps) {
  const toggle = (value: string) => {
    const active = selected.includes(value)
    if (!multiple) {
      onChange(active ? [] : [value])
      return
    }

    onChange(active ? selected.filter((item) => item !== value) : [...selected, value])
  }

  return (
    <fieldset className={cn('min-w-0', className)}>
      <legend className="mb-3 text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(option.value)}
              className="min-h-10 rounded-full border border-border bg-surface px-4 text-sm font-semibold text-fg-muted transition hover:border-border-strong hover:text-fg aria-pressed:border-brand aria-pressed:bg-brand-muted aria-pressed:text-accent"
            >
              {option.label}
              {option.count === undefined ? null : <span className="ml-2 text-fg-subtle">{option.count}</span>}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
