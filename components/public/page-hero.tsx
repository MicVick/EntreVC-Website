import type { CSSProperties, ReactNode } from 'react'

import { cn } from '@/components/ui/cn'

type PageHeroProps = {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  aside?: ReactNode
  className?: string
}

const delayed: CSSProperties & Record<'--delay', string> = { '--delay': '140ms' }

/**
 * The opening block of every inner page: a plain title and one or two sentences, with
 * Kahn's circle drawn faintly behind (and slowly turning, when motion is on).
 */
export function PageHero({ eyebrow, title, description, aside, className }: PageHeroProps) {
  return (
    <section className={cn('relative isolate overflow-hidden', className)}>
      <div aria-hidden="true" className="glow-orb -right-40 -top-40 size-[34rem]" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 hidden size-[30rem] -translate-y-1/2 md:block lg:right-[4%]">
        <span className="absolute inset-0 rounded-full border border-fg/[0.07]" />
        <span className="spin-slow absolute inset-[9%] rounded-full border border-dashed border-fg/[0.12]" />
        <span className="absolute inset-[22%] rounded-full border border-fg/[0.07]" />
        <span className="absolute inset-[40%] rounded-full bg-brand/80" />
      </div>
      <div
        className={cn(
          'site-shell relative pb-14 pt-16 sm:pb-20 sm:pt-24',
          aside && 'grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)] lg:items-end',
        )}
      >
        <div className="animate-enter">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-xl mt-6 max-w-5xl text-[clamp(3.2rem,9vw,7.5rem)]">{title}</h1>
          {description ? (
            <div className="mt-7 max-w-2xl text-base leading-7 text-fg-muted sm:text-lg sm:leading-8">{description}</div>
          ) : null}
        </div>
        {aside ? (
          <div className="animate-enter" style={delayed}>
            {aside}
          </div>
        ) : null}
      </div>
    </section>
  )
}
