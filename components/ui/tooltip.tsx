import type { ComponentProps, ReactNode } from 'react'

import { cn } from '@/components/ui/cn'

type TooltipProps = ComponentProps<'span'> & {
  content: ReactNode
}

export function Tooltip({ children, content, className, ...props }: TooltipProps) {
  return (
    <span className={cn('group/tooltip relative inline-flex', className)} {...props}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-[calc(100%+0.55rem)] left-1/2 z-50 w-max max-w-56 -translate-x-1/2 rounded-sm border border-border bg-surface-2 px-3 py-2 text-xs leading-5 text-fg opacity-0 shadow-md transition group-focus-within/tooltip:opacity-100 group-hover/tooltip:opacity-100"
      >
        {content}
      </span>
    </span>
  )
}
