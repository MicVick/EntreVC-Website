import type { ComponentProps } from 'react'

import { cn } from '@/components/ui/cn'

export function Textarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-32 w-full resize-y rounded-md border border-border bg-surface px-4 py-3 text-base text-fg shadow-sm transition placeholder:text-fg-subtle hover:border-border-strong focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}
