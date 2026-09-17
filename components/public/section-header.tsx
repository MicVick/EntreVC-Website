import type { ReactNode } from 'react'

import { cn } from '@/components/ui/cn'

type SectionHeaderProps = {
  eyebrow?: string
  title: string
  description?: string
  action?: ReactNode
  align?: 'start' | 'center'
  className?: string
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  action,
  align = 'start',
  className,
}: SectionHeaderProps) {
  return (
    <header
      className={cn(
        'mb-8 grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end sm:mb-9',
        align === 'center' && 'mx-auto max-w-3xl text-center md:block',
        className,
      )}
    >
      <div>
        {eyebrow ? <p className={cn('eyebrow', align === 'center' && 'justify-center')}>{eyebrow}</p> : null}
        <h2 className="display-type mt-4 max-w-4xl text-4xl font-semibold leading-[0.98] sm:text-5xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 max-w-2xl text-base leading-7 text-fg-muted sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className={cn(align === 'center' && 'mt-7')}>{action}</div> : null}
    </header>
  )
}
