import type { ComponentProps } from 'react'

import { cn } from '@/components/ui/cn'

export function Checkbox({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      type="checkbox"
      className={cn(
        'size-5 shrink-0 rounded-sm border border-border-strong bg-surface accent-brand focus-visible:outline-2 focus-visible:outline-offset-3 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
