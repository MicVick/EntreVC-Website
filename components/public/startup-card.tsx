import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Building2, ExternalLink } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/components/ui/cn'
import { startupStageLabels, startupTypeLabels, type Startup } from '@/lib/schemas'

type StartupCardProps = {
  startup: Startup
  className?: string
  priority?: boolean
}

export function StartupCard({ startup, className, priority = false }: StartupCardProps) {
  return (
    <article className={cn('group relative flex min-w-0 flex-col rounded-lg border border-border bg-surface p-5 transition duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-md sm:p-6', className)}>
      <div className="flex items-start justify-between gap-5">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-fg p-2 text-bg">
          {startup.logo ? (
            <Image
              src={startup.logo.url}
              alt={startup.logo.alt}
              width={startup.logo.width}
              height={startup.logo.height}
              sizes="64px"
              priority={priority}
              className="h-full w-full object-contain"
            />
          ) : (
            <Building2 aria-hidden="true" className="size-7" />
          )}
        </div>
        <span className="flex size-10 items-center justify-center rounded-full border border-border bg-surface-2 transition group-hover:border-brand group-hover:bg-brand group-hover:text-brand-fg">
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </span>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        <Badge variant="brand">{startupTypeLabels[startup.type]}</Badge>
        {startup.stage ? <Badge>{startupStageLabels[startup.stage]}</Badge> : null}
      </div>

      <h3 className="display-type mt-5 break-words text-2xl font-semibold leading-tight">
        <Link href={`/startups/${startup.slug}`} className="transition hover:text-accent">
          {startup.name}
        </Link>
      </h3>
      <p className="mt-3 line-clamp-3 text-sm leading-6 text-fg-muted">{startup.tagline}</p>

      {startup.sectors.length ? (
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.12em] text-fg-subtle">
          {startup.sectors.join(' · ')}
        </p>
      ) : null}

      <div className="mt-auto border-t border-border pt-5 text-sm leading-6 text-fg-muted">
        {startup.founders.length ? (
          <p>
            {startup.founders.map((founder, index) => (
              <span key={`${startup.id}-${founder.name}`}>
                {index > 0 ? ', ' : null}
                {founder.linkedin ? (
                  <a href={founder.linkedin} target="_blank" rel="noreferrer" className="relative z-10 underline decoration-border-strong underline-offset-4 transition hover:text-accent">
                    {founder.name}
                  </a>
                ) : founder.name}
              </span>
            ))}
            {startup.batches.length ? <span className="text-fg-subtle"> · {startup.batches.join(', ')}</span> : null}
          </p>
        ) : (
          <p>Founder details coming soon</p>
        )}
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 font-semibold text-fg">
          <Link href={`/startups/${startup.slug}`} className="relative z-10 transition hover:text-accent">View profile</Link>
          {startup.website ? (
            <a href={startup.website} target="_blank" rel="noreferrer" className="relative z-10 inline-flex items-center gap-1.5 transition hover:text-accent">
              Website <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          ) : null}
          {startup.linkedin ? (
            <a href={startup.linkedin} target="_blank" rel="noreferrer" className="relative z-10 inline-flex items-center gap-1.5 transition hover:text-accent">
              LinkedIn <ExternalLink aria-hidden="true" className="size-3.5" />
            </a>
          ) : null}
        </div>
      </div>
    </article>
  )
}
