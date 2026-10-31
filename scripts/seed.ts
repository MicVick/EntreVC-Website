/**
 * Seed the database with content covering every state the site has to render.
 *
 *   npm run seed         populate (idempotent — skips if content already exists)
 *   npm run seed:reset   wipe seeded content first, then populate
 *
 * The point is coverage, not volume (CONTRACT.md §2). Alongside the ordinary records
 * this creates the awkward ones deliberately:
 *
 *   - an event at capacity, and one past its registration deadline
 *   - an uncapped online event with no hero image and no venue
 *   - a past event with a recap, and a past event without one
 *   - a DRAFT event, which must never appear on the public site
 *   - a startup awaiting listing approval, which must also never appear
 *   - a venture whose founders withheld contact consent
 *
 * The draft and the unapproved listing are the important ones: if either ever shows up
 * on a page, a privacy or publishing guarantee has broken, and it is better to find
 * that here than after an alumnus emails to ask why they are on the website.
 */
import path from 'path'
import dotenv from 'dotenv'
import { getPayload, type Payload } from 'payload'

import type { SiteSetting } from '../payload-types'
import { daysFromNow, hoursAfter } from '../lib/fixtures/helpers'
import { lexical } from './lexical'

// Next loads .env.local automatically; a plain tsx script does not, so load it here
// (falling back to .env, which is what the VM uses).
//
// This MUST run before payload.config is imported — the config reads PAYLOAD_SECRET
// at module scope, and ES module imports are hoisted above ordinary statements. Hence
// the dynamic import inside main() rather than a static one at the top of the file.
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })
dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true })

const RESET = process.argv.includes('--reset')
/** Rewrite Site settings (and what depends on it) without touching other content. */
const SETTINGS_ONLY = process.argv.includes('--settings')
const PLACEHOLDER_DIR = path.resolve(process.cwd(), 'public/media/placeholder')

const SEEDED_COLLECTIONS = [
  'registrations',
  'submissions',
  'subscribers',
  'events',
  'startups',
  'resources',
  'playbook-chapters',
  'schemes',
  'team-members',
  'media',
] as const

/** Every enquiry goes to the one club mailbox. */
const CLUB_EMAIL = 'entre@iima.ac.in'

/** EntreFair 2025 as reported in the 2026–27 club run deck. */
const ENTREFAIR_2025 = {
  subtitle: 'Fifteen-plus startups, ten live projects and an internship for IIMA students',
  description:
    'The annual fair where startups meet IIMA students for live projects, internships and roles in the startup and VC world.',
  recap: 'More than fifteen startups took part. Students went on to deliver ten live projects, and one internship came out of the fair.',
}

/** The club's cells, from the club run deck, with the leads first. */
const VERTICALS = [
  { name: 'Leadership', order: 1, description: 'The club heads. They set the year’s direction and run the handover.' },
  { name: 'Partnerships', order: 2, description: 'Sponsorships, the alumni founder and VC network, and tie-ups with other institutions.' },
  { name: 'Events', order: 3, description: 'Flagship events, speaker and founder sessions, and the E-Summit.' },
  { name: 'Marketing & Design', order: 4, description: 'Social media, PR, campaigns, creative, content and campus presence.' },
  { name: 'Startups', order: 5, description: 'Founder support, incubation and the link with IIMA Ventures.' },
  { name: 'Career', order: 6, description: 'EntreFair, live projects, internships, and startup and VC roles.' },
  { name: 'Finance & Ops', order: 7, description: 'Budgets, reimbursements, documentation and continuity.' },
]

/** Team rows seeded before the club moved to cells: [old vertical, new vertical, old role, new role]. */
const VERTICAL_RENAMES = [
  ['Ventures', 'Startups', 'Head of Ventures', 'Startups Cell Head'],
  ['Outreach', 'Partnerships', 'Head of Outreach', 'Partnerships Cell Head'],
  ['Events', 'Events', 'Head of Events', 'Events Cell Head'],
] as const

/**
 * Site settings, including the Club story tab filled from the 2026–27 club run deck
 * (EntreVC_ClubRun_2026-27.pdf). Social links and the IIMA Ventures website are still
 * placeholders — see docs/content-needed.md.
 */
