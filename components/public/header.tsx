import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

import { BrandLogo } from '@/components/public/brand-logo'
import { MobileNav, type NavigationItem } from '@/components/public/mobile-nav'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'

export const navigationItems: readonly NavigationItem[] = [
  { href: '/events', label: 'Events' },
  { href: '/startups', label: 'Startups' },
  { href: '/resources', label: 'Resources' },
  { href: '/iima-ventures', label: 'IIMA Ventures' },
  { href: '/team', label: 'Team' },
] as const

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/88 backdrop-blur-xl">
      <div className="site-shell flex min-h-[var(--header-height)] items-center justify-between gap-5">
        <BrandLogo compact />
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              className="rounded-full px-3 py-2 text-sm font-semibold text-fg-muted transition hover:bg-surface hover:text-fg xl:px-4"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden lg:block">
          <Link href="/contact" className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
            Contact
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
        <MobileNav items={navigationItems} />
      </div>
    </header>
  )
}
