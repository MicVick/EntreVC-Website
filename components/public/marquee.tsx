import { Fragment } from 'react'

import { cn } from '@/components/ui/cn'

type MarqueeProps = {
  words: readonly string[]
  /** `lg` between sections, `md` as a lead-in inside one. */
  size?: 'md' | 'lg'
  className?: string
}

function Sparkle() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className="size-[0.45em] shrink-0 text-accent">
      <path fill="currentColor" d="M12 0c.6 6.4 5.6 11.4 12 12-6.4.6-11.4 5.6-12 12-.6-6.4-5.6-11.4-12-12C6.4 11.4 11.4 6.4 12 0Z" />
    </svg>
  )
}

function Track({ words, hidden = false }: { words: readonly string[]; hidden?: boolean }) {
  return (
    <div className="marquee-track" aria-hidden={hidden || undefined}>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span className={cn('whitespace-nowrap', index % 2 === 1 ? 'accent-serif text-fg-subtle' : 'text-fg/90')}>{word}</span>
          <Sparkle />
        </Fragment>
      ))}
    </div>
  )
}

/**
 * A slow, endless strip of words between sections. Decorative: the list is read once
 * by screen readers and the duplicate track is hidden. Static when motion is off.
 */
export function Marquee({ words, size = 'lg', className }: MarqueeProps) {
  return (
    <div
      className={cn(
        'marquee display-type py-2 leading-none',
        size === 'lg' ? 'text-[clamp(1.9rem,4.4vw,3.5rem)]' : 'text-[clamp(1.5rem,3.2vw,2.5rem)]',
        className,
      )}
    >
      <Track words={words} />
      <Track words={words} hidden />
    </div>
  )
}
