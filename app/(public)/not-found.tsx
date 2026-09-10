import Link from 'next/link'
import { ArrowLeft, Compass } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'

export default function NotFound() {
  return (
    <section className="surface-grid flex min-h-[70vh] items-center border-b border-border">
      <div className="site-shell py-20">
        <Compass aria-hidden="true" className="size-9 text-brand" />
        <p className="eyebrow mt-8">404 · Wrong turn</p>
        <h1 className="display-type mt-6 max-w-4xl text-5xl font-semibold leading-[0.9] sm:text-7xl">That page has moved, ended or never existed.</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-fg-muted">The event, venture or resource may no longer be published. The main site still has plenty to explore.</p>
        <Link href="/" className={`${buttonVariants({ size: 'lg' })} mt-9`}>
          <ArrowLeft aria-hidden="true" className="size-4" /> Return home
        </Link>
      </div>
    </section>
  )
}
