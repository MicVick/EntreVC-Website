import Link from 'next/link'
import { ArrowUpRight, Camera, ContactRound, Mail, Play } from 'lucide-react'

import { BrandLogo } from '@/components/public/brand-logo'
import { navigationItems } from '@/components/public/header'
import { NewsletterSignup } from '@/components/public/newsletter-signup'
import type { SiteSettings, SocialLink } from '@/lib/schemas'

function SocialIcon({ platform }: Pick<SocialLink, 'platform'>) {
  if (platform === 'linkedin') return <ContactRound aria-hidden="true" className="size-4" />
  if (platform === 'instagram') return <Camera aria-hidden="true" className="size-4" />
  if (platform === 'youtube') return <Play aria-hidden="true" className="size-4" />
  return <ArrowUpRight aria-hidden="true" className="size-4" />
}

type FooterProps = {
  settings: SiteSettings
}

export function Footer({ settings }: FooterProps) {
  const takedownEmail = settings.takedownEmail ?? settings.clubEmail

  return (
    <footer className="border-t border-border bg-surface">
      <div className="site-shell py-12 sm:py-14">
        <div className="grid gap-10 border-b border-border pb-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="eyebrow">Stay in the loop</p>
            <h2 className="display-type mt-5 max-w-3xl text-4xl font-semibold leading-none sm:text-5xl">
              The next good idea might start with one useful email.
            </h2>
          </div>
          <NewsletterSignup source="footer" compact />
        </div>

        <div className="grid gap-9 py-10 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.7fr_0.85fr]">
          <div>
            <BrandLogo />
            <p className="mt-6 max-w-md text-sm leading-6 text-fg-muted">{settings.positioningStatement}</p>
          </div>
          <nav aria-label="Footer navigation">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fg-subtle">Explore</p>
            <ul className="mt-5 space-y-3">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} prefetch={false} className="text-sm font-semibold text-fg-muted transition hover:text-accent">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li><Link href="/contact" prefetch={false} className="text-sm font-semibold text-fg-muted transition hover:text-accent">Contact</Link></li>
            </ul>
          </nav>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-fg-subtle">Find us</p>
            <a href={`mailto:${settings.clubEmail}`} className="mt-5 flex items-center gap-2 text-sm font-semibold text-fg transition hover:text-accent">
              <Mail aria-hidden="true" className="size-4" /> {settings.clubEmail}
            </a>
            {settings.campusAddress ? <address className="mt-4 max-w-xs text-sm not-italic leading-6 text-fg-muted">{settings.campusAddress}</address> : null}
            {settings.socialLinks.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {settings.socialLinks.map((social) => (
                  <a
                    key={`${social.platform}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={social.label ?? `EntreVC on ${social.platform}`}
                    className="flex size-10 items-center justify-center rounded-full border border-border text-fg-muted transition hover:border-brand hover:bg-brand hover:text-brand-fg"
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-border pt-6 text-xs leading-5 text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getUTCFullYear()} EntreVC, IIM Ahmedabad.</p>
          <p>
            Need a venture listing corrected or removed?{' '}
            <a href={`mailto:${takedownEmail}?subject=Startup%20listing%20request`} className="font-semibold text-fg-muted underline decoration-brand underline-offset-4 hover:text-accent">
              Contact the ventures team
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
