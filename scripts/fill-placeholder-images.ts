import 'dotenv/config'
import dotenv from 'dotenv'
import sharp from 'sharp'

dotenv.config({ path: '.env.local', override: true })

/**
 * Give every record that has no image a placeholder, so no page renders with a hole
 * in it while the club is still gathering real photography.
 *
 * Distinct from `scripts/generate-placeholders.ts`, which writes files to `public/` for
 * the fixture data Agent B builds against. This one goes through the CMS: it uploads
 * into the media library and attaches the result to the record, exactly as an editor
 * would. That matters because it means replacing a placeholder later is the ordinary
 * "change the image" job in the admin, not a developer task.
 *
 * Idempotent by design — it skips anything that already has an image, so running it
 * twice does nothing the second time, and it can never overwrite a real photograph
 * somebody has uploaded.
 *
 *   npm run placeholders:fill           # fill the gaps
 *   npm run placeholders:fill -- --dry  # report only
 */

const dryRun = process.argv.includes('--dry')

type Target = {
  collection: 'events' | 'startups' | 'team-members' | 'resources'
  field: string
  width: number
  height: number
  /** What the image is, for the alt text — these end up read aloud. */
  kind: string
}

const TARGETS: Target[] = [
  { collection: 'events', field: 'heroImage', width: 1600, height: 900, kind: 'event poster' },
  { collection: 'startups', field: 'logo', width: 800, height: 800, kind: 'venture logo' },
  { collection: 'team-members', field: 'photo', width: 800, height: 1000, kind: 'portrait' },
  { collection: 'resources', field: 'coverImage', width: 1200, height: 675, kind: 'resource cover' },
]

// Deliberately NOT here: schemes and playbook chapters. Neither collection has an image
// field, and nothing on the public site renders one for them — `lib/schemas/scheme.ts`
// declares `image` but no mapper populates it and no page reads it. Filling those would
// have written media nobody ever sees. A field missing on 100% of records is the tell
// that the field does not exist, rather than that every record forgot to set it.

/**
 * The same quiet placeholder the fixture generator uses: dark ground, a thin brand rule,
 * the label. Loud placeholders make a layout harder to judge, not easier.
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
            font-size="${Math.round(fontSize * 0.7)}" fill="#575654">placeholder</text>
    </svg>`)
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .slice(0, 60)
    .replace(/^-+|-+$/g, '')
}

async function main() {
  const { getPayload } = await import('payload')
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  let filled = 0
  let skipped = 0

  for (const target of TARGETS) {
    const res = await payload.find({
      collection: target.collection,
      limit: 500,
      depth: 0,
      overrideAccess: true,
      draft: true,
    })

    for (const doc of res.docs) {
      // Spread rather than cast: Payload's generated union has no index signature, and
      // CLAUDE.md forbids an `as` cast to silence that.
      const record: Record<string, unknown> = { ...doc }
      const existing = record[target.field]
      if (existing !== null && existing !== undefined && existing !== '') {
        skipped += 1
        continue
      }

      const title = String(record.title ?? record.name ?? `item-${record.id}`)
      const label = title.slice(0, 42)

      if (dryRun) {
        console.log(`  would fill ${target.collection}.${target.field} → ${title.slice(0, 50)}`)
        filled += 1
        continue
      }

      const buffer = await sharp(placeholderSvg(target.width, target.height, label))
        .webp({ quality: 80 })
        .toBuffer()

      const filename = `placeholder-${target.collection}-${slugify(title)}.webp`

      const media = await payload.create({
        collection: 'media',
        // `alt` is a required field. Describing it as a placeholder is the honest
        // answer for a screen reader — better than inventing a description of a
        // picture that does not exist yet.
        data: { alt: `Placeholder ${target.kind} for ${title}` },
        file: {
          data: buffer,
          mimetype: 'image/webp',
          name: filename,
          size: buffer.length,
        },
        overrideAccess: true,
      })

      await payload.update({
        collection: target.collection,
        id: typeof record.id === 'number' ? record.id : Number(record.id),
        data: { [target.field]: media.id },
        overrideAccess: true,
        // Keep a published document published; this must not quietly unpublish anything.
        draft: false,
      })

      console.log(`  ${target.collection}.${target.field} ← ${filename}`)
      filled += 1
    }
  }

  console.log(
    dryRun
      ? `\n${filled} record(s) would get a placeholder. ${skipped} already have an image. Nothing changed.`
      : `\nFilled ${filled} record(s). ${skipped} already had an image and were left alone.`,
  )
  console.log('Replace any of these in /admin by uploading a real image over the top.')
  process.exit(0)
}

void main()
