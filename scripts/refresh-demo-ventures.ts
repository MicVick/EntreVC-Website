/** Refresh only untouched demo listings. Editor-written profiles are never replaced. */
import path from 'path'
import dotenv from 'dotenv'
import { getPayload } from 'payload'

import { lexical } from './lexical'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })
dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true })

const updates = [
  {
    slug: 'paylane',
    old: 'Automates settlement reconciliation across payment gateways for small merchants.',
    next: 'PayLane helps small merchants reconcile payments received through different gateways. It brings settlement records into one workflow so teams can compare what was paid, what arrived, and what still needs attention. The venture focuses on making a routine finance task easier to review as payment volume grows.',
  },
  {
    slug: 'kisanquery',
    old: 'An IVR and WhatsApp service answering agronomy questions in the farmer’s own language.',
    next: 'KisanQuery provides crop and farming guidance through IVR and WhatsApp in the farmer’s own language. Its voice-first approach is designed for people who may find a text-heavy app difficult to use. The service focuses on making everyday agronomy questions easier to ask and answer across nine languages.',
  },
  {
    slug: 'hostelkart',
    old: 'Dark-store model serving hostel blocks, run entirely by students.',
    next: 'HostelKart is a student-run delivery service for everyday essentials inside campus. It uses a small inventory close to the hostel blocks to make short-distance orders easier to fulfil. The venture started with direct requests from students and focuses on the practical needs of campus life.',
  },
  {
    slug: 'notewell',
    old: 'Records lectures and produces structured summaries and flashcards.',
    next: 'Notewell turns recorded lectures into structured notes, summaries, and flashcards. It is designed to help students revisit a class and find the ideas they need while preparing for discussion or revision. The concept is still at the idea stage.',
  },
]

async function main() {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })
  const apply = process.argv.includes('--apply')

  for (const update of updates) {
    const result = await payload.find({
      collection: 'startups',
      where: { slug: { equals: update.slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const startup = result.docs[0]
    if (!startup) continue

    const untouched = JSON.stringify(startup.description) === JSON.stringify(lexical(update.old))
    const demoWebsite = startup.website === `https://example.com/${update.slug}`
    if (!untouched && !demoWebsite) continue

    console.log(`${apply ? 'Updating' : 'Would update'} ${update.slug}: ${untouched ? 'description ' : ''}${demoWebsite ? 'placeholder website' : ''}`)
    if (!apply) continue

    await payload.update({
      collection: 'startups',
      id: startup.id,
      data: {
        ...(untouched ? { description: lexical(update.next) } : {}),
        ...(demoWebsite ? { website: null } : {}),
      },
      draft: false,
      overrideAccess: true,
    })
  }

  console.log(apply ? 'Demo venture refresh complete.' : 'Dry run only. Pass --apply to write.')
  process.exit(0)
}

void main()
