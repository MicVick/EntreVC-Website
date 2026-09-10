import type { Event } from '@/lib/schemas'

import { daysFromNow, hoursAfter, img, rt, squareImg } from './helpers'

/**
 * Six published events, chosen for the states Agent B has to render — not for volume.
 *
 *   1. at capacity                  → "Join waitlist"
 *   2. past its deadline            → "Registrations closed", no form
 *   3. plenty of room, 3 custom Qs  → the happy path, and the longest title
 *   4. uncapped, online             → no capacity indicator at all
 *   5. past, with recap             → recap mode: gallery + recording, no form
 *   6. past, no recap               → the bare past state, which is easy to forget
 *
 * A draft event exists in the seed but never here: lib/content returns published
 * content only, so if a draft appears on a page something is badly wrong.
 */

const e1Start = daysFromNow(9, 18, 30)
const e2Start = daysFromNow(5, 17, 0)
const e3Start = daysFromNow(21, 10, 0)
const e4Start = daysFromNow(14, 20, 0)
const e5Start = daysFromNow(-34, 9, 30)
const e6Start = daysFromNow(-72, 18, 0)

export const eventFixtures: Event[] = [
  {
    id: 'evt_teardown',
    slug: 'vc-teardown-2026',
    title: 'VC Teardown 2026',
    subtitle: 'Three funds, three theses, one term sheet pulled apart line by line',
    description: rt(
      '<p>Partners from three early-stage funds walk through a real term sheet clause by clause — liquidation preference, pro-rata, the board seat nobody reads carefully enough.</p><p>Bring a laptop. We work through a live cap table in the second half.</p>',
    ),
    startDateTime: e1Start,
    endDateTime: hoursAfter(e1Start, 2.5),
    venue: {
      name: 'Ravi J. Matthai Auditorium',
      address: 'IIM Ahmedabad, Vastrapur, Ahmedabad 380015',
      mapLink: 'https://maps.google.com/?q=IIM+Ahmedabad',
    },
    format: 'hybrid',
    eventType: 'Speaker series',
    heroImage: img('vc-teardown', 'Panellists on stage at a previous VC Teardown session'),
    speakers: [
      {
        name: 'Ananya Rao',
        title: 'Partner',
        org: 'Elevation Capital',
        photo: squareImg('ananya-rao', 'Portrait of Ananya Rao'),
        bio: rt('<p>Leads seed investments in fintech and B2B SaaS. Previously founded a payments company acquired in 2019.</p>'),
        linkedin: 'https://linkedin.com/in/example-ananya',
      },
      {
        name: 'Vikram Shah',
        title: 'Principal',
        org: 'Blume Ventures',
        photo: null,
        bio: rt('<p>Focuses on consumer and marketplace businesses across South Asia.</p>'),
        linkedin: null,
      },
    ],
    agenda: [
      { time: '18:30', title: 'Doors and coffee', description: null, speakerNames: [] },
      {
        time: '18:45',
        title: 'Anatomy of a term sheet',
        description: 'Clause-by-clause walkthrough of a real Series A document.',
        speakerNames: ['Ananya Rao'],
      },
      {
        time: '19:45',
        title: 'Live cap table teardown',
        description: 'Dilution across three rounds, modelled on screen.',
        speakerNames: ['Vikram Shah', 'Ananya Rao'],
      },
      { time: '20:30', title: 'Open floor', description: null, speakerNames: [] },
    ],
    // AT CAPACITY — the waitlist path.
    capacity: 60,
    registrationDeadline: daysFromNow(8, 23, 59),
    registrationFields: [],
    restrictToInstituteEmail: false,
    registrationEnabled: true,
    recap: null,
    featured: true,
    updatedAt: daysFromNow(-2),
    isPast: false,
    isRegistrationClosed: false,
    hasRecap: false,
  },

  {
    id: 'evt_fireside',
    slug: 'founder-fireside-march',
    title: 'Founder Fireside: building through a funding winter',
    subtitle: null,
    description: rt(
      '<p>An honest conversation about running a company for eighteen months without raising — what got cut, what held, and what the founder would do differently.</p>',
    ),
    startDateTime: e2Start,
    endDateTime: hoursAfter(e2Start, 1.5),
    venue: { name: 'Classroom 15, New Campus', address: null, mapLink: null },
    format: 'in_person',
    eventType: 'Fireside',
    heroImage: img('fireside', 'Speaker in conversation with students in a classroom'),
    speakers: [
      {
        name: 'Meera Krishnan',
        title: 'Founder & CEO',
        org: 'Loomcraft',
        photo: squareImg('meera', 'Portrait of Meera Krishnan'),
        bio: null,
        linkedin: null,
      },
    ],
    agenda: [],
    capacity: 90,
    // DEADLINE ALREADY PASSED — the form must not render at all.
    registrationDeadline: daysFromNow(-1, 23, 59),
    registrationFields: [],
    restrictToInstituteEmail: true,
    registrationEnabled: true,
    recap: null,
    featured: false,
    updatedAt: daysFromNow(-6),
    isPast: false,
    isRegistrationClosed: true,
    hasRecap: false,
  },

  {
    id: 'evt_buildweekend',
    // Deliberately punishing title — if a card or an OG image breaks on long text,
    // it breaks here rather than on real content the night before an event.
    title:
      'Build Weekend 2026: forty-eight hours from a blank repository to a working product demo, judged by founders and operators',
    slug: 'build-weekend-2026',
    subtitle: 'Teams of four. One weekend. A working demo on Sunday evening.',
    description: rt(
      '<p>Form a team on Friday evening, ship something real by Sunday. Mentors from the alumni network float between tables all weekend.</p><h2>What to bring</h2><ul><li>A laptop and a charger</li><li>An idea, or the willingness to join someone else\'s</li></ul>',
    ),
    startDateTime: e3Start,
    endDateTime: hoursAfter(e3Start, 56),
    venue: {
      name: 'Incubation Lab, IIMA Ventures',
      address: 'IIM Ahmedabad, Vastrapur, Ahmedabad 380015',
      mapLink: 'https://maps.google.com/?q=IIM+Ahmedabad',
    },
    format: 'in_person',
    eventType: 'Workshop',
    heroImage: img('build-weekend', 'Students working at laptops around a table late at night'),
    speakers: [],
    agenda: [
      { time: 'Fri 18:00', title: 'Team formation and pitches', description: null, speakerNames: [] },
      { time: 'Sat 09:00', title: 'Build day, mentors on the floor', description: null, speakerNames: [] },
      { time: 'Sun 17:00', title: 'Demos and judging', description: null, speakerNames: [] },
    ],
    capacity: 120,
    registrationDeadline: daysFromNow(18, 23, 59),
    // THREE CUSTOM QUESTIONS — the maximum, and one of each interesting type.
    registrationFields: [
      {
        id: 'team_status',
        label: 'Do you already have a team?',
        type: 'select',
        required: true,
        options: ['I have a full team', 'I have one or two teammates', 'I am looking for a team'],
      },
      {
        id: 'skills',
        label: 'What will you bring to a team?',
        type: 'textarea',
        required: false,
        options: [],
      },
      {
        id: 'dietary',
        label: 'I have dietary requirements (we will email you)',
        type: 'checkbox',
        required: false,
        options: [],
      },
    ],
    restrictToInstituteEmail: true,
    registrationEnabled: true,
    recap: null,
    featured: true,
    updatedAt: daysFromNow(-1),
    isPast: false,
    isRegistrationClosed: false,
    hasRecap: false,
  },

  {
    id: 'evt_termsheets',
    slug: 'term-sheets-decoded-online',
    title: 'Term Sheets Decoded',
    subtitle: 'An online primer, open to alumni and students alike',
    description: rt('<p>A ninety-minute online session covering the vocabulary of an early-stage round.</p>'),
    startDateTime: e4Start,
    endDateTime: hoursAfter(e4Start, 1.5),
    // Online events have no physical venue — every venue block must handle null.
    venue: null,
    format: 'online',
    eventType: 'Workshop',
    heroImage: null, // NO HERO IMAGE — cards and OG tags must degrade gracefully.
    speakers: [
      {
        name: 'Rohit Menon',
        title: 'General Counsel',
        org: 'Accel India',
        photo: null,
        bio: null,
        linkedin: null,
      },
    ],
    agenda: [],
    // UNCAPPED — no capacity indicator, no waitlist, ever.
    capacity: null,
    registrationDeadline: null,
    registrationFields: [],
    restrictToInstituteEmail: false,
    registrationEnabled: true,
    recap: null,
    featured: false,
    updatedAt: daysFromNow(-4),
    isPast: false,
    isRegistrationClosed: false,
    hasRecap: false,
  },

  {
    id: 'evt_entrefair',
    slug: 'entrefair-2025',
    title: 'EntreFair 2025',
    subtitle: 'Forty student ventures, one afternoon, the whole campus walking through',
    description: rt('<p>The annual showcase of ventures built on campus.</p>'),
    startDateTime: e5Start,
    endDateTime: hoursAfter(e5Start, 7),
    venue: { name: 'Louis Kahn Plaza', address: 'IIM Ahmedabad', mapLink: null },
    format: 'in_person',
    eventType: 'Flagship',
    heroImage: img('entrefair', 'Stalls and crowds at EntreFair 2025'),
    speakers: [],
    agenda: [],
    capacity: 400,
    registrationDeadline: daysFromNow(-36, 23, 59),
    registrationFields: [],
    restrictToInstituteEmail: false,
    registrationEnabled: true,
    // PAST WITH RECAP — recap mode: text, gallery, recording, and no form.
    recap: {
      text: rt(
        '<p>Forty ventures, just under nine hundred visitors, and four teams that walked away with their first cheque.</p><p>Full recording below; photographs from the day in the gallery.</p>',
      ),
      recordingUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      gallery: [
        img('entrefair-1', 'A founder demonstrating a prototype to two visitors'),
        img('entrefair-2', 'Wide shot of stalls across Louis Kahn Plaza'),
        img('entrefair-3', 'Judges in conversation at a venture stall'),
        img('entrefair-4', 'Crowd gathered for the closing announcements'),
      ],
    },
    featured: false,
    updatedAt: daysFromNow(-30),
    isPast: true,
    isRegistrationClosed: true,
    hasRecap: true,
  },

  {
    id: 'evt_alumnipanel',
    slug: 'alumni-founders-panel',
    title: 'Alumni Founders Panel',
    subtitle: null,
    description: rt('<p>Four alumni founders on what the first two years actually looked like.</p>'),
    startDateTime: e6Start,
    endDateTime: hoursAfter(e6Start, 2),
    venue: { name: 'Classroom 12, Old Campus', address: null, mapLink: null },
    format: 'in_person',
    eventType: 'Panel',
    heroImage: null,
    speakers: [],
    agenda: [],
    capacity: 80,
    registrationDeadline: daysFromNow(-74, 23, 59),
    registrationFields: [],
    restrictToInstituteEmail: false,
    registrationEnabled: true,
    // PAST WITHOUT RECAP — the state that is easiest to forget to design for.
    recap: null,
    featured: false,
    updatedAt: daysFromNow(-70),
    isPast: true,
    isRegistrationClosed: true,
    hasRecap: false,
  },
]
