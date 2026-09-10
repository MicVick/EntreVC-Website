import { z } from 'zod'

/**
 * Shared vocabulary for every content type.
 *
 * These schemas are the type source for BOTH agents. Agent B imports the inferred
 * types rather than redeclaring content shapes (CONTRACT.md §4). Changing anything
 * here is an interface change: propose it in DECISIONS.md first.
 */

/** All timestamps are stored UTC and displayed in IST. */
export const IST_TIMEZONE = 'Asia/Kolkata'

// ── Primitives ───────────────────────────────────────────────────────────────

/** Lowercase, hyphen-separated, ASCII. Generated from the title, unique per collection. */
export const slugSchema = z
  .string()
  .min(1)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase words separated by hyphens')

/** ISO 8601, always UTC. Never a Date object — those do not survive the RSC boundary. */
export const isoDateSchema = z.string().min(1)

/**
 * An image, always with the dimensions `next/image` needs so no page has to guess
 * an aspect ratio, and always with alt text — `alt` is a required field on upload,
 * which is how the accessibility requirement becomes impossible to skip.
 */
export const imageRefSchema = z.object({
  url: z.string().min(1),
  alt: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
})
export type ImageRef = z.infer<typeof imageRefSchema>

/**
 * Rich text reaches the public site already converted and sanitised.
 *
 * `html` is rendered from Lexical through a fixed converter set (p, h2, h3, ul, ol,
 * li, strong, em, a, blockquote, hr, code — nothing else) and is safe to place with
 * dangerouslySetInnerHTML inside a prose wrapper. `plainText` exists for meta
 * descriptions, OG tags, search snippets and the plaintext half of emails.
 *
 * Amendment to CONTRACT.md §9: the contract said Agent B would render Lexical JSON
 * through a component map. Converting server-side instead keeps the Lexical
 * dependency out of the public bundle entirely and hands B a string.
 */
export const richTextSchema = z.object({
  html: z.string(),
  plainText: z.string(),
})
export type RichText = z.infer<typeof richTextSchema>

export const emptyRichText: RichText = { html: '', plainText: '' }

// ── Enums (CONTRACT.md §3 — these exact string values, everywhere) ───────────

export const eventFormats = ['in_person', 'online', 'hybrid'] as const
export const eventFormatSchema = z.enum(eventFormats)
export type EventFormat = z.infer<typeof eventFormatSchema>

export const attendeeTypes = ['student', 'alumni', 'external'] as const
export const attendeeTypeSchema = z.enum(attendeeTypes)
export type AttendeeType = z.infer<typeof attendeeTypeSchema>

export const registrationStatuses = ['confirmed', 'waitlisted', 'cancelled'] as const
export const registrationStatusSchema = z.enum(registrationStatuses)
export type RegistrationStatus = z.infer<typeof registrationStatusSchema>

export const startupTypes = ['alumni', 'student'] as const
export const startupTypeSchema = z.enum(startupTypes)
export type StartupType = z.infer<typeof startupTypeSchema>

export const resourceTypes = ['article', 'book', 'podcast', 'report', 'video', 'template'] as const
export const resourceTypeSchema = z.enum(resourceTypes)
export type ResourceType = z.infer<typeof resourceTypeSchema>

export const submissionCategories = [
  'general',
  'event',
  'startup_listing',
  'sponsorship',
  'speaking',
  'mentorship',
] as const
export const submissionCategorySchema = z.enum(submissionCategories)
export type SubmissionCategory = z.infer<typeof submissionCategorySchema>

export const userRoles = ['admin', 'editor'] as const
export const userRoleSchema = z.enum(userRoles)
export type UserRole = z.infer<typeof userRoleSchema>

export const subscriberSources = ['homepage', 'footer', 'event', 'contact', 'import'] as const
export const subscriberSourceSchema = z.enum(subscriberSources)
export type SubscriberSource = z.infer<typeof subscriberSourceSchema>

// ── Display labels ───────────────────────────────────────────────────────────

/**
 * Human-readable labels for enum values. Kept beside the enums so the admin, the
 * public site and exported CSVs never drift into three different wordings.
 */
export const eventFormatLabels: Record<EventFormat, string> = {
  in_person: 'In person',
  online: 'Online',
  hybrid: 'Hybrid',
}

export const attendeeTypeLabels: Record<AttendeeType, string> = {
  student: 'Student',
  alumni: 'Alumni',
  external: 'External',
}

export const resourceTypeLabels: Record<ResourceType, string> = {
  article: 'Article',
  book: 'Book',
  podcast: 'Podcast',
  report: 'Report',
  video: 'Video',
  template: 'Template',
}

export const submissionCategoryLabels: Record<SubmissionCategory, string> = {
  general: 'General enquiry',
  event: 'Events',
  startup_listing: 'Startup listing',
  sponsorship: 'Sponsorship',
  speaking: 'Speaking invitation',
  mentorship: 'Mentorship',
}

export const startupTypeLabels: Record<StartupType, string> = {
  alumni: 'Alumni venture',
  student: 'Student venture',
}

// ── Shared shapes ────────────────────────────────────────────────────────────

/** Who last touched a document. Displayed in the admin, never on the public site. */
export const auditSchema = z.object({
  updatedAt: isoDateSchema,
  createdAt: isoDateSchema,
})
export type Audit = z.infer<typeof auditSchema>

export type Paged<T> = {
  items: T[]
  nextCursor: string | null
}
