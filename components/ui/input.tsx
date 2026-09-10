import type { ComponentProps } from 'react'

import { cn } from '@/components/ui/cn'

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'min-h-12 w-full rounded-md border border-border bg-surface px-4 text-base text-fg shadow-sm transition placeholder:text-fg-subtle hover:border-border-strong focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
