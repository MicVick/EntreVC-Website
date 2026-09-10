import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'

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
    <div className={cn('surface-grid flex flex-col items-start rounded-lg border border-dashed border-border-strong bg-surface p-6 sm:p-9', !compact && 'min-h-72 justify-end', className)}>
      <Sparkles aria-hidden="true" className="size-6 text-brand" />
      <h3 className="display-type mt-6 text-2xl font-semibold">{title}</h3>
      <p className="mt-3 max-w-lg text-sm leading-6 text-fg-muted sm:text-base">{description}</p>
      {action ? (
        <Link href={action.href} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-6')}>
          {action.label}
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      ) : null}
    </div>
  )
}
