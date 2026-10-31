'use client'

import { getImageProps } from 'next/image'
import { useState } from 'react'

import { cn } from '@/components/ui/cn'
import type { ImageRef } from '@/lib/schemas'

type ContentImageProps = {
  image: ImageRef | null
  kind: 'event' | 'resource' | 'person' | 'startup'
  label: string
  sizes: string
  className?: string
  priority?: boolean
}

/**
 * One fallback for missing uploads, old generated placeholders and failed requests:
 * the upload, then (for events and resources) an editorial photo, then a monogram.
 * Every URL that fails is remembered, so a broken fallback can never send it back to
 * the broken upload.
 */
export function ContentImage({ image, kind, label, sizes, className, priority = false }: ContentImageProps) {
  const [failedUrls, setFailedUrls] = useState<ReadonlySet<string>>(() => new Set())
  const markFailed = (url: string) => setFailedUrls((previous) => new Set(previous).add(url))
  const isPlaceholder = image && (/^placeholder\b/i.test(image.alt) || /(?:^|\/)placeholder[-/]/i.test(image.url))
  const illustrativeImages = [
    '/images/editorial/founder-workroom.webp',
    '/images/editorial/field-notes.webp',
    '/images/editorial/ideas-in-motion.webp',
  ]

  if (image && !isPlaceholder && !failedUrls.has(image.url)) {
    const { props } = getImageProps({ src: image.url, alt: image.alt, width: image.width, height: image.height, sizes, priority })
    return (
      // Plain <img> with next/image's optimised src/srcset: same output, without
      // shipping the <Image> component's client runtime to every page.
      // eslint-disable-next-line @next/next/no-img-element
      <img
        {...props}
        alt={image.alt}
        onError={() => markFailed(image.url)}
        className={cn('h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]', className)}
      />
    )
  }

  if (kind === 'event' || kind === 'resource') {
    const index = [...label].reduce((sum, char) => sum + char.charCodeAt(0), 0) % illustrativeImages.length
    const fallbackUrl = illustrativeImages[index]
    if (!failedUrls.has(fallbackUrl)) {
      const { props } = getImageProps({ src: fallbackUrl, alt: `Illustrative image for ${label}`, width: 1600, height: 900, sizes, priority })
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          {...props}
          alt={`Illustrative image for ${label}`}
          onError={() => markFailed(fallbackUrl)}
          className={cn('h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]', className)}
        />
      )
    }
  }

  const initials = label.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()

  // Monogram inside a thin circle (Kahn's oculus): reads as a deliberate mark rather
  // than a missing image, and stays distinct between startups.
  return (
    <div
      role="img"
      aria-label={`${kind === 'person' ? 'Portrait' : kind === 'startup' ? 'Logo' : 'Image'} placeholder for ${label}`}
      data-image-fallback={kind}
      className={cn('relative flex h-full w-full items-center justify-center overflow-hidden bg-surface-2 text-fg [container-type:inline-size]', className)}
    >
      <span aria-hidden="true" className="absolute aspect-square w-[72%] max-w-48 rounded-full border border-border-strong" />
      <span aria-hidden="true" className="absolute aspect-square w-[60%] max-w-40 rounded-full border border-border" />
      <span aria-hidden="true" className="relative font-display text-[clamp(1rem,28cqi,2.6rem)] font-bold tracking-[-0.04em] [font-stretch:85%]">
        {initials || '·'}
      </span>
    </div>
  )
}
