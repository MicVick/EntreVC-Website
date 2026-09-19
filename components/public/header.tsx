import { BrandLogo } from '@/components/public/brand-logo'
import { MobileNav, type NavigationItem } from '@/components/public/mobile-nav'
import { NavigationLink } from '@/components/public/navigation-link'

export const navigationItems: readonly NavigationItem[] = [
  { href: '/', label: 'Home' },
  { href: '/events', label: 'Events' },
  { href: '/startups', label: 'Startups' },
  { href: '/resources', label: 'Resources' },
  { href: '/iima-ventures', label: 'Support' },
  { href: '/team', label: 'Team' },
] as const

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/92 shadow-sm backdrop-blur-xl">
      <div className="site-shell flex min-h-[var(--header-height)] items-center justify-between gap-5">
        <BrandLogo compact />
        <nav aria-label="Primary navigation" className="hidden items-center gap-1 lg:flex">
          {navigationItems.map((item) => (
            <NavigationLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="hidden lg:block">
          <NavigationLink href="/contact" label="Contact" variant="action" />
        </div>
        <MobileNav items={navigationItems} />
      </div>
    </header>
  )
}
