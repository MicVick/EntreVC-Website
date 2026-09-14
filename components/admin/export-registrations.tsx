'use client'

import { useFormFields } from '@payloadcms/ui'

/**
 * Export links for the admin panel.
 *
 * The export exists in `app/api/registrations/csv`, but an export nobody can find is an
 * export nobody uses — and "we could not get the list out" is precisely how a team ends
 * up back on Google Forms. So the link is placed where the job actually starts.
 *
 * The important one is `ExportEventRegistrations`: on the morning of an event, somebody
 * opens that event and wants *its* attendee list. Reaching the registrations collection,
 * working out the right filter and then exporting is three steps too many at 8 a.m.
 *
 * These are plain anchors, not fetch calls: the browser handles the download, the
 * Payload session cookie goes with the request automatically, and there is nothing to
 * go wrong.
 */

const linkStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  textDecoration: 'underline',
  fontWeight: 600,
}

export function ExportEventRegistrations() {
  // Read the slug straight off the form, so the link is correct even before a save and
  // updates if the slug is edited.
  const slug = useFormFields(([fields]) => {
    const value = fields?.slug?.value
    return typeof value === 'string' ? value : ''
  })

  if (!slug) {
    return (
      <p className="field-description">
        Save this event once and a link to export its registrations will appear here.
      </p>
    )
  }

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <a href={`/api/registrations/csv?event=${encodeURIComponent(slug)}`} style={linkStyle}>
        ⤓ Export registrations for this event (CSV)
      </a>
      <p className="field-description" style={{ marginTop: '0.35rem' }}>
        Everyone signed up for this event, with the answers to any extra questions you
        asked as their own columns. Opens in Excel or Google Sheets.{' '}
        <a href={`/api/registrations/csv?event=${encodeURIComponent(slug)}&status=confirmed`}>
          Confirmed only
        </a>
        .
      </p>
    </div>
  )
}

export function ExportAllRegistrations() {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <a href="/api/registrations/csv" style={linkStyle}>
        ⤓ Export everything (CSV)
      </a>
      <p className="field-description" style={{ marginTop: '0.35rem' }}>
        Every registration across every event. For one event’s list, open the event itself
        and use the export link on its Registration tab.
      </p>
    </div>
  )
}
