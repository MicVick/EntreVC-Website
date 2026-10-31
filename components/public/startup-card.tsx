import Link from 'next/link'
import { ArrowUpRightIcon as ArrowUpRight } from '@/components/ui/icons'

import { ContentImage } from '@/components/public/content-image'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/components/ui/cn'
import { publicExternalUrl } from '@/lib/public-link'
import { startupStageLabels, startupTypeLabels, type Startup } from '@/lib/schemas'

type StartupCardProps = {
  startup: Startup
  className?: string
  priority?: boolean
}

export function StartupCard({ startup, className, priority = false }: StartupCardProps) {
  const website = publicExternalUrl(startup.website)
  const linkedin = publicExternalUrl(startup.linkedin)
  const founders = startup.founders.map((founder) => founder.name).join(', ')

  return (
    <article
      className={cn(
        'surface-card spotlight group relative flex min-w-0 flex-col rounded-xl p-6 transition duration-500 hover:-translate-y-1 hover:border-fg/20 focus-within:border-accent sm:p-7',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-bg ring-1 ring-fg/15 ring-offset-4 ring-offset-surface transition duration-500 group-hover:ring-accent/60">
          <ContentImage image={startup.logo} kind="startup" label={startup.name} sizes="64px" priority={priority} className="object-contain" />
        </div>
        <div className="flex flex-wrap justify-end gap-1.5">
          <Badge>{startupTypeLabels[startup.type]}</Badge>
          {startup.stage ? <Badge variant="outline">{startupStageLabels[startup.stage]}</Badge> : null}
        </div>
      </div>

      <h3 className="display-type mt-7 break-words text-[1.75rem]">
        <Link href={`/startups/${startup.slug}`} className="after:absolute after:inset-0 after:z-[2] focus-visible:outline-none">
          {startup.name}
        </Link>
      </h3>
      <p className="mt-2 line-clamp-3 text-[0.95rem] leading-7 text-fg-muted">{startup.tagline}</p>

      {startup.sectors.length ? (
        <ul className="mt-5 flex flex-wrap gap-1.5" aria-label="Sectors">
          {startup.sectors.map((sector) => (
            <li key={sector} className="rounded-full bg-fg/[0.06] px-3 py-1 text-xs text-fg-muted">
              {sector}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-auto pt-7">
        <p className="text-sm leading-6 text-fg-muted">
          {founders || 'Founder details coming soon'}
          {startup.batches.length ? <span className="text-fg-subtle"> · {startup.batches.join(', ')}</span> : null}
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm font-semibold">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {website ? (
              <a href={website} target="_blank" rel="noopener noreferrer" className="relative z-[3] text-fg-muted underline decoration-fg/25 underline-offset-4 transition hover:text-accent">
                Website
              </a>
            ) : null}
            {linkedin ? (
              <a href={linkedin} target="_blank" rel="noopener noreferrer" className="relative z-[3] text-fg-muted underline decoration-fg/25 underline-offset-4 transition hover:text-accent">
                LinkedIn
              </a>
            ) : null}
          </div>
          <span className="inline-flex items-center gap-2 text-fg">
            View profile
            <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full border border-fg/15 transition duration-300 group-hover:rotate-45 group-hover:border-brand group-hover:bg-brand group-hover:text-brand-fg">
              <ArrowUpRight className="size-4" />
            </span>
          </span>
        </div>
      </div>
    </article>
  )
}