function siteSettingsData(): Omit<SiteSetting, 'id'> {
  return {
    positioningStatement:
      'IIMA’s launchpad for entrepreneurship, connecting every founder to mentorship, capital and community.',
    intro: lexical(
      'EntreVC is the Entrepreneurship & Venture Capital Club of IIM Ahmedabad, what many campuses call the E-cell. Through the year we run talks with founders and VCs, pitch competitions, a startup fair and co-founder matchmaking, and we work closely with IIMA Ventures, the institute’s incubator, to take student ideas towards incubation.',
    ),
    clubEmail: CLUB_EMAIL,
    campusAddress: 'Indian Institute of Management Ahmedabad, Vastrapur, Ahmedabad 380015, Gujarat',
    takedownEmail: CLUB_EMAIL,
    keyNumbers: {
      alumniNetwork: 1600,
      eventsHeldLabel: 'Events held',
      startupsListedLabel: 'Ventures listed',
      alumniNetworkLabel: 'Alumni network',
    },
    pillars: [
      { figure: '250+', title: 'Every cohort', description: 'One of the largest clubs on campus, with more than 250 members last year.' },
      { figure: null, title: 'Built to win', description: 'Winner of the Overall Excellence Award among interest clubs last year.' },
      { figure: null, title: 'Powered by IIMA Ventures', description: 'A strong partnership with IIMA Ventures, the institute’s incubator, and with other institutes.' },
    ],
    highlights: {
      yearLabel: '2025–26',
      stats: [
        { figure: '15+', label: 'Events run' },
        { figure: '6+', label: 'Founders and VCs hosted' },
        { figure: '2K+', label: 'Podcast views' },
        { figure: '4', label: 'Newsletter issues' },
      ],
      flagships: [
        { name: 'HTSAS', figure: '170+', unit: 'attendees', description: 'Speaker editions with global founders and VCs.' },
        { name: 'Young CEO', figure: '30+', unit: 'teams', description: 'Our marquee startup-pitching competition.' },
        { name: 'TRBS × Masterplan', figure: '500+', unit: 'teams', description: 'National social-entrepreneurship contest with a ₹1L+ prize pool.' },
        { name: 'EntreFair 2025', figure: '15+', unit: 'startups', description: 'Delivered 10 live projects and 1 internship.' },
        { name: 'Catalyst', figure: '80+', unit: 'founders and builders', description: 'Co-founder networking and matchmaking.' },
      ],
      otherEvents: [
        { name: 'Reverse Shark Tank' },
        { name: 'Deal or No Deal' },
        { name: 'Podcasts' },
        { name: 'Foundry' },
        { name: 'EntreVC Quiz' },
      ],
    },
    founderWall: {
      stats: [
        { figure: '1,300+', label: 'Companies founded by IIMA alumni' },
        { figure: '16', label: 'Unicorns on the wall' },
        { figure: '$24 Bn+', label: 'Raised by them' },
      ],
      companies: [
        { name: 'Nykaa', founders: 'Falguni Nayar', description: 'Beauty and lifestyle retail (listed)', foundedYear: 2012 },
        { name: 'Naukri / Info Edge', founders: 'Sanjeev Bikhchandani', description: 'Internet classifieds and jobs (listed)', foundedYear: 1995 },
        { name: 'MakeMyTrip', founders: 'Deep Kalra', description: 'Online travel (Nasdaq-listed)', foundedYear: 2000 },
        { name: 'FirstCry', founders: 'Supam Maheshwari', description: 'Baby and kids retail (listed)', foundedYear: 2010 },
        { name: 'Fractal Analytics', founders: 'S. Velamakanni & P. Agrawal', description: 'AI and analytics (listed)', foundedYear: 2000 },
        { name: 'Mastek', founders: 'Ashank Desai', description: 'IT services (listed)', foundedYear: 1982 },
        { name: 'TaxiForSure', founders: 'A. Radhakrishna & Raghunandan G', description: 'Cab aggregator (acquired by Ola)', foundedYear: 2011 },
        { name: 'Koo', founders: 'A. Radhakrishna & M. Bidawatka', description: 'Vernacular microblogging', foundedYear: 2020 },
      ],
      source: 'Tracxn, 2026',
    },
    roadmap: {
      yearLabel: '2026–27',
      phases: [
        {
          name: 'Term 1',
          items: [
            { title: 'EntreVC portal & website', description: 'A permanent home base, built with IIMA Ventures.', isNew: true },
            { title: 'VC/PE and founder seminars', description: 'Informative sessions, all year.', isNew: false },
            { title: 'Mavericks Challenge', description: 'The pathway to the Mavericks Program.', isNew: false },
          ],
        },
        {
          name: 'Mid-year',
          items: [
            { title: 'Mavericks | Young CEO', description: 'Student to IIMA Ventures: idea to incubation.', isNew: true },
            { title: 'EntreFair', description: 'More startups, more offers.', isNew: false },
            { title: 'TRBS × Masterplan', description: 'A national-level case competition.', isNew: false },
          ],
        },
        {
          name: 'Flagship',
          items: [
            { title: 'National E-Summit', description: 'With IIM A, B, C and L, and incubators.', isNew: true },
            { title: 'Catalyst', description: 'More founders, more builders.', isNew: false },
            { title: 'IIMA Ventures Summit', description: 'A bigger cohort and better events.', isNew: false },
          ],
        },
      ],
    },
    categoryRouting: [
      { category: 'general', email: CLUB_EMAIL, vertical: null },
      { category: 'event', email: CLUB_EMAIL, vertical: 'Events' },
      { category: 'startup_listing', email: CLUB_EMAIL, vertical: 'Startups' },
      { category: 'sponsorship', email: CLUB_EMAIL, vertical: 'Partnerships' },
      { category: 'speaking', email: CLUB_EMAIL, vertical: 'Events' },
      { category: 'mentorship', email: CLUB_EMAIL, vertical: 'Startups' },
    ],
    roleContacts: [
      { role: 'Sponsorship', name: 'Zoya Khan', email: CLUB_EMAIL, description: 'Partnering with us on an event or the annual fair.' },
      { role: 'Speaker invitations', name: 'Dev Agarwal', email: CLUB_EMAIL, description: 'Inviting a speaker, or offering to speak.' },
      { role: 'Media', name: 'Omkar Joshi', email: CLUB_EMAIL, description: 'Press enquiries and coverage.' },
      { role: 'Startup listings', name: 'Rehan Siddiqui', email: CLUB_EMAIL, description: 'Adding, correcting or removing a venture.' },
    ],
    socialLinks: [
      { platform: 'linkedin', url: 'https://linkedin.com/company/example-entrevc', label: null },
      { platform: 'instagram', url: 'https://instagram.com/example_entrevc', label: null },
    ],
    verticals: VERTICALS,
    structureNote: 'Each cell has a Cell Head and five Core Members. Open to PGP1 and PGPX students, as members and as core team.',
    iimaVentures: {
      overview: lexical(
        'IIMA Ventures is the incubation and entrepreneurship centre at IIM Ahmedabad. It runs incubation programmes, grants and lab facilities that any IIMA student can apply to.',
      ),
      highlight: 'Over 1,600 ventures supported since 2002.',
      contactName: 'EntreVC (we will connect you with IIMA Ventures)',
      contactEmail: CLUB_EMAIL,
      website: 'https://example.com/iimaventures',
    },
    playbook: {
      title: 'The EntreVC Startup Playbook',
      intro: lexical(
        'Written by the club, revised every year by the team that inherits it. Read it here, or take the PDF with you.',
      ),
    },
    youtubeChannelUrl: 'https://youtube.com/@example-entrevc',
  }
}

