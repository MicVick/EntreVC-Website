import { z } from 'zod'

import {
  attendeeTypeSchema,
  eventFormatSchema,
  imageRefSchema,
  isoDateSchema,
  richTextSchema,
  slugSchema,
} from './common'

// ── Sub-shapes ───────────────────────────────────────────────────────────────

export const speakerSchema = z.object({
  name: z.string().min(1),
  title: z.string().nullable(),
  org: z.string().nullable(),
  photo: imageRefSchema.nullable(),
  bio: richTextSchema.nullable(),
  linkedin: z.string().nullable(),
})
export type Speaker = z.infer<typeof speakerSchema>

export const agendaBlockSchema = z.object({
  /** Display string in IST, e.g. "18:30". Not a timestamp — agendas are relative. */
  time: z.string().min(1),
  title: z.string().min(1),
  description: z.string().nullable(),
  /** Names, matched against `speakers[].name` for display. */
  speakerNames: z.array(z.string()),
})
export type AgendaBlock = z.infer<typeof agendaBlockSchema>

export const venueSchema = z.object({
  name: z.string().min(1),
  address: z.string().nullable(),
  mapLink: z.string().nullable(),
})
export type Venue = z.infer<typeof venueSchema>

/** Field types an editor can add as a custom registration question. Max 3 per event. */
export const registrationFieldTypes = ['text', 'textarea', 'select', 'checkbox'] as const
export const registrationFieldTypeSchema = z.enum(registrationFieldTypes)
export type RegistrationFieldType = z.infer<typeof registrationFieldTypeSchema>

export const registrationFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: registrationFieldTypeSchema,
  required: z.boolean(),
  /** Only meaningful when `type === 'select'`. */
  options: z.array(z.string()),
})
export type RegistrationField = z.infer<typeof registrationFieldSchema>

export const eventRecapSchema = z.object({
  text: richTextSchema.nullable(),
  recordingUrl: z.string().nullable(),
  gallery: z.array(imageRefSchema),
})
export type EventRecap = z.infer<typeof eventRecapSchema>

// ── Event ────────────────────────────────────────────────────────────────────

export const eventSchema = z.object({
  id: z.string(),
  slug: slugSchema,
  title: z.string().min(1),
  subtitle: z.string().nullable(),
  description: richTextSchema,

  startDateTime: isoDateSchema,
  endDateTime: isoDateSchema,

  venue: venueSchema.nullable(),
  format: eventFormatSchema,
  /** Free-form category the club controls, e.g. "Speaker series". Drives the filter chips. */
  eventType: z.string().nullable(),

  heroImage: imageRefSchema.nullable(),

  speakers: z.array(speakerSchema),
  agenda: z.array(agendaBlockSchema),

  /** null means uncapped — the form never shows a capacity indicator. */
  capacity: z.number().int().positive().nullable(),
  registrationDeadline: isoDateSchema.nullable(),
  registrationFields: z.array(registrationFieldSchema).max(3),
  /** [ASSUMPTION] Defaults to false; per-event toggle. EXECUTION_PLAN.md §3, decision 4. */
  restrictToInstituteEmail: z.boolean(),
  /** When false the event never accepts registrations (e.g. an external event we list). */
  registrationEnabled: z.boolean(),

  recap: eventRecapSchema.nullable(),

  featured: z.boolean(),
  updatedAt: isoDateSchema,

  // ── Computed by lib/content, not stored ────────────────────────────────────
  // These exist so no page has to re-derive time logic and get it subtly wrong.
  /** `endDateTime` is in the past. Drives the Upcoming/Past split with no admin action. */
  isPast: z.boolean(),
  /** Past `registrationDeadline`, or registration disabled, or the event has ended. */
  isRegistrationClosed: z.boolean(),
  /** True when a recap exists and the event has ended — render recap mode, not the form. */
  hasRecap: z.boolean(),
})
export type Event = z.infer<typeof eventSchema>

// ── Registration input (public form → POST /api/register) ────────────────────

/**
 * The base shape. Custom per-event questions are validated separately against the
 * event's `registrationFields`, because their shape is only known at runtime.
 *
 * Agent B builds the form against this exact schema — do not redeclare it.
 */
export const registrationInputSchema = z.object({
  eventSlug: slugSchema,
  name: z.string().min(1, 'Please enter your name').max(120),
  email: z.string().min(1, 'Please enter your email').email('That does not look like an email'),
  phone: z.string().max(20).optional(),
  batchOrOrganisation: z.string().max(120).optional(),
  attendeeType: attendeeTypeSchema,
  customAnswers: z.record(z.string(), z.union([z.string(), z.boolean()])).default({}),
  consentGiven: z.literal(true, {
    message: 'We need your consent to store your registration',
  }),
  /** Honeypot — must stay empty. Rendered visually hidden and aria-hidden. */
  website: z.string().max(0).optional(),
})
export type RegistrationInput = z.infer<typeof registrationInputSchema>

export const registrationResultSchema = z.object({
  registrationId: z.string(),
  status: z.enum(['confirmed', 'waitlisted']),
  waitlistPosition: z.number().int().positive().nullable(),
  icsUrl: z.string(),
  addToCalendarUrl: z.string(),
})
export type RegistrationResult = z.infer<typeof registrationResultSchema>

/** Shape of GET /api/events/[slug]/availability. Advisory only — the POST is authority. */
export const availabilitySchema = z.object({
  capacity: z.number().int().positive().nullable(),
  registered: z.number().int().nonnegative(),
  waitlisted: z.number().int().nonnegative(),
  isFull: z.boolean(),
  isClosed: z.boolean(),
})
export type Availability = z.infer<typeof availabilitySchema>
