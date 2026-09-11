import { getEventBySlug } from '@/lib/content'
import { buildIcs } from '@/lib/ics'

/**
 * GET /api/ics/[slug] — the calendar file for an event.
 *
 * Served as a download so a browser hands it to the calendar app rather than showing
 * it as text. Linked from the inline success state as well as attached to the
 * confirmation email, because a good share of people never open the email.
 */
export async function GET(_request: Request, { params }: RouteContext<'/api/ics/[slug]'>) {
  const { slug } = await params

  const event = await getEventBySlug(slug)
  if (!event) return new Response('Not found', { status: 404 })

  const ics = buildIcs(event)
  if (!ics) return new Response('Calendar file unavailable', { status: 500 })

  return new Response(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}.ics"`,
      'Cache-Control': 'public, max-age=300',
    },
  })
}
