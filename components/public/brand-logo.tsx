import Link from 'next/link'

import { WORDMARK_FRAME } from '@/components/public/entrevc-sprite'
import { cn } from '@/components/ui/cn'

type BrandLogoProps = {
  className?: string
  size?: 'header' | 'footer' | 'feature' | 'orbit'
  /** Render as plain markup instead of a home link (e.g. inside an existing link). */
  asLink?: boolean
}

const WORDMARK_WIDTH: Record<NonNullable<BrandLogoProps['size']>, string> = {
  header: 'w-[7.25rem] sm:w-[8.25rem]',
  footer: 'w-[11rem]',
  orbit: 'w-[clamp(11rem,26vw,15rem)]',
  feature: 'w-[clamp(14rem,40vw,26rem)]',
}

/**
 * The EntreVC wordmark (traced from the club's logo artwork, see `entrevc-sprite.tsx`)
 * with "IIM Ahmedabad" set alongside in the mono face. Lettering follows the text
 * colour, so it works on the dark page and on paper.
 */
export function BrandLogo({ className, size = 'header', asLink = true }: BrandLogoProps) {
  const mark = (
    <span
      className={cn(
        'inline-flex leading-none',
        size === 'header' ? 'items-center gap-3' : 'flex-col gap-3',
        size === 'orbit' && 'items-center',
      )}
    >
      <svg
        viewBox={WORDMARK_FRAME}
        aria-hidden="true"
        focusable="false"
        className={cn('aspect-[3239/557] h-auto shrink-0 text-fg', WORDMARK_WIDTH[size])}
      >
        <use href="#entrevc-wordmark" />
      </svg>
      <span
        className={cn(
          'font-mono uppercase text-fg-subtle',
          size === 'header' && 'hidden border-l border-fg/15 pl-3 text-[0.56rem] leading-[1.35] tracking-[0.16em] sm:block',
          size === 'footer' && 'text-[0.62rem] tracking-[0.16em]',
          size === 'orbit' && 'text-[0.62rem] tracking-[0.22em]',
          size === 'feature' && 'text-[clamp(0.62rem,1.2vw,0.78rem)] leading-5 tracking-[0.18em]',
        )}
      >
        {size === 'header' ? (
          <>
            IIM
            <br />
            Ahmedabad
          </>
        ) : size === 'orbit' ? (
          'IIM Ahmedabad'
        ) : (
          <>
            Entrepreneurship &amp; Venture Capital Club
            <br />
            IIM Ahmedabad
          </>
        )}
      </span>
    </span>
  )

  if (!asLink) {
    return (
      <span role="img" aria-label="EntreVC, the Entrepreneurship and Venture Capital Club of IIM Ahmedabad" className={className}>
        {mark}
      </span>
    )
  }

  return (
    <Link href="/" prefetch={false} aria-label="EntreVC home" className={cn('inline-flex shrink-0 rounded-sm', className)}>
      {mark}
    </Link>
  )
}
