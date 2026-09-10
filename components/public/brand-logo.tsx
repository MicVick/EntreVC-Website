import Image from 'next/image'
import Link from 'next/link'

import brandLogo from '@/brand/logo-full.png'
import { cn } from '@/components/ui/cn'

type BrandLogoProps = {
  className?: string
  compact?: boolean
}

export function BrandLogo({ className, compact = false }: BrandLogoProps) {
  return (
    <Link
      href="/"
      aria-label="EntreVC home"
      className={cn(
        'inline-flex shrink-0 items-center overflow-hidden rounded-sm bg-fg shadow-sm transition hover:-translate-y-0.5 hover:shadow-md',
        compact ? 'w-32 p-1.5 sm:w-36' : 'w-52 p-2 sm:w-60',
        className,
      )}
    >
      <Image
        src={brandLogo}
        alt="EntreVC — Entrepreneurship and Venture Capital Club, IIM Ahmedabad"
        sizes={compact ? '(min-width: 640px) 144px, 128px' : '(min-width: 640px) 240px, 208px'}
        className="h-auto w-full"
      />
    </Link>
  )
}
