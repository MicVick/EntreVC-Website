import type { CSSProperties } from 'react'

import { cn } from '@/components/ui/cn'
import { splitFigure } from '@/lib/schemas'

type StatBlockProps = {
  /** A number, or a figure as the club writes it ("15+", "$24 Bn+", "1,300+"). */
  value: number | string
  label: string
  suffix?: string
  /** `lg` for a headline row, `md` inside cards, `sm` for three across on a phone (never wraps). */
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

type CountStyle = CSSProperties & Record<'--to', number>

/**
 * A key number. Whole numbers count up as they scroll into view (CSS only, see
 * `.count-up`); screen readers get the plain value. A written figure is split into
 * the number and the text around it, so "15+" counts to 15 and keeps its "+"; figures
 * with separators or decimals ("1,300+") show exactly as written.
 */
export function StatBlock({ value, label, suffix = '', size = 'lg', className }: StatBlockProps) {
  const written = typeof value === 'string' ? value : String(value)
  const parts =
    typeof value === 'string'
      ? splitFigure(value)
      : { prefix: '', value: Number.isInteger(value) && value >= 0 ? value : null, suffix: '' }
  const after = `${parts.suffix}${suffix}`
  const style: CountStyle | undefined = parts.value === null ? undefined : { '--to': parts.value }

  return (
    <div className={cn('relative min-w-0', className)}>
      <p
        className={cn(
          'display-xl tabular-nums',
          size === 'lg' && 'text-[clamp(2.5rem,4.6vw,3.6rem)]',
          size === 'md' && 'text-[clamp(2rem,3.4vw,2.6rem)]',
          size === 'sm' && 'whitespace-nowrap text-[clamp(1.5rem,3.4vw,2.6rem)]',
        )}
      >
        <span className="sr-only">
          {written}
          {suffix}
        </span>
        {style ? (
          <>
            {parts.prefix ? <span aria-hidden="true">{parts.prefix}</span> : null}
            <span aria-hidden="true" className="count-up" style={style} />
            {after ? (
              <span aria-hidden="true" className="accent-serif text-accent">
                {after}
              </span>
            ) : null}
          </>
        ) : (
          <span aria-hidden="true">
            {written}
            {suffix}
          </span>
        )}
      </p>
      <p className="meta-label mt-3 max-w-48 leading-5 text-fg-muted">{label}</p>
    </div>
  )
}
