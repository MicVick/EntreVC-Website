'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/components/ui/cn'
import { ArrowUpRightIcon } from '@/components/ui/icons'

type NavigationLinkProps = {
  href: string
  label: string
  variant?: 'nav' | 'action'
}

export function NavigationLink({ href, label, variant = 'nav' }: NavigationLinkProps) {
  const pathname = usePathname()
  const isCurrent = pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={isCurrent ? 'page' : undefined}
      className={cn(
        variant === 'nav' && [
          'relative rounded-full px-3 py-2 text-sm font-semibold text-fg-muted transition hover:bg-surface hover:text-fg xl:px-4',
          'after:absolute after:inset-x-4 after:-bottom-px after:h-0.5 after:scale-x-0 after:rounded-full after:bg-brand after:transition-transform',
          'aria-[current=page]:bg-surface aria-[current=page]:text-fg aria-[current=page]:after:scale-x-100',
        ],
        variant === 'action' && 'inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border-strong bg-transparent px-4 text-sm font-bold text-fg transition hover:border-brand hover:bg-brand hover:text-brand-fg aria-[current=page]:border-brand aria-[current=page]:bg-brand-muted aria-[current=page]:text-accent',
      )}
    >
      {label}
      {variant === 'action' ? <ArrowUpRightIcon aria-hidden="true" className="size-4" /> : null}
    </Link>
  )
}
