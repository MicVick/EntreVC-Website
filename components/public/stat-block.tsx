import type { CSSProperties } from 'react'

import { cn } from '@/components/ui/cn'

type StatBlockProps = {
  value: number | string
  label: string
  suffix?: string
  className?: string
}

type CountStyle = CSSProperties & Record<'--to', number>

/**
 * A key number. Whole numbers count up as they scroll into view (CSS only, see
 * `.count-up`); screen readers get the plain value.
 */
export function StatBlock({ value, label, suffix, className }: StatBlockProps) {
  const countable = typeof value === 'number' && Number.isInteger(value) && value >= 0
  const style: CountStyle | undefined = countable ? { '--to': value } : undefined

  return (
    <div className={cn('relative', className)}>
      <p className="display-xl text-[clamp(3rem,6vw,4.75rem)] tabular-nums">
        <span className="sr-only">
          {value}
          {suffix}
        </span>
        {countable ? <span aria-hidden="true" className="count-up" style={style} /> : <span aria-hidden="true">{value}</span>}
        {suffix ? (
          <span aria-hidden="true" className="accent-serif text-accent">
            {suffix}
          </span>
        ) : null}
      </p>
      <p className="meta-label mt-3 max-w-44 leading-5 text-fg-muted">{label}</p>
    </div>
  )
}
