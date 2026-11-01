import Link from 'next/link'
import { getImageProps } from 'next/image'

import { SectionHeader } from '@/components/public/section-header'
import { cn } from '@/components/ui/cn'
import { ArrowUpRightIcon as ArrowUpRight, HandshakeIcon } from '@/components/ui/icons'
import { publicExternalUrl } from '@/lib/public-link'
import { partnerKindLabels, type Partner } from '@/lib/schemas'

const PARTNER_HREF = '/contact?category=sponsorship'

function PartnerMark({ partner }: { partner: Partner }) {
  if (partner.logo) {
    const { props } = getImageProps({
      src: partner.logo.url,
      alt: partner.name,
      width: partner.logo.width,
      height: partner.logo.height,
      sizes: '14rem',
    })
    // Plain <img> with next/image's optimised src/srcset, without the client runtime.
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={partner.name} className="max-h-[52%] w-auto max-w-[72%] object-contain" />
  }
  // No logo yet: the name, set like a wordmark, so the tile never looks broken.
  return <span className="display-type px-4 text-center text-[clamp(1.05rem,2.2vw,1.4rem)] leading-tight text-fg">{partner.name}</span>
}

function PartnerTile({ partner, showBlurb }: { partner: Partner; showBlurb: boolean }) {
  const href = publicExternalUrl(partner.website)
  const tile = (
    <>
      <span className="surface-card flex aspect-[3/2] items-center justify-center rounded-xl transition duration-500 group-hover:-translate-y-1 group-hover:shadow-lg">
        <PartnerMark partner={partner} />
      </span>
      <span className="mt-3 flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="block truncate text-sm font-semibold text-fg">{partner.name}</span>
          <span className="meta-label mt-0.5 block text-[0.68rem] text-fg-subtle">{partnerKindLabels[partner.kind]}</span>
        </span>
        {href ? <ArrowUpRight aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-fg-subtle transition group-hover:text-accent" /> : null}
      </span>
      {showBlurb && partner.blurb ? <span className="mt-2 block text-sm leading-6 text-fg-muted">{partner.blurb}</span> : null}
    </>
  )

  return (
    <li className="min-w-0">
      {href ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="group block rounded-xl focus-visible:outline-offset-4">
          {tile}
          <span className="sr-only"> (opens in a new tab)</span>
        </a>
      ) : (
        <div className="group">{tile}</div>
      )}
    </li>
  )
}

/**
 * The partner wall, from the Partners collection. Logos sit on off-white tiles so any
 * brand colour reads on the dark page. The last tile is an open invitation, so the
 * wall looks deliberate with one partner as much as with twenty.
 */
export function PartnerWall({
  partners,
  showBlurbs = false,
  className,
}: {
  partners: Partner[]
  showBlurbs?: boolean
  className?: string
}) {
  return (
    <section aria-labelledby="partners-title" className={cn('section-shell isolate', className)}>
      <div aria-hidden="true" className="glow-orb -right-48 top-1/4 size-[28rem]" />
      <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
        <SectionHeader
          id="partners-title"
          eyebrow="Partners"
          title="Built with our"
          accent="partners"
          description="The institute’s incubator, our sponsors and the organisations that help us run events, judge competitions and back student founders."
          className="mb-0 sm:mb-0 md:block lg:self-start"
          action={
            <Link
              href={PARTNER_HREF}
              prefetch={false}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent underline-offset-4 hover:underline md:mt-8"
            >
              Partner with EntreVC <ArrowUpRight aria-hidden="true" className="size-4" />
            </Link>
          }
        />

        <ul className="grid grid-cols-2 gap-x-3 gap-y-7 sm:grid-cols-3 sm:gap-x-4">
          {partners.map((partner) => (
            <PartnerTile key={partner.id} partner={partner} showBlurb={showBlurbs} />
          ))}
          <li className="min-w-0">
            <Link href={PARTNER_HREF} prefetch={false} className="group block rounded-xl focus-visible:outline-offset-4">
              <span className="flex aspect-[3/2] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-accent/70 bg-brand-muted/40 text-accent transition duration-500 group-hover:-translate-y-1 group-hover:bg-brand-muted">
                <HandshakeIcon aria-hidden="true" className="size-6" />
                <span className="accent-serif text-[1.35rem] leading-none">Your logo?</span>
              </span>
              <span className="mt-3 block text-sm font-semibold text-fg">Partner with us</span>
              <span className="meta-label mt-0.5 block text-[0.68rem] text-fg-subtle">Events, prizes, sessions</span>
            </Link>
          </li>
        </ul>
      </div>
    </section>
  )
}
