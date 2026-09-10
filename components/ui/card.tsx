import type { ComponentProps } from 'react'

import { cn } from '@/components/ui/cn'

export function Card({ className, ...props }: ComponentProps<'article'>) {
  return (
    <article
      className={cn('rounded-lg border border-border bg-surface shadow-sm', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: ComponentProps<'header'>) {
  return <header className={cn('p-5 sm:p-6', className)} {...props} />
}

export function CardContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('px-5 pb-5 sm:px-6 sm:pb-6', className)} {...props} />
}

export function CardFooter({ className, ...props }: ComponentProps<'footer'>) {
  return <footer className={cn('border-t border-border p-5 sm:p-6', className)} {...props} />
}
