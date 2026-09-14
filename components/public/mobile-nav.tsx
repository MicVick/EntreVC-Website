'use client'

import { useState } from 'react'
import Link from 'next/link'

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

  return (
    <>
      <Button
        variant="secondary"
        size="icon"
        aria-label="Open navigation"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="lg:hidden"
      >
        <MenuIcon aria-hidden="true" className="size-5" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen} title="Navigate" description="Explore the EntreVC ecosystem.">
        <nav aria-label="Mobile navigation" className="flex flex-col">
          {items.map((item, index) => (
            <Link
              key={item.href}
              href={item.href}
              prefetch={false}
              onClick={() => setOpen(false)}
              className="group flex min-h-16 items-center justify-between gap-4 border-b border-border py-4 text-lg font-semibold text-fg transition hover:text-accent"
            >
              <span className="flex items-center gap-4">
                <span className="text-xs tabular-nums text-fg-subtle">0{index + 1}</span>
                {item.label}
              </span>
              <ArrowUpRightIcon aria-hidden="true" className="size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          ))}
        </nav>
        <Link
          href="/contact"
          prefetch={false}
          onClick={() => setOpen(false)}
          className="mt-10 inline-flex min-h-12 items-center justify-center rounded-full bg-brand px-5 text-sm font-bold text-brand-fg"
        >
          Start a conversation
        </Link>
      </Sheet>
    </>
  )
}
