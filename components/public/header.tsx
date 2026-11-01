import { BrandLogo } from '@/components/public/brand-logo'
import { MobileNav, type NavigationItem } from '@/components/public/mobile-nav'
import { NavigationLink } from '@/components/public/navigation-link'

export const navigationItems: readonly NavigationItem[] = [
  { href: '/about', label: 'About' },
  { href: '/events', label: 'Events' },
  { href: '/startups', label: 'Startups' },
  { href: '/resources', label: 'Resources' },
  { href: '/iima-ventures', label: 'Support' },
  { href: '/team', label: 'Team' },
] as const

export function Header() {
  return (
    // A floating glass capsule: content scrolls underneath and shows through, blurred.
    <header className="sticky top-0 z-40 px-3 pt-3 sm:px-4">
      <div className="glass-bar mx-auto flex min-h-[3.75rem] w-full max-w-[86rem] items-center justify-between gap-5 rounded-full py-2 pl-5 pr-2 sm:pl-6">
        <BrandLogo size="header" />
        <nav aria-label="Primary navigation" className="hidden items-center gap-0.5 lg:flex">
          {navigationItems.map((item) => (
            <NavigationLink key={item.href} {...item} />
          ))}
        </nav>
        <div className="hidden lg:block">
          <NavigationLink href="/contact" label="Contact us" variant="action" />
        </div>
        <MobileNav items={navigationItems} />
      </div>
    </header>
  )
}
