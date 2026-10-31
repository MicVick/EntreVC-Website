'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/components/ui/cn'

type NavigationLinkProps = {
  href: string
  label: string
  variant?: 'nav' | 'action'
}

export function NavigationLink({ href, label, variant = 'nav' }: NavigationLinkProps) {
  const pathname = usePathname()
  const isCurrent = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link
      href={href}
      prefetch={false}
      aria-current={isCurrent ? 'page' : undefined}
      className={cn(
        variant === 'nav' &&
          'relative rounded-full px-3.5 py-2 text-sm font-medium text-fg-muted transition hover:bg-fg/[0.06] hover:text-fg aria-[current=page]:bg-fg/[0.09] aria-[current=page]:text-fg xl:px-4',
        variant === 'action' &&
          'inline-flex min-h-11 items-center justify-center rounded-full border border-brand bg-brand px-5 text-sm font-semibold text-brand-fg shadow-glow transition hover:border-brand-strong hover:bg-brand-strong aria-[current=page]:outline aria-[current=page]:outline-1 aria-[current=page]:outline-offset-2 aria-[current=page]:outline-accent',
      )}
    >
      {label}
    </Link>
  )
}
