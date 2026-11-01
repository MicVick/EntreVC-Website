import type { Metadata } from 'next'

import type { ImageRef } from '@/lib/schemas'

const FALLBACK_SITE_URL = 'https://entrevc.in'
const SITE_NAME = 'EntreVC · IIM Ahmedabad'

/**
 * The link-preview card for WhatsApp, LinkedIn, X and the rest: the hero drawing, the
 * logo and the headline, 1200 × 630. Rendered from the site's own SVG. A page uses its
 * own image only when it has a real photo; seeded placeholders never replace this.
 */
export const DEFAULT_SHARE_IMAGE = {
  url: '/og/entrevc-share.jpg',
  width: 1200,
  height: 630,
  alt: 'EntreVC, IIM Ahmedabad: Build the thing you keep talking about. A line drawing of Louis Kahn Plaza with a rocket lifting off past the setting sun.',
}

function isPlaceholder(image: ImageRef): boolean {
  return /^placeholder\b/i.test(image.alt) || /(?:^|\/)placeholder[-/]/i.test(image.url)
}

/** The image a page should share: its own when it has a real one, the club card otherwise. */
export function shareImage(image?: ImageRef | null) {
  const chosen = image && !isPlaceholder(image) ? image : DEFAULT_SHARE_IMAGE
  return { url: absoluteUrl(chosen.url), width: chosen.width, height: chosen.height, alt: chosen.alt }
}

export function getSiteUrl(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()

  try {
    return new URL(configured || FALLBACK_SITE_URL)
  } catch {
    return new URL(FALLBACK_SITE_URL)
  }
}

export function absoluteUrl(path: string): string {
  return new URL(path, getSiteUrl()).toString()
}

type MetadataInput = {
  title: string
  description: string
  path: string
  image?: ImageRef | null
  absoluteTitle?: boolean
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  absoluteTitle = false,
}: MetadataInput): Metadata {
  const canonical = absoluteUrl(path)
  const resolvedTitle = absoluteTitle ? title : `${title} · EntreVC`
  const preview = shareImage(image)

  return {
    title: { absolute: resolvedTitle },
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title: resolvedTitle,
      description,
      url: canonical,
      locale: 'en_IN',
      images: [preview],
    },
    twitter: {
      card: 'summary_large_image',
      title: resolvedTitle,
      description,
      images: [{ url: preview.url, alt: preview.alt }],
    },
  }
}
