import 'server-only'

import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'

/**
 * Outbound mail, through the institute SMTP relay.
 *
 * Deliverability is a rated High risk in the PRD, and the fix is mostly NOT code: the
 * sending domain needs SPF, DKIM and DMARC records or confirmations land in spam
 * regardless of what this file does. That is a DNS task for a human before launch.
 *
 * Two behaviours matter more than the transport:
 *   1. Sending NEVER blocks a response. Callers use `queueEmail`, which returns
 *      immediately — a student must not wait on an SMTP handshake to see "you're
 *      registered", and a slow relay must not turn into a failed registration.
 *   2. A send failure is recorded, never thrown away. The write has already been
 *      committed by the time we get here, so the outcome goes on the record and
 *      surfaces in the admin with a retry.
 */

export type EmailMessage = {
  to: string
  subject: string
  html: string
  text: string
  replyTo?: string
  attachments?: { filename: string; content: string; contentType: string }[]
}

export type EmailOutcome = 'sent' | 'failed'

let cached: Transporter | null | undefined

function transport(): Transporter | null {
  if (cached !== undefined) return cached

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host) {
    // No relay configured — development, or a VM where SMTP is not yet set up. We log
    // instead of failing so the whole site remains usable; the registration still
    // succeeds and the admin shows the email as pending.
    cached = null
    return cached
  }

  const port = Number(process.env.SMTP_PORT ?? 587)
  cached = nodemailer.createTransport({
    host,
    port,
    // 465 is implicit TLS; 587 upgrades via STARTTLS.
    secure: port === 465,
    ...(user && pass ? { auth: { user, pass } } : {}),
  })
  return cached
}

function fromAddress(): string {
  const name = process.env.SMTP_FROM_NAME || 'EntreVC, IIM Ahmedabad'
  const address = process.env.SMTP_FROM || 'no-reply@entrevc.in'
  return `"${name}" <${address}>`
}

/** Await this only where the caller genuinely needs the outcome (e.g. a manual resend). */
export async function sendEmail(message: EmailMessage): Promise<EmailOutcome> {
  const mailer = transport()

  if (!mailer) {
    console.info(
      `[email] No SMTP_HOST configured — not sending. to=${message.to} subject="${message.subject}"`,
    )
    return 'failed'
  }

  try {
    await mailer.sendMail({
      from: fromAddress(),
      to: message.to,
      subject: message.subject,
      html: message.html,
      text: message.text,
      ...(message.replyTo ? { replyTo: message.replyTo } : {}),
      ...(message.attachments ? { attachments: message.attachments } : {}),
    })
    return 'sent'
  } catch (error) {
    console.error(`[email] Send failed to=${message.to} subject="${message.subject}"`, error)
    return 'failed'
  }
}

/**
 * Fire-and-forget send, with the outcome handed to a callback.
 *
 * The returned promise is intentionally ignored by route handlers: PRD §7 requires the
 * endpoint to respond in under 500ms, and an SMTP round trip does not fit in that
 * budget. The callback records `emailStatus` on the document afterwards.
 */
export function queueEmail(
  message: EmailMessage,
  onSettled?: (outcome: EmailOutcome) => void | Promise<void>,
): void {
  void sendEmail(message)
    .then(async (outcome) => {
      await onSettled?.(outcome)
    })
    .catch((error) => {
      console.error('[email] Unexpected failure in queued send', error)
    })
}

/** True when a relay is configured — used by the admin to explain a pending status. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.SMTP_HOST)
}
