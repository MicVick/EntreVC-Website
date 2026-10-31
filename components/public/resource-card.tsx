import { ArrowUpRightIcon as ArrowUpRight, ExternalLinkIcon as ExternalLink } from '@/components/ui/icons'

import { ContentImage } from '@/components/public/content-image'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/components/ui/cn'
import { publicExternalUrl } from '@/lib/public-link'
import { resourceTypeLabels, type Resource } from '@/lib/schemas'

type ResourceCardProps = {
  resource: Resource
  className?: string
  featured?: boolean
}

export function ResourceCard({ resource, className, featured = false }: ResourceCardProps) {
  const destination = resource.isExternal ? publicExternalUrl(resource.url) : resource.url
  return (
    <a
      href={destination ?? undefined}
      target={destination && resource.isExternal ? '_blank' : undefined}
      rel={destination && resource.isExternal ? 'noopener noreferrer' : undefined}
      aria-disabled={destination ? undefined : true}
      className={cn(
        'surface-card spotlight group grid min-w-0 overflow-hidden rounded-xl p-2 transition duration-500',
        destination && 'hover:-translate-y-1 hover:border-fg/20',
        featured && 'md:grid-cols-[0.85fr_1.15fr]',
        className,
      )}
    >
      <div className={cn('relative overflow-hidden rounded-lg bg-surface-2', featured ? 'min-h-56' : 'aspect-[16/10]')}>
        <ContentImage image={resource.coverImage} kind="resource" label={resource.title} sizes={featured ? '(min-width: 768px) 42vw, 100vw' : '(min-width: 1024px) 30vw, 100vw'} className={featured ? 'absolute inset-0' : undefined} />
        <div className="absolute left-3 top-3">
          <Badge>{resourceTypeLabels[resource.type]}</Badge>
        </div>
      </div>

      <div className="flex min-w-0 flex-col px-4 pb-4 pt-5 sm:px-5">
        <div className="flex items-start justify-between gap-4">
          <h3 className={cn('display-type break-words', featured ? 'text-3xl' : 'text-[1.35rem]')}>
            {resource.title}
          </h3>
          {destination && resource.isExternal ? <ExternalLink aria-label="Opens in a new tab" className="mt-1.5 size-4 shrink-0 text-fg-subtle" /> : null}
        </div>
        {resource.description ? (
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-fg-muted">{resource.description}</p>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-4 pt-6">
          <p className="meta-label text-fg-subtle">{resource.author ?? 'Picked by EntreVC'}</p>
          {destination ? (
            <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full border border-fg/15 text-fg transition duration-300 group-hover:rotate-45 group-hover:border-brand group-hover:bg-brand group-hover:text-brand-fg">
              <ArrowUpRight className="size-4" />
            </span>
          ) : (
            <span className="text-xs font-medium text-fg-subtle">Link coming soon</span>
          )}
        </div>
      </div>
    </a>
  )
}