/**
 * `npm run seed:settings`: bring an already-seeded database up to date with the
 * settings above, without wiping events, registrations or anything else people
 * have added. Also moves team members off the old vertical names and corrects the
 * EntreFair 2025 write-up.
 */
async function refreshSettings(payload: Payload) {
  console.log('Writing site settings…')
  await payload.updateGlobal({ slug: 'site-settings', data: siteSettingsData() })

  for (const [from, to, oldRole, newRole] of VERTICAL_RENAMES) {
    const members = await payload.find({ collection: 'team-members', where: { vertical: { equals: from } }, limit: 200, depth: 0 })
    for (const member of members.docs) {
      await payload.update({
        collection: 'team-members',
        id: member.id,
        data: { vertical: to, ...(member.role === oldRole ? { role: newRole } : {}) },
      })
    }
    if (members.docs.length) console.log(`  updated ${members.docs.length} team member(s) in ${from === to ? from : `${from} → ${to}`}`)
  }

  const entrefair = await payload.find({ collection: 'events', where: { slug: { equals: 'entrefair-2025' } }, limit: 1, depth: 0 })
  const event = entrefair.docs[0]
  if (event) {
    await payload.update({
      collection: 'events',
      id: event.id,
      data: {
        subtitle: ENTREFAIR_2025.subtitle,
        description: lexical(ENTREFAIR_2025.description),
        recap: { ...event.recap, text: lexical(ENTREFAIR_2025.recap), recordingUrl: null },
      },
    })
    console.log('  updated EntreFair 2025')
  }
  console.log('Settings refreshed.')
}

