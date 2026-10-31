'use client'

import { useEffect } from 'react'

/**
 * Feeds the pointer position to whichever `.spotlight` card is under it, as
 * `--spot-x` / `--spot-y`, so the card's soft light follows the cursor. One passive
 * listener for the whole page; renders nothing. Touch input is ignored.
 */
export function PointerGlow() {
  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return
      const card = event.target.closest<HTMLElement>('.spotlight')
      if (!card) return
      const box = card.getBoundingClientRect()
      card.style.setProperty('--spot-x', `${event.clientX - box.left}px`)
      card.style.setProperty('--spot-y', `${event.clientY - box.top}px`)
    }
    document.addEventListener('pointermove', onMove, { passive: true })
    return () => document.removeEventListener('pointermove', onMove)
  }, [])

  return null
}
