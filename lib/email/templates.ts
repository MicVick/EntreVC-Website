import 'server-only'

import type { EmailMessage } from './send'

/**
 * Transactional email templates.
 *
 * Hand-written, table-based, inline-styled HTML. `react-email` was in the frozen
 * dependency list but is deprecated at every published version (amendment A-003), and
 * this is what mail clients actually need anyway — Outlook still lays out with tables
 * and ignores most of a stylesheet.
 *
 * Every template ships a plaintext alternative. That is not politeness: a
 * multipart/alternative message is markedly less likely to be classed as spam, which
 * is the PRD's highest-likelihood risk on this feature.
 */

const BRAND = '#BD282E' // white text only on this — 5.98:1, verified in brand/colors.md
const INK = '#141110'
const MUTED = '#575654'
const BORDER = '#e5e3e0'

function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '')
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

type LayoutOptions = {
  heading: string
  intro: string
  /** Rows of label/value shown as a details block. */
  details?: { label: string; value: string }[]
  cta?: { label: string; url: string }
  outro?: string
}

function layout({ heading, intro, details = [], cta, outro }: LayoutOptions): string {
  const detailRows = details
    .map(
      ({ label, value }) => `
        <tr>
          <td style="padding:6px 16px 6px 0;color:${MUTED};font-size:14px;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
          <td style="padding:6px 0;color:${INK};font-size:14px;font-weight:600;">${escapeHtml(value)}</td>
        </tr>`,
    )
    .join('')

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(heading)}</title></head>
<body style="margin:0;padding:0;background:#f6f5f3;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f6f5f3;padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid ${BORDER};border-radius:10px;overflow:hidden;">
        <tr><td style="height:4px;background:${BRAND};font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:28px 28px 8px;">
          <p style="margin:0 0 20px;font:600 13px/1 system-ui,-apple-system,'Segoe UI',sans-serif;letter-spacing:.08em;text-transform:uppercase;color:${MUTED};">EntreVC &middot; IIM Ahmedabad</p>
          <h1 style="margin:0 0 12px;font:600 22px/1.3 system-ui,-apple-system,'Segoe UI',sans-serif;color:${INK};">${escapeHtml(heading)}</h1>
          <p style="margin:0;font:400 15px/1.6 system-ui,-apple-system,'Segoe UI',sans-serif;color:${INK};">${escapeHtml(intro)}</p>
        </td></tr>
        ${
          detailRows
            ? `<tr><td style="padding:20px 28px 4px;">
                 <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-top:1px solid ${BORDER};padding-top:12px;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;">${detailRows}</table>
               </td></tr>`
            : ''
        }
        ${
          cta
            ? `<tr><td style="padding:24px 28px 4px;">
                 <a href="${cta.url}" style="display:inline-block;background:${BRAND};color:#ffffff;text-decoration:none;font:600 15px/1 system-ui,-apple-system,'Segoe UI',sans-serif;padding:13px 22px;border-radius:6px;">${escapeHtml(cta.label)}</a>
               </td></tr>`
            : ''
        }
        ${
          outro
            ? `<tr><td style="padding:20px 28px 0;"><p style="margin:0;font:400 14px/1.6 system-ui,-apple-system,'Segoe UI',sans-serif;color:${MUTED};">${escapeHtml(outro)}</p></td></tr>`
            : ''
        }
        <tr><td style="padding:28px;">
          <p style="margin:0;border-top:1px solid ${BORDER};padding-top:16px;font:400 12px/1.6 system-ui,-apple-system,'Segoe UI',sans-serif;color:${MUTED};">
            Entrepreneurship &amp; Venture Capital Club, IIM Ahmedabad<br>
            <a href="${siteUrl()}" style="color:${MUTED};">${siteUrl().replace(/^https?:\/\//, '')}</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function plaintext({ heading, intro, details = [], cta, outro }: LayoutOptions): string {
  const lines = [heading, '', intro]
  if (details.length) {
    lines.push('')
    for (const { label, value } of details) lines.push(`${label}: ${value}`)
  }
  if (cta) lines.push('', `${cta.label}: ${cta.url}`)
  if (outro) lines.push('', outro)
  lines.push('', '—', 'EntreVC, IIM Ahmedabad', siteUrl())
  return lines.join('\n')
}

function build(to: string, subject: string, options: LayoutOptions, extra?: Partial<EmailMessage>): EmailMessage {
  return {
    to,
    subject,
    html: layout(options),
    text: plaintext(options),
    ...extra,
  }
}

// ── Registration ─────────────────────────────────────────────────────────────

export type EventSummary = {
  slug: string
  title: string
  whenLabel: string
  venueLabel: string | null
  formatLabel: string
  onlineJoinUrl?: string | null
}

export function registrationConfirmation(args: {
  to: string
  name: string
  event: EventSummary
  icsContent: string | null
}): EmailMessage {
  const details = [
    { label: 'Event', value: args.event.title },
    { label: 'When', value: args.event.whenLabel },
    ...(args.event.venueLabel ? [{ label: 'Where', value: args.event.venueLabel }] : []),
    { label: 'Format', value: args.event.formatLabel },
    ...(args.event.onlineJoinUrl ? [{ label: 'Join link', value: args.event.onlineJoinUrl }] : []),
  ]

  return build(
    args.to,
    `You're registered — ${args.event.title}`,
    {
      heading: "You're registered",
      intro: `Thanks ${args.name}, we've got you down for this one. The calendar file is attached, so it can go straight into your diary.`,
      details,
      cta: { label: 'View the event', url: `${siteUrl()}/events/${args.event.slug}` },
      outro: 'If your plans change, reply to this email and let us know so we can free the place.',
    },
    args.icsContent
      ? {
          attachments: [
            { filename: `${args.event.slug}.ics`, content: args.icsContent, contentType: 'text/calendar' },
          ],
        }
      : undefined,
  )
}

export function waitlistConfirmation(args: {
  to: string
  name: string
  event: EventSummary
  position: number
}): EmailMessage {
  return build(args.to, `You're on the waitlist — ${args.event.title}`, {
    heading: "You're on the waitlist",
    intro: `Thanks ${args.name}. This event is at capacity, so we've put you on the waitlist rather than turning you away.`,
    details: [
      { label: 'Event', value: args.event.title },
      { label: 'When', value: args.event.whenLabel },
      { label: 'Your position', value: `#${args.position}` },
    ],
    cta: { label: 'View the event', url: `${siteUrl()}/events/${args.event.slug}` },
    // Being explicit about the mechanism prevents the "am I in or not?" email that
    // otherwise lands in the club's inbox for every waitlisted person.
    outro:
      'If someone drops out, the team promotes people from the waitlist in order and you will get a separate email confirming your place. No calendar file yet — we only send that once you are confirmed.',
  })
}

export function waitlistPromotion(args: {
  to: string
  name: string
  event: EventSummary
  icsContent: string | null
}): EmailMessage {
  return build(
    args.to,
    `A place has opened up — ${args.event.title}`,
    {
      heading: "You're in",
      intro: `Good news ${args.name} — a place opened up and you are now confirmed for this event.`,
      details: [
        { label: 'Event', value: args.event.title },
        { label: 'When', value: args.event.whenLabel },
        ...(args.event.venueLabel ? [{ label: 'Where', value: args.event.venueLabel }] : []),
      ],
      cta: { label: 'View the event', url: `${siteUrl()}/events/${args.event.slug}` },
      outro: 'The calendar file is attached. If you can no longer make it, reply and tell us so the place goes to someone else.',
    },
    args.icsContent
      ? {
          attachments: [
            { filename: `${args.event.slug}.ics`, content: args.icsContent, contentType: 'text/calendar' },
          ],
        }
      : undefined,
  )
}

// ── Contact ──────────────────────────────────────────────────────────────────

export function contactAcknowledgement(args: {
  to: string
  name: string
  categoryLabel: string
}): EmailMessage {
  return build(args.to, 'We got your message — EntreVC', {
    heading: 'Thanks, we have your message',
    intro: `Hi ${args.name}, this is an automatic note to confirm your message reached us and has gone to the right part of the club.`,
    details: [{ label: 'Topic', value: args.categoryLabel }],
    outro: 'Someone will reply personally. You do not need to send it again.',
  })
}

export function contactRouting(args: {
  to: string
  fromName: string
  fromEmail: string
  categoryLabel: string
  batchOrOrganisation: string | null
  message: string
}): EmailMessage {
  return build(
    args.to,
    `[${args.categoryLabel}] ${args.fromName}`,
    {
      heading: `New ${args.categoryLabel.toLowerCase()} enquiry`,
      intro: args.message,
      details: [
        { label: 'From', value: args.fromName },
        { label: 'Email', value: args.fromEmail },
        ...(args.batchOrOrganisation
          ? [{ label: 'Batch / org', value: args.batchOrOrganisation }]
          : []),
      ],
      cta: { label: 'Open the inbox', url: `${siteUrl()}/admin/collections/submissions` },
      outro: 'Reply directly to this email to answer them, or mark it resolved in the admin.',
    },
    // So hitting reply in a mail client answers the person, not the no-reply address.
    { replyTo: args.fromEmail },
  )
}
