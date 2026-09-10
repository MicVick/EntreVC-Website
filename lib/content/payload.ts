import 'server-only'

import { cache } from 'react'
import { getPayload } from 'payload'
import { convertLexicalToHTML } from '@payloadcms/richtext-lexical/html'
import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'

import config from '@payload-config'
import { emptyRichText, type ImageRef, type RichText } from '@/lib/schemas'

/**
 * The boundary between Payload and the rest of the application.
 *
 * Everything below this file knows about Payload. Everything above it — every page,
 * every component — sees only the plain types in lib/schemas. That seam is why moving
 * from Firestore to Payload changed no pages, and why moving off Payload later would
 * not either.
 */

/** One Payload instance per process, memoised across requests. */
export const client = cache(async () => getPayload({ config }))

// ── Mappers ──────────────────────────────────────────────────────────────────

/**
 * Convert Lexical to sanitised HTML plus a plaintext version.
 *
 * Done server-side so Lexical never enters the public bundle, and so what reaches a
 * page is a string rather than a node tree Agent B would have to interpret.
 */
export function toRichText(value: unknown): RichText {
  if (!value || typeof value !== 'object' || !('root' in value)) return emptyRichText
  const data = value as SerializedEditorState
  try {
    return {
      html: convertLexicalToHTML({ data }),
      plainText: convertLexicalToPlaintext({ data }),
    }
  } catch {
    // A malformed editor state must not take down a page. Better a section renders
    // empty than a 500 on an event page ten minutes before the event.
    return emptyRichText
  }
}

export function toRichTextOrNull(value: unknown): RichText | null {
  const rt = toRichText(value)
  return rt.plainText.trim().length > 0 ? rt : null
}

/**
 * Map a Payload upload document to an ImageRef.
 *
 * Returns `null` rather than a partial object when width or height are missing, so
 * Agent B's `next/image` calls can always trust the dimensions and never need `fill`
 * with a guessed aspect ratio.
 */
export function toImageRef(value: unknown): ImageRef | null {
  if (!value || typeof value !== 'object') return null
  const m = value as Record<string, unknown>
  const url = typeof m.url === 'string' ? m.url : null
  const alt = typeof m.alt === 'string' ? m.alt : ''
  const width = typeof m.width === 'number' ? m.width : null
  const height = typeof m.height === 'number' ? m.height : null
  if (!url || !width || !height) return null
  // `alt` is required at upload, but a legacy or imported row could still be empty;
  // an empty string is the correct HTML for a decorative image, so we allow it here
  // rather than dropping the image entirely.
  return { url, alt, width, height }
}

export function toImageRefs(value: unknown): ImageRef[] {
  if (!Array.isArray(value)) return []
  return value.map(toImageRef).filter((i): i is ImageRef => i !== null)
}

/** Payload dates come back as ISO strings or Date objects depending on the adapter. */
export function toIso(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return fallback
}

export function toIsoOrNull(value: unknown): string | null {
  const iso = toIso(value, '')
  return iso.length > 0 ? iso : null
}

export function str(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null
}

export function strList(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string' && v.trim().length > 0)
}

export function num(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export function bool(value: unknown): boolean {
  return value === true
}
