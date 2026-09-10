const ALWAYS_REFRESH = ['/'] as const

const COLLECTION_PATHS: Readonly<Record<string, readonly string[]>> = {
  events: ['/', '/events'],
  startups: ['/', '/startups'],
  resources: ['/', '/resources'],
  'playbook-chapters': ['/resources', '/resources/playbook'],
  schemes: ['/iima-ventures'],
  'team-members': ['/team'],
  'site-settings': [
    '/',
    '/startups',
    '/iima-ventures',
    '/resources',
    '/resources/playbook',
    '/team',
    '/contact',
  ],
}

/**
 * Every public path affected by a Payload content change.
 *
 * Keep this pure and exhaustive: Payload hooks call it after publish/delete. Unknown
 * collections conservatively refresh the homepage, while entries with public detail
 * routes also refresh their exact URL.
 */
export function pathsFor(collection: string, slug?: string): string[] {
  const paths = new Set(COLLECTION_PATHS[collection] ?? ALWAYS_REFRESH)

  if (slug && collection === 'events') paths.add(`/events/${slug}`)
  if (slug && collection === 'startups') paths.add(`/startups/${slug}`)

  return [...paths]
}