async function main() {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

  if (SETTINGS_ONLY) {
    await refreshSettings(payload)
    return
  }

  if (RESET) {
    console.log('Resetting seeded content…')
    for (const collection of SEEDED_COLLECTIONS) {
      await payload.delete({ collection, where: { id: { exists: true } } })
    }
    console.log('  cleared.')
  }

  // ── Idempotence ───────────────────────────────────────────────────────────
  const existing = await payload.count({ collection: 'events' })
  if (existing.totalDocs > 0 && !RESET) {
    console.log(
      `Database already has ${existing.totalDocs} events — nothing to do.\n` +
        'Run `npm run seed:reset` to wipe and re-seed.',
    )
    return
  }

  // ── Admin user ────────────────────────────────────────────────────────────
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@entrevc.local'
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'changeme-in-dev-only'
  const users = await payload.count({ collection: 'users' })
  if (users.totalDocs === 0) {
    await payload.create({
      collection: 'users',
      data: { email: adminEmail, password: adminPassword, name: 'Seed Admin', role: 'admin', active: true },
    })
    console.log(`Created admin user ${adminEmail}`)
  }

  // ── Media ─────────────────────────────────────────────────────────────────
  // Uploaded from the generated placeholders, so seeded content has real image
  // records with real dimensions rather than nulls everywhere.
  // SQLite gives collections numeric ids, which is what the relationship fields expect.
  const upload = async (file: string, alt: string): Promise<number> => {
    const doc = await payload.create({
      collection: 'media',
      data: { alt: `Placeholder: ${alt}` },
      filePath: path.join(PLACEHOLDER_DIR, file),
    })
    return doc.id
  }

  console.log('Uploading media…')
  const mediaIds = {
    teardown: await upload('vc-teardown.webp', 'Panellists on stage at a previous VC Teardown session'),
    fireside: await upload('fireside.webp', 'Speaker in conversation with students in a classroom'),
    buildWeekend: await upload('build-weekend.webp', 'Students working at laptops around a table late at night'),
    entrefair: await upload('entrefair.webp', 'Stalls and crowds at EntreFair 2025'),
    entrefair1: await upload('entrefair-1.webp', 'A founder demonstrating a prototype to two visitors'),
    entrefair2: await upload('entrefair-2.webp', 'Wide shot of stalls across Louis Kahn Plaza'),
    ananya: await upload('ananya-rao.webp', 'Portrait of Ananya Rao'),
    paylane: await upload('paylane.webp', 'PayLane logo'),
    kisanquery: await upload('kisanquery.webp', 'KisanQuery logo'),
    hostelkart: await upload('hostelkart.webp', 'HostelKart logo'),
    aarav: await upload('aarav.webp', 'Portrait of Aarav Shetty'),
    ishita: await upload('ishita.webp', 'Portrait of Ishita Bose'),
  }

  // ── Site settings ─────────────────────────────────────────────────────────
  console.log('Writing site settings…')
  await payload.updateGlobal({ slug: 'site-settings', data: siteSettingsData() })

  // ── Events ────────────────────────────────────────────────────────────────
  console.log('Creating events…')
  const e1 = daysFromNow(9, 18, 30)
  const e2 = daysFromNow(5, 17, 0)
  const e3 = daysFromNow(21, 10, 0)
  const e4 = daysFromNow(14, 20, 0)
  const e5 = daysFromNow(-34, 9, 30)
  const e6 = daysFromNow(-72, 18, 0)
  const e7 = daysFromNow(45, 18, 0)

  await payload.create({
    collection: 'events',
    data: {
      title: 'VC Teardown 2026',
      slug: 'vc-teardown-2026',
      _status: 'published',
      featured: true,
      subtitle: 'Three funds, three theses, one term sheet pulled apart line by line',
      description: lexical(
        'Partners from three early-stage funds walk through a real term sheet clause by clause — liquidation preference, pro-rata, the board seat nobody reads carefully enough.',
        'Bring a laptop. We work through a live cap table in the second half.',
      ),
      startDateTime: e1,
      endDateTime: hoursAfter(e1, 2.5),
      format: 'hybrid',
      eventType: 'Speaker series',
      venue: {
        name: 'Ravi J. Matthai Auditorium',
        address: 'IIM Ahmedabad, Vastrapur, Ahmedabad 380015',
        mapLink: 'https://maps.google.com/?q=IIM+Ahmedabad',
      },
      heroImage: mediaIds.teardown,
      speakers: [
        {
          name: 'Ananya Rao',
          title: 'Partner',
          org: 'Elevation Capital',
          photo: mediaIds.ananya,
          linkedin: 'https://linkedin.com/in/example-ananya',
          bio: lexical('Leads seed investments in fintech and B2B SaaS.'),
        },
        { name: 'Vikram Shah', title: 'Principal', org: 'Blume Ventures' },
      ],
      agenda: [
        { time: '18:30', title: 'Doors and coffee' },
        { time: '18:45', title: 'Anatomy of a term sheet', speakerNames: ['Ananya Rao'] },
        { time: '19:45', title: 'Live cap table teardown', speakerNames: ['Vikram Shah'] },
      ],
      registrationEnabled: true,
      // AT CAPACITY: registrations below fill this exactly, so the form shows the
      // waitlist path the moment you load the page.
      capacity: 3,
      registrationDeadline: daysFromNow(8, 23, 59),
      restrictToInstituteEmail: false,
    },
  })

  await payload.create({
    collection: 'events',
    data: {
      title: 'Founder Fireside: building through a funding winter',
      slug: 'founder-fireside-march',
      _status: 'published',
      description: lexical(
        'An honest conversation about running a company for eighteen months without raising.',
      ),
      startDateTime: e2,
      endDateTime: hoursAfter(e2, 1.5),
      format: 'in_person',
      eventType: 'Fireside',
      venue: { name: 'Classroom 15, New Campus' },
      heroImage: mediaIds.fireside,
      speakers: [{ name: 'Meera Krishnan', title: 'Founder & CEO', org: 'Loomcraft' }],
      registrationEnabled: true,
      capacity: 90,
      // DEADLINE ALREADY PASSED — the form must not render.
      registrationDeadline: daysFromNow(-1, 23, 59),
      restrictToInstituteEmail: true,
    },
  })

  await payload.create({
    collection: 'events',
    data: {
      title:
        'Build Weekend 2026: forty-eight hours from a blank repository to a working product demo, judged by founders and operators',
      slug: 'build-weekend-2026',
      _status: 'published',
      featured: true,
      subtitle: 'Teams of four. One weekend. A working demo on Sunday evening.',
      description: lexical(
        'Form a team on Friday evening, ship something real by Sunday.',
        '## What to bring',
        'A laptop, a charger, and an idea — or the willingness to join someone else’s.',
      ),
      startDateTime: e3,
      endDateTime: hoursAfter(e3, 56),
      format: 'in_person',
      eventType: 'Workshop',
      venue: { name: 'Incubation Lab, IIMA Ventures', address: 'IIM Ahmedabad' },
      heroImage: mediaIds.buildWeekend,
      registrationEnabled: true,
      capacity: 120,
      registrationDeadline: daysFromNow(18, 23, 59),
      restrictToInstituteEmail: true,
      // THREE CUSTOM QUESTIONS — the maximum the schema allows.
      registrationFields: [
        {
          label: 'Do you already have a team?',
          type: 'select',
          required: true,
          options: ['I have a full team', 'I have one or two teammates', 'I am looking for a team'],
        },
        { label: 'What will you bring to a team?', type: 'textarea', required: false },
        { label: 'I have dietary requirements', type: 'checkbox', required: false },
      ],
    },
  })

  await payload.create({
    collection: 'events',
    data: {
      title: 'Term Sheets Decoded',
      slug: 'term-sheets-decoded-online',
      _status: 'published',
      subtitle: 'An online primer, open to alumni and students alike',
      description: lexical('A ninety-minute online session covering the vocabulary of an early-stage round.'),
      startDateTime: e4,
      endDateTime: hoursAfter(e4, 1.5),
      format: 'online', // No venue, no hero image — both must degrade gracefully.
      eventType: 'Workshop',
      onlineJoinUrl: 'https://meet.example.com/term-sheets',
      registrationEnabled: true,
      capacity: null, // UNCAPPED — no capacity indicator, ever.
      restrictToInstituteEmail: false,
    },
  })

  await payload.create({
    collection: 'events',
    data: {
      title: 'EntreFair 2025',
      slug: 'entrefair-2025',
      _status: 'published',
      subtitle: ENTREFAIR_2025.subtitle,
      description: lexical(ENTREFAIR_2025.description),
      startDateTime: e5,
      endDateTime: hoursAfter(e5, 7),
      format: 'in_person',
      eventType: 'Flagship',
      venue: { name: 'Louis Kahn Plaza', address: 'IIM Ahmedabad' },
      heroImage: mediaIds.entrefair,
      registrationEnabled: true,
      capacity: 400,
      registrationDeadline: daysFromNow(-36, 23, 59),
      // PAST WITH RECAP — the page switches to recap mode by itself.
      recap: {
        text: lexical(ENTREFAIR_2025.recap),
        gallery: [mediaIds.entrefair1, mediaIds.entrefair2],
      },
    },
  })

  await payload.create({
    collection: 'events',
    data: {
      title: 'Alumni Founders Panel',
      slug: 'alumni-founders-panel',
      _status: 'published',
      description: lexical('Four alumni founders on what the first two years actually looked like.'),
      startDateTime: e6,
      endDateTime: hoursAfter(e6, 2),
      format: 'in_person',
      eventType: 'Panel',
      venue: { name: 'Classroom 12, Old Campus' },
      registrationEnabled: true,
      capacity: 80,
      registrationDeadline: daysFromNow(-74, 23, 59),
      // PAST WITHOUT RECAP — the state easiest to forget to design for.
    },
  })

  await payload.create({
    collection: 'events',
    data: {
      title: 'Unannounced Speaker Session',
      slug: 'unannounced-speaker-session',
      // DRAFT — must never appear on the public site. If this shows up anywhere,
      // the published-only access rule has broken.
      _status: 'draft',
      description: lexical('Details to follow once the speaker confirms.'),
      startDateTime: e7,
      endDateTime: hoursAfter(e7, 2),
      format: 'in_person',
      eventType: 'Speaker series',
      venue: { name: 'To be confirmed' },
      registrationEnabled: true,
    },
  })

  // ── Registrations: fill VC Teardown to capacity ───────────────────────────
  const teardown = await payload.find({
    collection: 'events',
    where: { slug: { equals: 'vc-teardown-2026' } },
    limit: 1,
  })
  const teardownId = teardown.docs[0]?.id
  if (teardownId) {
    const attendees = [
      { name: 'Rahul Prasad', email: 'rahul.prasad@example.com', attendeeType: 'student' as const },
      { name: 'Ayesha Fernandes', email: 'ayesha.f@example.com', attendeeType: 'alumni' as const },
      { name: 'Gaurav Sinha', email: 'gaurav.sinha@example.com', attendeeType: 'external' as const },
    ]
    for (const a of attendees) {
      await payload.create({
        collection: 'registrations',
        data: {
          ...a,
          event: teardownId,
          eventSlug: 'vc-teardown-2026',
          batchOrOrganisation: 'PGP 2027',
          status: 'confirmed',
          consentGiven: true,
          consentText: 'I agree to EntreVC storing these details to manage my registration.',
          emailStatus: 'sent',
        },
      })
    }
    // One already on the waitlist, so that state has data behind it too.
    await payload.create({
      collection: 'registrations',
      data: {
        name: 'Neha Kapoor',
        email: 'neha.kapoor@example.com',
        attendeeType: 'student',
        event: teardownId,
        eventSlug: 'vc-teardown-2026',
        status: 'waitlisted',
        waitlistPosition: 1,
        consentGiven: true,
        consentText: 'I agree to EntreVC storing these details to manage my registration.',
        emailStatus: 'sent',
      },
    })
  }

  // ── Startups ──────────────────────────────────────────────────────────────
  console.log('Creating ventures…')
  const approval = {
    approved: true,
    approvedBy: 'Founder (seed data)',
    approvedAt: daysFromNow(-30),
    evidenceUrl: 'https://example.com/consent/seed',
  }

  await payload.create({
    collection: 'startups',
    data: {
      name: 'PayLane',
      slug: 'paylane',
      _status: 'published',
      featured: true,
      type: 'alumni',
      tagline: 'Reconciliation infrastructure for Indian SMB payments',
      description: lexical('PayLane helps small merchants reconcile payments received through different gateways. It brings settlement records into one workflow so teams can compare what was paid, what arrived, and what still needs attention. The venture focuses on making a routine finance task easier to review as payment volume grows.'),
      logo: mediaIds.paylane,
      sectors: ['Fintech', 'B2B SaaS'],
      stage: 'series_a',
      foundedYear: 2020,
      website: null,
      founders: [
        { name: 'Arjun Nair', batch: 'PGP 2018', contactConsent: true, linkedin: 'https://linkedin.com/in/example-arjun' },
        { name: 'Divya Sharma', batch: 'PGP 2018', contactConsent: false },
      ],
      listingApproval: approval,
    },
  })

  await payload.create({
    collection: 'startups',
    data: {
      name: 'KisanQuery',
      slug: 'kisanquery',
      _status: 'published',
      featured: true,
      type: 'alumni',
      tagline: 'Voice-first advisory for smallholder farmers, in nine languages',
      description: lexical('KisanQuery provides crop and farming guidance through IVR and WhatsApp in the farmer’s own language. Its voice-first approach is designed for people who may find a text-heavy app difficult to use. The service focuses on making everyday agronomy questions easier to ask and answer across nine languages.'),
      logo: mediaIds.kisanquery,
      sectors: ['Agritech', 'Rural'],
      stage: 'seed',
      foundedYear: 2019,
      website: null,
      // NEITHER founder consented — no contact detail may be published for this venture.
      founders: [
        { name: 'Sneha Patel', batch: 'PGP 2016', contactConsent: false },
        { name: 'Ravi Deshmukh', batch: 'PGP 2016', contactConsent: false },
      ],
      listingApproval: approval,
    },
  })

  await payload.create({
    collection: 'startups',
    data: {
      name: 'HostelKart',
      slug: 'hostelkart',
      _status: 'published',
      type: 'student',
      tagline: 'Ten-minute essentials delivery inside campus',
      description: lexical('HostelKart is a student-run delivery service for everyday essentials inside campus. It uses a small inventory close to the hostel blocks to make short-distance orders easier to fulfil. The venture started with direct requests from students and focuses on the practical needs of campus life.'),
      logo: mediaIds.hostelkart,
      sectors: ['Consumer', 'Commerce'],
      stage: 'bootstrapped',
      foundedYear: 2025,
      founders: [{ name: 'Ishaan Gupta', batch: 'PGP 2027', contactConsent: true, linkedin: 'https://linkedin.com/in/example-ishaan' }],
      listingApproval: approval,
    },
  })

  await payload.create({
    collection: 'startups',
    data: {
      name: 'Notewell',
      slug: 'notewell',
      _status: 'published',
      type: 'student',
      tagline: 'Lecture notes that summarise themselves',
      description: lexical('Notewell turns recorded lectures into structured notes, summaries, and flashcards. It is designed to help students revisit a class and find the ideas they need while preparing for discussion or revision. The concept is still at the idea stage.'),
      // No logo, no website — cards must handle both.
      sectors: ['Edtech'],
      stage: 'idea',
      founders: [{ name: 'Rhea Kulkarni', batch: 'PGP 2026', contactConsent: false }],
      listingApproval: approval,
    },
  })

  await payload.create({
    collection: 'startups',
    data: {
      name: 'Quietly Waiting',
      slug: 'quietly-waiting',
      // DRAFT + no approval. The beforeChange hook would refuse to publish this, and
      // it must never reach the public site. Its presence here is the test.
      _status: 'draft',
      type: 'alumni',
      tagline: 'A venture we have not yet been given permission to list',
      description: lexical('Awaiting written consent from the founder before publishing.'),
      sectors: ['Fintech'],
      founders: [{ name: 'Unnamed Founder', batch: 'PGP 2012', contactConsent: false }],
      listingApproval: { approved: false },
    },
  })

  // ── Resources, playbook, schemes ──────────────────────────────────────────
  console.log('Creating resources, playbook and schemes…')
  const resources = [
    { title: 'SaaS metrics that actually matter at seed', type: 'article', tags: ['metrics', 'fundraising'], url: 'https://example.com/saas-metrics' },
    { title: 'The Hard Thing About Hard Things', type: 'book', tags: ['leadership'], url: 'https://example.com/hard-things' },
    { title: 'Seed to Scale: the India episodes', type: 'podcast', tags: ['india'], url: 'https://example.com/seed-to-scale' },
    { title: 'India early-stage VC landscape', type: 'report', tags: ['research', 'india'], url: 'https://example.com/india-vc' },
    { title: 'Pitch deck teardown: what we cut and why', type: 'video', tags: ['pitching'], url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
    { title: 'Cap table template with dilution modelling', type: 'template', tags: ['fundraising', 'templates'], url: 'https://example.com/cap-table' },
  ] as const

  for (const r of resources) {
    await payload.create({
      collection: 'resources',
      data: {
        ...r,
        tags: [...r.tags],
        _status: 'published',
        linkType: 'external',
        description: 'Seeded resource for development.',
        publishedAt: daysFromNow(-Math.floor(Math.random() * 60)),
      },
    })
  }

  const chapters = [
    ['Before you start', 'Deciding whether the idea is worth eighteen months of your life.'],
    ['Finding a co-founder', 'The single highest-variance decision you will make.'],
    ['Your first ten customers', 'Why they will not come from a launch.'],
    ['Raising a round', 'What a seed investor is actually underwriting.'],
    ['Knowing when to stop', 'The chapter nobody wants and everybody eventually reads.'],
  ]
  for (const [i, [title, summary]] of chapters.entries()) {
    await payload.create({
      collection: 'playbook-chapters',
      data: {
        title,
        summary,
        order: i + 1,
        _status: 'published',
        body: lexical(`${summary} This chapter is seeded placeholder text for development.`),
      },
    })
  }

  const schemes = [
    { name: 'IIMA Ventures Incubation Programme', deadline: daysFromNow(30), order: 1 },
    { name: 'Seed Support Grant', deadline: null, order: 2 },
    { name: 'Women Founders Cohort', deadline: daysFromNow(-12), order: 3 }, // EXPIRED
    { name: 'Prototyping Lab Access', deadline: null, order: 4 },
    { name: 'Mentor in Residence', deadline: daysFromNow(60), order: 5 },
    { name: 'Market Access Programme', deadline: null, order: 6 },
  ]
  for (const s of schemes) {
    await payload.create({
      collection: 'schemes',
      data: {
        name: s.name,
        _status: 'published',
        displayOrder: s.order,
        deadline: s.deadline,
        summary: 'Seeded scheme description for development.',
        whoItIsFor: 'Student and alumni founders.',
        whatYouGet: 'Support, space and introductions.',
        eligibility: 'At least one IIMA-affiliated founder.',
        applicationLink: 'https://example.com/iimaventures/apply',
      },
    })
  }

  // ── Team ──────────────────────────────────────────────────────────────────
  console.log('Creating team…')
  const team = [
    ['Aarav Shetty', 'Club Lead', 'Leadership', '2026-27', 1, mediaIds.aarav],
    ['Ishita Bose', 'Co-Lead', 'Leadership', '2026-27', 2, mediaIds.ishita],
    ['Dev Agarwal', 'Events Cell Head', 'Events', '2026-27', 1, null],
    ['Maya Pillai', 'Events Core Member', 'Events', '2026-27', 2, null], // no photo
    ['Rehan Siddiqui', 'Startups Cell Head', 'Startups', '2026-27', 1, null],
    ['Zoya Khan', 'Partnerships Cell Head', 'Partnerships', '2026-27', 1, null],
    ['Siddharth Rane', 'Club Lead', 'Leadership', '2025-26', 1, null],
    ['Nidhi Chandra', 'Co-Lead', 'Leadership', '2025-26', 2, null],
    ['Harsh Vardhan', 'Events Cell Head', 'Events', '2025-26', 1, null],
    ['Ritika Sen', 'Startups Cell Head', 'Startups', '2025-26', 1, null],
  ] as const

  for (const [name, role, vertical, academicYear, displayOrder, photo] of team) {
    await payload.create({
      collection: 'team-members',
      data: {
        name,
        role,
        vertical,
        academicYear,
        displayOrder,
        batch: academicYear === '2026-27' ? 'PGP 2027' : 'PGP 2026',
        _status: 'published',
        ...(photo ? { photo } : {}),
      },
    })
  }

  // ── Enquiries and subscribers ─────────────────────────────────────────────
  const enquiries = [
    ['Priya Malhotra', 'sponsorship', 'We would like to sponsor EntreFair this year.'],
    ['Sameer Ali', 'speaking', 'I would be glad to speak at a fireside session.'],
    ['Ritu Bhatia', 'mentorship', 'Interested in mentoring student ventures in climate.'],
  ] as const
  for (const [name, category, message] of enquiries) {
    await payload.create({
      collection: 'submissions',
      data: {
        name,
        category,
        message,
        email: `${name.split(' ')[0]!.toLowerCase()}@example.com`,
        status: 'new',
        emailStatus: 'sent',
      },
    })
  }

  for (let i = 1; i <= 12; i += 1) {
    await payload.create({
      collection: 'subscribers',
      data: {
        email: `subscriber${i}@example.com`,
        source: i % 3 === 0 ? 'footer' : 'homepage',
        active: true,
        consentGiven: true,
        consentText: 'I agree to receive occasional emails from EntreVC.',
      },
    })
  }

  console.log('\nSeed complete.')
  console.log(`  Admin: ${adminEmail}`)
  console.log('  Includes a DRAFT event and an UNAPPROVED venture — neither may appear publicly.')
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('\nSeed failed:', err)
    process.exit(1)
  })
