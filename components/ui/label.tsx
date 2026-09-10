import type { ComponentProps } from 'react'

import { cn } from '@/components/ui/cn'

export function Label({ className, ...props }: ComponentProps<'label'>) {
  return (
    <label
      className={cn('text-sm font-semibold leading-6 text-fg peer-disabled:opacity-50', className)}
      {...props}
    />
  )
}
