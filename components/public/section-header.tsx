import type { ReactNode } from 'react'

import { cn } from '@/components/ui/cn'

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  /** Optional last word(s) of the title, set in the serif italic. Reads as one heading. */
  accent?: string
  description?: string
  action?: ReactNode
  align?: 'start' | 'center'
  /** id for the heading, so the section can point aria-labelledby at it. */
  id?: string
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  accent,
  description,
  action,
  align = 'start',
  id,
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        'mb-10 grid gap-6 sm:mb-14 md:grid-cols-[minmax(0,1fr)_auto] md:items-end',
        align === 'center' && 'mx-auto max-w-3xl text-center md:block',
        className,
      )}
    >
      <div>
        {eyebrow ? <p className={cn('eyebrow', align === 'center' && 'justify-center')}>{eyebrow}</p> : null}
        <h2 id={id} className={cn('display-type max-w-4xl text-[clamp(2.3rem,5vw,4rem)]', eyebrow && 'mt-4')}>
          {title}
          {accent ? (
            <>
              {' '}
              <span className="accent-serif text-accent">{accent}</span>
            </>
          ) : null}
        </h2>
        {description ? (
          <p className={cn('mt-4 max-w-2xl text-base leading-7 text-fg-muted sm:text-lg sm:leading-8', align === 'center' && 'mx-auto')}>
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className={cn('shrink-0', align === 'center' && 'mt-6')}>{action}</div> : null}
    </header>
  )
}
