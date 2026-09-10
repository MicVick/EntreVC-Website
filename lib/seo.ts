import type { Metadata } from 'next'

import type { ImageRef } from '@/lib/schemas'

const FALLBACK_SITE_URL = 'https://entrevc.in'
const SITE_NAME = 'EntreVC · IIM Ahmedabad'

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
  const images = image
    ? [
        {
          url: absoluteUrl(image.url),
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ]
    : undefined

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
      images,
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title: resolvedTitle,
      description,
      images: image ? [absoluteUrl(image.url)] : undefined,
    },
  }
}
