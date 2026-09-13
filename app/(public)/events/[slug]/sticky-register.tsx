'use client'

import { useEffect, useState } from 'react'

/**
 * The mobile register bar.
 *
 * This page is normally reached from a WhatsApp link on a phone, and the registration
 * panel sits below the description, the speakers and the agenda — all of which are worth
 * reading and all of which push the one action that matters off the screen. The bar
 * keeps it one thumb-reach away the whole way down.
 *
 * It is a plain anchor to `#register`, so it works before hydration and by keyboard
 * without any of this component's JavaScript. The script only hides the bar once the
 * real panel is on screen, which is presentation, not function.
 */

type StickyRegisterProps = {
  label: string
  targetId: string
}

export function StickyRegister({ label, targetId }: StickyRegisterProps) {
  const [panelVisible, setPanelVisible] = useState(false)

  useEffect(() => {
    const target = document.getElementById(targetId)
    if (!target) return

    const observer = new IntersectionObserver(
      ([entry]) => setPanelVisible(Boolean(entry?.isIntersecting)),
      { rootMargin: '-25% 0px -25% 0px' },
    )
    observer.observe(target)
    return () => observer.disconnect()
  }, [targetId])

  return (
    <div
      // `hidden` rather than unmounting, so the anchor stays in the DOM and the bar can
      // come back without a layout jump.
      hidden={panelVisible}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 p-3 shadow-lg backdrop-blur lg:hidden"
    >
      <a
        href={`#${targetId}`}
        className="flex min-h-12 w-full items-center justify-center rounded-full border border-brand bg-brand px-5 text-sm font-bold text-brand-fg transition hover:border-accent hover:bg-accent hover:text-accent-fg"
      >
        {label}
      </a>
    </div>
  )
}
