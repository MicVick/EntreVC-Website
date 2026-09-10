import type { MetadataRoute } from 'next'

import { getAllEventSlugs, getAllStartupSlugs, getTeamYears } from '@/lib/content'
import { absoluteUrl } from '@/lib/seo'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [eventSlugs, startupSlugs, teamYears] = await Promise.all([
    getAllEventSlugs(),
    getAllStartupSlugs(),
    getTeamYears(),
  ])

  const staticRoutes = [
    { path: '/', priority: 1, changeFrequency: 'weekly' as const },
    { path: '/events', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/startups', priority: 0.9, changeFrequency: 'weekly' as const },
    { path: '/resources', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/resources/playbook', priority: 0.8, changeFrequency: 'monthly' as const },
    { path: '/iima-ventures', priority: 0.8, changeFrequency: 'weekly' as const },
    { path: '/team', priority: 0.7, changeFrequency: 'monthly' as const },
    { path: '/contact', priority: 0.7, changeFrequency: 'yearly' as const },
  ]

  return [
    ...staticRoutes.map((route) => ({
      url: absoluteUrl(route.path),
      priority: route.priority,
      changeFrequency: route.changeFrequency,
    })),
    ...eventSlugs.map((slug) => ({
      url: absoluteUrl(`/events/${slug}`),
      priority: 0.8,
      changeFrequency: 'weekly' as const,
    })),
    ...startupSlugs.map((slug) => ({
      url: absoluteUrl(`/startups/${slug}`),
      priority: 0.7,
      changeFrequency: 'monthly' as const,
    })),
    ...teamYears.slice(1).map((year) => ({
      url: absoluteUrl(`/team/${year}`),
      priority: 0.5,
      changeFrequency: 'yearly' as const,
    })),
  ]
}
