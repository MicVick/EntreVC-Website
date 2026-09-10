import Link from 'next/link'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'

type PaginationProps = {
  currentPage: number
  totalPages: number
  hrefForPage: (page: number) => string
  className?: string
}

export function Pagination({ currentPage, totalPages, hrefForPage, className }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav aria-label="Pagination" className={cn('flex items-center justify-between gap-4 border-t border-border pt-6', className)}>
      {currentPage > 1 ? (
        <Link href={hrefForPage(currentPage - 1)} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          <ArrowLeft aria-hidden="true" className="size-4" /> Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="text-sm text-fg-muted">
        Page <span className="font-semibold text-fg">{currentPage}</span> of {totalPages}
      </p>
      {currentPage < totalPages ? (
        <Link href={hrefForPage(currentPage + 1)} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
          Next <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
