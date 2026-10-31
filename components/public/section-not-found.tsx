import Link from 'next/link'
import { ArrowLeft, Compass } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'

type SectionNotFoundProps = {
  eyebrow: string
  title: string
  description: string
  href: string
  action: string
}

export function SectionNotFound({ eyebrow, title, description, href, action }: SectionNotFoundProps) {
  return (
    <section className="flex min-h-[62vh] items-center border-b border-border">
      <div className="site-shell py-20">
        <Compass aria-hidden="true" className="size-9 text-brand" />
        <p className="eyebrow mt-8">{eyebrow}</p>
        <h1 className="display-type mt-6 max-w-4xl text-[clamp(2.6rem,6vw,4.75rem)]">{title}</h1>
        <p className="mt-7 max-w-xl text-lg leading-8 text-fg-muted">{description}</p>
        <Link href={href} className={`${buttonVariants({ size: 'lg' })} mt-9`}>
          <ArrowLeft aria-hidden="true" className="size-4" /> {action}
        </Link>
      </div>
    </section>
  )
}
