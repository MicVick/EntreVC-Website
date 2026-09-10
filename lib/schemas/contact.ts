import { z } from 'zod'

import { submissionCategorySchema, subscriberSourceSchema } from './common'

/**
 * Contact form input → POST /api/contact.
 * Agent B builds the contact form against this exact schema.
 */
export const submissionInputSchema = z.object({
  category: submissionCategorySchema,
  name: z.string().min(1, 'Please enter your name').max(120),
  email: z.string().min(1, 'Please enter your email').email('That does not look like an email'),
  batchOrOrganisation: z.string().max(120).optional(),
  message: z.string().min(10, 'Please tell us a little more').max(4000),
  consentGiven: z.literal(true, {
    message: 'We need your consent to reply to you',
  }),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional(),
})
export type SubmissionInput = z.infer<typeof submissionInputSchema>

/**
 * Mailing-list signup → POST /api/subscribe.
 * Email only. Double opt-in is explicitly deferred to Phase 2.
 */
export const subscribeInputSchema = z.object({
  email: z.string().min(1, 'Please enter your email').email('That does not look like an email'),
  source: subscriberSourceSchema,
  consentGiven: z.literal(true, {
    message: 'We need your consent to email you',
  }),
  /** Honeypot — must stay empty. */
  website: z.string().max(0).optional(),
})
export type SubscribeInput = z.infer<typeof subscribeInputSchema>
