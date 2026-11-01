import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

import { CampusGallery } from '@/components/public/campus-gallery'
import { Pillars, RoadAhead, YearHighlights } from '@/components/public/club-story'
import { PageHero } from '@/components/public/page-hero'
import { PartnerWall } from '@/components/public/partner-wall'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'
import { ArrowRightIcon as ArrowRight } from '@/components/ui/icons'
import { getClubStory, getPartners, getSiteSettings } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'About',
  description:
    'What EntreVC is, what the club ran last year, the plan for this year, our partners and the campus we run it from.',
  path: '/about',
})

/**
 * The longer club story, moved off the homepage so that page stays short: mission and
 * pillars, last year in numbers, this year's plan, partners and the campus.
 */
export default async function AboutPage() {
  const [settings, story, partners] = await Promise.all([getSiteSettings(), getClubStory(), getPartners()])

  return (
    <>
      <PageHero
        eyebrow="About the club"
        title={
          <>
            What is <span className="accent-serif text-accent">EntreVC?</span>
          </>
        }
        description={settings.positioningStatement}
        aside={
          <figure className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border bg-surface shadow-md">
            <Image
              src="/images/campus/louis-kahn-plaza.webp"
              alt="Louis Kahn Plaza at IIM Ahmedabad: a wide lawn framed by the brick classroom block, the library and the faculty block."
              width={1280}
              height={720}
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="h-full w-full object-cover"
            />
            <figcaption className="absolute bottom-3 left-3 rounded-md border border-border bg-bg/85 px-3 py-1.5 text-[0.7rem] leading-5 text-fg-muted backdrop-blur">
              <span className="font-semibold text-fg">Louis Kahn Plaza</span> · Photo: Perspectives, IIMA,{' '}
              <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer license" className="underline underline-offset-2 hover:text-fg">
                CC BY-SA 4.0
              </a>
            </figcaption>
          </figure>
        }
      />

      <section aria-labelledby="who-title" className="relative isolate overflow-x-clip pb-[var(--section-space)]">
        <div className="site-shell grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
          <div>
            <p className="eyebrow">Who we are</p>
            <h2 id="who-title" className="display-type mt-4 text-[clamp(1.9rem,3.6vw,3rem)]">
              Run by students, <span className="accent-serif text-accent">for builders.</span>
            </h2>
            {settings.intro.html ? (
              <div className="rich-text mt-6 max-w-2xl" dangerouslySetInnerHTML={{ __html: settings.intro.html }} />
            ) : null}
            <Link href="/team" prefetch={false} className={cn(buttonVariants({ variant: 'outline', size: 'md' }), 'mt-8')}>
              Meet the team <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <Pillars pillars={story.pillars} layout="list" className="lg:self-end" />
        </div>
      </section>

      <YearHighlights highlights={story.highlights} />
      <RoadAhead roadmap={story.roadmap} />
      <PartnerWall partners={partners} showBlurbs />
      <CampusGallery />
    </>
  )
}
