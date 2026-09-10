import Image from 'next/image'
import { ArrowUpRight, BookOpen, ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/components/ui/cn'
import { resourceTypeLabels, type Resource } from '@/lib/schemas'

type ResourceCardProps = {
  resource: Resource
  className?: string
  featured?: boolean
}

export function ResourceCard({ resource, className, featured = false }: ResourceCardProps) {
  return (
    <a
      href={resource.url}
      target={resource.isExternal ? '_blank' : undefined}
      rel={resource.isExternal ? 'noreferrer' : undefined}
      className={cn(
        'group grid min-w-0 overflow-hidden rounded-lg border border-border bg-surface transition duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-md',
        featured && 'md:grid-cols-[0.85fr_1.15fr]',
        className,
      )}
    >
      <div className={cn('relative overflow-hidden bg-surface-2', featured ? 'min-h-60' : 'aspect-[16/10]')}>
        {resource.coverImage ? (
          <Image
            src={resource.coverImage.url}
            alt={resource.coverImage.alt}
            width={resource.coverImage.width}
            height={resource.coverImage.height}
            sizes={featured ? '(min-width: 768px) 42vw, 100vw' : '(min-width: 1024px) 32vw, (min-width: 640px) 50vw, 100vw'}
            className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-[1.035] group-hover:opacity-100"
          />
        ) : (
          <div className="surface-grid flex h-full min-h-48 items-center justify-center" aria-hidden="true">
            <BookOpen className="size-12 text-border-strong" strokeWidth={1.25} />
          </div>
        )}
      </div>

      <div className="flex min-w-0 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <Badge variant="brand">{resourceTypeLabels[resource.type]}</Badge>
          {resource.isExternal ? <ExternalLink aria-label="Opens in a new tab" className="size-4 text-fg-subtle" /> : null}
        </div>
        <h3 className={cn('display-type mt-5 break-words font-semibold leading-tight', featured ? 'text-3xl sm:text-4xl' : 'text-2xl')}>
          {resource.title}
        </h3>
        {resource.description ? (
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-fg-muted sm:text-base">{resource.description}</p>
        ) : null}
        <div className="mt-auto flex items-end justify-between gap-4 pt-7">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-fg-subtle">
            {resource.author ?? 'Curated by EntreVC'}
          </p>
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-border bg-surface-2 transition group-hover:border-brand group-hover:bg-brand group-hover:text-brand-fg">
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </span>
        </div>
      </div>
    </a>
  )
}
