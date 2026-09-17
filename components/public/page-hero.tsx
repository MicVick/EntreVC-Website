import type { ReactNode } from 'react'

import { cn } from '@/components/ui/cn'

type PageHeroProps = {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  aside?: ReactNode
  className?: string
}

export function PageHero({ eyebrow, title, description, aside, className }: PageHeroProps) {
  return (
    <section className={cn('surface-grid overflow-hidden border-b border-border', className)}>
      <div
        className={cn(
          'site-shell py-10 sm:py-14 lg:py-16',
          aside && 'grid gap-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(18rem,0.82fr)] lg:items-end',
        )}
      >
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="display-type mt-5 max-w-5xl text-[clamp(2.6rem,5.8vw,5.8rem)] font-semibold leading-[0.91]">
            {title}
          </h1>
          {description ? (
            <div className="mt-6 max-w-2xl text-base leading-7 text-fg-muted sm:text-lg sm:leading-8">
              {description}
            </div>
          ) : null}
        </div>
        {aside ? <div className="reveal-on-scroll">{aside}</div> : null}
      </div>
    </section>
  )
}
