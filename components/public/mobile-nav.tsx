'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { ArrowUpRightIcon, MenuIcon } from '@/components/ui/icons'
import { Sheet } from '@/components/ui/sheet'

export type NavigationItem = {
  href: string
  label: string
}

type MobileNavProps = {
  items: readonly NavigationItem[]
}

export function MobileNav({ items }: MobileNavProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="lg:hidden"
      >
        <MenuIcon aria-hidden="true" className="size-5" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen} title="Menu">
        <nav aria-label="Mobile navigation" className="flex flex-col">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              aria-current={(item.href === '/' ? pathname === '/' : pathname === item.href || pathname.startsWith(`${item.href}/`)) ? 'page' : undefined}
              onClick={() => setOpen(false)}
              className="group flex min-h-14 items-center justify-between gap-4 border-b border-border py-3 text-lg font-medium text-fg transition hover:text-accent aria-[current=page]:text-accent"
            >
              <span>{item.label}</span>
              <ArrowUpRightIcon aria-hidden="true" className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          prefetch={false}
          aria-current={pathname === '/contact' || pathname.startsWith('/contact/') ? 'page' : undefined}
          onClick={() => setOpen(false)}
          className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-brand px-5 text-sm font-semibold text-brand-fg transition hover:bg-brand-strong aria-[current=page]:ring-2 aria-[current=page]:ring-accent aria-[current=page]:ring-offset-2 aria-[current=page]:ring-offset-bg"
        >
          Contact us
        </Link>
      </Sheet>
    </>
  )
}
