import type { ImageRef, RichText } from '@/lib/schemas'

/**
 * Fixture helpers.
 *
 * Dates are RELATIVE TO NOW, deliberately. Hardcoded dates rot: an "upcoming" event
 * quietly becomes a past one a fortnight later, and then Agent B is building the
 * upcoming-events strip against an empty array without realising why.
 */

const DAY = 24 * 60 * 60 * 1000

export function daysFromNow(days: number, hour = 18, minute = 30): string {
  const d = new Date(Date.now() + days * DAY)
  d.setUTCHours(hour - 5, minute - 30, 0, 0) // IST (+5:30) → UTC
  return d.toISOString()
}

export function hoursAfter(iso: string, hours: number): string {
  return new Date(new Date(iso).getTime() + hours * 60 * 60 * 1000).toISOString()
}

/**
 * Build a RichText value from simple HTML.
 * Mirrors what lib/content produces from Lexical: sanitised HTML plus plaintext.
 */
export function rt(html: string): RichText {
  return {
    html,
    plainText: html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  }
}

/** A placeholder image with real dimensions, so next/image never has to guess. */
export function img(seed: string, alt: string, width = 1200, height = 675): ImageRef {
  return { url: `/media/placeholder/${seed}.webp`, alt, width, height }
}

export function squareImg(seed: string, alt: string, size = 400): ImageRef {
  return img(seed, alt, size, size)
}
