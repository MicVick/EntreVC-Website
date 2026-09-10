import { Skeleton } from '@/components/ui/skeleton'

export default function PublicLoading() {
  return (
    <div className="site-shell py-16 sm:py-24" aria-label="Loading page" role="status">
      <span className="sr-only">Loading</span>
      <Skeleton className="h-4 w-36" />
      <Skeleton className="mt-8 h-16 w-full max-w-4xl sm:h-24" />
      <Skeleton className="mt-4 h-16 w-full max-w-2xl" />
      <div className="mt-16 grid gap-5 md:grid-cols-3">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  )
}
