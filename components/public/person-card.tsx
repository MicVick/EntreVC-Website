import { ArrowUpRightIcon as ArrowUpRight } from '@/components/ui/icons'

import { ContentImage } from '@/components/public/content-image'
import { cn } from '@/components/ui/cn'
import { publicExternalUrl } from '@/lib/public-link'
import type { TeamMember } from '@/lib/schemas'

type PersonCardProps = {
  person: TeamMember
  className?: string
}

/** A portrait in an arched frame, after the arches of Kahn's campus. */
export function PersonCard({ person, className }: PersonCardProps) {
  const linkedin = publicExternalUrl(person.linkedin)
  const content = (
    <article className={cn('group min-w-0', className)}>
      <div className="arch relative aspect-[4/5] overflow-hidden bg-surface-2 ring-1 ring-fg/10 transition duration-500 group-hover:ring-accent/50">
        <ContentImage
          image={person.photo}
          kind="person"
          label={person.name}
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 100vw"
          className="grayscale-[40%] transition duration-700 group-hover:scale-[1.04] group-hover:grayscale-0"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
        {linkedin ? (
          <span className="absolute bottom-3 right-3 flex size-10 items-center justify-center rounded-full border border-fg/15 bg-bg/70 text-fg backdrop-blur transition duration-300 group-hover:rotate-45 group-hover:border-brand group-hover:bg-brand group-hover:text-brand-fg">
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </span>
        ) : null}
      </div>
      <h3 className="display-type mt-4 break-words text-xl">{person.name}</h3>
      <p className="mt-0.5 text-sm text-fg-muted">{person.role}</p>
      {person.batch ? <p className="meta-label mt-1.5 text-fg-subtle">{person.batch}</p> : null}
    </article>
  )

  return linkedin ? (
    <a href={linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${person.name}, ${person.role}, on LinkedIn`} className="rounded-lg">
      {content}
    </a>
  ) : (
    content
  )
}
