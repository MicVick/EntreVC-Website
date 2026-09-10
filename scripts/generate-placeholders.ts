/**
 * Generate a placeholder image for every image referenced by the fixtures.
 *
 * Agent B builds pages against fixtures; without these files every one of those
 * images 404s and the pages look broken for reasons that have nothing to do with
 * Agent B's code. Deriving the list from the fixtures themselves means the set can
 * never drift out of sync — add a fixture image, re-run, done.
 *
 *   npx tsx scripts/generate-placeholders.ts
 */
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

import {
  eventFixtures,
  playbookMetaFixture,
  resourceFixtures,
  siteSettingsFixture,
  startupFixtures,
  teamMemberFixtures,
} from '../lib/fixtures'
import type { ImageRef } from '../lib/schemas'

const OUT_ROOT = path.resolve(process.cwd(), 'public')

/** Walk any structure and collect every object that looks like an ImageRef. */
function collectImages(value: unknown, found = new Map<string, ImageRef>()): Map<string, ImageRef> {
  if (!value || typeof value !== 'object') return found
  if (Array.isArray(value)) {
    for (const item of value) collectImages(item, found)
    return found
  }
  const obj = value as Record<string, unknown>
  if (
    typeof obj.url === 'string' &&
    typeof obj.alt === 'string' &&
    typeof obj.width === 'number' &&
    typeof obj.height === 'number'
  ) {
    found.set(obj.url, obj as unknown as ImageRef)
  }
  for (const v of Object.values(obj)) collectImages(v, found)
  return found
}

/**
 * A neutral placeholder: dark ground, a thin brand-red rule, and the label.
 *
 * Deliberately plain. These stand in for real posters, and a loud placeholder makes
 * it harder to judge a layout than a quiet one.
 */
function placeholderSvg(width: number, height: number, label: string): Buffer {
  const fontSize = Math.max(14, Math.round(Math.min(width, height) / 14))
  const safe = label.replace(/[<>&]/g, '').slice(0, 42)
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <rect width="100%" height="100%" fill="#141110"/>
      <rect x="0" y="0" width="100%" height="3" fill="#BD282E"/>
      <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle"
            font-family="system-ui, -apple-system, Segoe UI, sans-serif"
            font-size="${fontSize}" fill="#8a8987">${safe}</text>
      <text x="50%" y="calc(50% + ${fontSize * 1.6}px)" text-anchor="middle" dominant-baseline="middle"
            font-family="system-ui, -apple-system, Segoe UI, sans-serif"
            font-size="${Math.round(fontSize * 0.7)}" fill="#575654">${width}×${height}</text>
    </svg>`)
}

async function main() {
  const images = collectImages([
    eventFixtures,
    startupFixtures,
    resourceFixtures,
    teamMemberFixtures,
    siteSettingsFixture,
    playbookMetaFixture,
  ])

  let written = 0
  for (const [url, ref] of images) {
    if (!url.startsWith('/')) continue // external URLs need no placeholder
    const target = path.join(OUT_ROOT, url)
    await fs.mkdir(path.dirname(target), { recursive: true })

    const label = path.basename(url).replace(/\.[a-z0-9]+$/i, '').replace(/-/g, ' ')
    await sharp(placeholderSvg(ref.width, ref.height, label))
      .webp({ quality: 80 })
      .toFile(target)
    written += 1
  }

  console.log(`Wrote ${written} placeholder images under public/media/.`)
  console.log('These are development stand-ins — real uploads replace them via the admin.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
