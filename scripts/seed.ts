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
import { getPayload } from 'payload'

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

async function main() {
  const { default: config } = await import('../payload.config')
  const payload = await getPayload({ config })

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
      data: { alt },
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
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      positioningStatement:
        'The entrepreneurship and venture capital community at IIM Ahmedabad — events, ventures and everything the club has learned, in one place.',
      intro: lexical(
        'EntreVC brings together students, alumni founders and investors around the work of building companies. We run speaker sessions and workshops through the year, maintain a directory of ventures started on this campus, and publish what we learn.',
      ),
      clubEmail: 'entrevc@iima.ac.in',
      campusAddress: 'Indian Institute of Management Ahmedabad, Vastrapur, Ahmedabad 380015, Gujarat',
      takedownEmail: 'ventures.entrevc@iima.ac.in',
      keyNumbers: {
        alumniNetwork: 1600,
        eventsHeldLabel: 'Events held',
        startupsListedLabel: 'Ventures listed',
        alumniNetworkLabel: 'Alumni network',
      },
      categoryRouting: [
        { category: 'general', email: 'entrevc@iima.ac.in', vertical: null },
        { category: 'event', email: 'events.entrevc@iima.ac.in', vertical: 'Events' },
        { category: 'startup_listing', email: 'ventures.entrevc@iima.ac.in', vertical: 'Ventures' },
        { category: 'sponsorship', email: 'sponsorship.entrevc@iima.ac.in', vertical: 'Outreach' },
        { category: 'speaking', email: 'events.entrevc@iima.ac.in', vertical: 'Events' },
        { category: 'mentorship', email: 'ventures.entrevc@iima.ac.in', vertical: 'Ventures' },
      ],
      roleContacts: [
        { role: 'Sponsorship', name: 'Zoya Khan', email: 'sponsorship.entrevc@iima.ac.in', description: 'Partnering with us on an event or the annual fair.' },
        { role: 'Speaker invitations', name: 'Dev Agarwal', email: 'events.entrevc@iima.ac.in', description: 'Inviting a speaker, or offering to speak.' },
        { role: 'Media', name: 'Omkar Joshi', email: 'media.entrevc@iima.ac.in', description: 'Press enquiries and coverage.' },
        { role: 'Startup listings', name: 'Rehan Siddiqui', email: 'ventures.entrevc@iima.ac.in', description: 'Adding, correcting or removing a venture.' },
      ],
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/company/example-entrevc', label: null },
        { platform: 'instagram', url: 'https://instagram.com/example_entrevc', label: null },
      ],
      verticals: [
        { name: 'Leadership', order: 1, description: 'Sets direction and carries the handover.' },
        { name: 'Events', order: 2, description: 'Speaker sessions, workshops and the annual fair.' },
        { name: 'Ventures', order: 3, description: 'The directory, mentor connections and IIMA Ventures liaison.' },
        { name: 'Outreach', order: 4, description: 'Sponsorship, media and the alumni network.' },
      ],
      iimaVentures: {
        overview: lexical(
          'IIMA Ventures is the incubation and entrepreneurship centre at IIM Ahmedabad. It runs incubation programmes, grants and lab facilities that any IIMA student can apply to.',
        ),
        highlight: 'Over 1,600 ventures supported since 2002.',
        contactName: 'IIMA Ventures Office',
        contactEmail: 'ventures@example.iima.ac.in',
        website: 'https://example.com/iimaventures',
      },
      playbook: {
        title: 'The EntreVC Startup Playbook',
        intro: lexical(
          'Written by the club, revised every year by the team that inherits it. Read it here, or take the PDF with you.',
        ),
      },
      youtubeChannelUrl: 'https://youtube.com/@example-entrevc',
    },
  })

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
      subtitle: 'Forty student ventures, one afternoon, the whole campus walking through',
      description: lexical('The annual showcase of ventures built on campus.'),
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
        text: lexical(
          'Forty ventures, just under nine hundred visitors, and four teams that walked away with their first cheque.',
        ),
        recordingUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
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
      description: lexical('Automates settlement reconciliation across payment gateways for small merchants.'),
      logo: mediaIds.paylane,
      sectors: ['Fintech', 'B2B SaaS'],
      stage: 'series_a',
      foundedYear: 2020,
      website: 'https://example.com/paylane',
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
      description: lexical('An IVR and WhatsApp service answering agronomy questions in the farmer’s own language.'),
      logo: mediaIds.kisanquery,
      sectors: ['Agritech', 'Rural'],
      stage: 'seed',
      foundedYear: 2019,
      website: 'https://example.com/kisanquery',
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
      description: lexical('Dark-store model serving hostel blocks, run entirely by students.'),
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
      description: lexical('Records lectures and produces structured summaries and flashcards.'),
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
    ['Dev Agarwal', 'Head of Events', 'Events', '2026-27', 1, null],
    ['Maya Pillai', 'Events Coordinator', 'Events', '2026-27', 2, null], // no photo
    ['Rehan Siddiqui', 'Head of Ventures', 'Ventures', '2026-27', 1, null],
    ['Zoya Khan', 'Head of Outreach', 'Outreach', '2026-27', 1, null],
    ['Siddharth Rane', 'Club Lead', 'Leadership', '2025-26', 1, null],
    ['Nidhi Chandra', 'Co-Lead', 'Leadership', '2025-26', 2, null],
    ['Harsh Vardhan', 'Head of Events', 'Events', '2025-26', 1, null],
    ['Ritika Sen', 'Head of Ventures', 'Ventures', '2025-26', 1, null],
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
