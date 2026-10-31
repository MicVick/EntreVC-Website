import Link from 'next/link'
import { ArrowRightIcon as ArrowRight } from '@/components/ui/icons'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'

type EmptyStateProps = {
  title: string
  description: string
  action?: { label: string; href: string }
  compact?: boolean
  className?: string
}

export function EmptyState({ title, description, action, compact = false, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'surface-card relative flex flex-col items-start overflow-hidden rounded-xl p-7 sm:p-9',
        !compact && 'min-h-64 justify-end',
        className,
      )}
    >
      {/* Concentric circles, a nod to Kahn's oculus. */}
      <span aria-hidden="true" className="absolute -right-16 -top-16 size-56 rounded-full border border-fg/10" />
      <span aria-hidden="true" className="spin-slow absolute -right-8 -top-8 size-40 rounded-full border border-dashed border-fg/15" />
      <span aria-hidden="true" className="absolute right-10 top-10 size-3 rounded-full bg-accent" />
      <h3 className="display-type relative text-2xl sm:text-[1.75rem]">{title}</h3>
      <p className="relative mt-2 max-w-lg text-sm leading-6 text-fg-muted sm:text-base sm:leading-7">{description}</p>
      {action ? (
        <Link href={action.href} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'relative mt-6')}>
          {action.label}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      ) : null}
    </div>
  )
}
