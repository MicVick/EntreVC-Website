'use client'

import Image from 'next/image'
import { useState } from 'react'
import { BookOpen, Lightbulb, Rocket, Sparkles, UserRound } from 'lucide-react'

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

/** One fallback for missing uploads, old generated placeholders and failed requests. */
export function ContentImage({ image, kind, label, sizes, className, priority = false }: ContentImageProps) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null)
  const isPlaceholder = image && (/^placeholder\b/i.test(image.alt) || /(?:^|\/)placeholder[-/]/i.test(image.url))

  if (image && !isPlaceholder && image.url !== failedUrl) {
    return (
      <Image
        src={image.url}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        priority={priority}
        onError={() => setFailedUrl(image.url)}
        className={cn('h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]', className)}
      />
    )
  }

  const initials = label.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()
  const Icon = kind === 'person' ? UserRound : kind === 'startup' ? Rocket : kind === 'resource' ? BookOpen : Lightbulb

  return (
    <div
      role="img"
      aria-label={`${kind === 'person' ? 'Portrait' : kind === 'startup' ? 'Logo' : 'Image'} placeholder for ${label}`}
      data-image-fallback={kind}
      className={cn('relative flex h-full w-full items-center justify-center overflow-hidden', kind === 'resource' ? 'bg-lilac text-lilac-ink' : kind === 'event' ? 'bg-playful text-playful-ink' : 'bg-brand-muted text-accent', className)}
    >
      <span aria-hidden="true" className="absolute -bottom-1/4 -left-1/4 aspect-square w-3/4 rounded-full border border-current opacity-15" />
      <span aria-hidden="true" className="absolute -right-1/4 -top-1/4 aspect-square w-3/4 rounded-full border border-current opacity-15" />
      <Icon aria-hidden="true" className="relative size-1/2 max-h-28 max-w-28 -rotate-6 transition duration-500 group-hover:rotate-6 group-hover:scale-110" strokeWidth={1.2} />
      <Sparkles aria-hidden="true" className="absolute right-[12%] top-[15%] size-[12%] max-h-7 max-w-7" strokeWidth={1.3} />
      {(kind === 'person' || kind === 'startup') && (
        <span aria-hidden="true" className="absolute bottom-[8%] right-[10%] rounded-full bg-bg px-[0.4em] text-[clamp(0.6rem,1.3vw,1rem)] font-bold">{initials}</span>
      )}
    </div>
  )
}
