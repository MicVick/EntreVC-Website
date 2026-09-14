import { Skeleton } from '@/components/ui/skeleton'

type SectionLoadingProps = {
  label: string
  cards?: number
}

export function SectionLoading({ label, cards = 3 }: SectionLoadingProps) {
  return (
    <div className="site-shell py-16 sm:py-24" aria-label={`Loading ${label}`} role="status">
      <span className="sr-only">Loading {label}</span>
      <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-fg-subtle">
        <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-brand" />
        {label}
      </div>
      <Skeleton className="mt-8 h-16 w-full max-w-4xl sm:h-24" />
      <Skeleton className="mt-4 h-16 w-full max-w-2xl" />
      <div className="mt-16 grid gap-5 md:grid-cols-3">
        {Array.from({ length: cards }, (_, index) => (
          <Skeleton key={index} className="h-80" />
        ))}
      </div>
    </div>
  )
}
