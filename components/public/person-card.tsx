import { ContentImage } from '@/components/public/content-image'
import { ArrowUpRight } from 'lucide-react'

import { cn } from '@/components/ui/cn'
import type { TeamMember } from '@/lib/schemas'

type PersonCardProps = {
  person: TeamMember
  className?: string
}

export function PersonCard({ person, className }: PersonCardProps) {
  const content = (
    <article className={cn('group min-w-0', className)}>
      <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-border bg-surface-2">
        <ContentImage image={person.photo} kind="person" label={person.name} sizes="(min-width: 1024px) 24vw, (min-width: 640px) 50vw, 100vw" />
        {person.linkedin ? (
          <span className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full border border-border bg-bg/80 text-fg backdrop-blur transition group-hover:border-brand group-hover:bg-brand group-hover:text-brand-fg">
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </span>
        ) : null}
      </div>
      <h3 className="display-type mt-5 break-words text-xl font-semibold leading-tight">{person.name}</h3>
      <p className="mt-1 text-sm font-semibold text-accent">{person.role}</p>
      {person.batch ? <p className="mt-1 text-sm text-fg-subtle">{person.batch}</p> : null}
    </article>
  )

  return person.linkedin ? (
    <a href={person.linkedin} target="_blank" rel="noreferrer" aria-label={`${person.name} on LinkedIn`}>
      {content}
    </a>
  ) : (
    content
  )
}
