import Link from 'next/link'
import { ArrowUpRightIcon as ArrowUpRight, CameraIcon as Camera, ContactIcon as ContactRound, MailIcon as Mail, PlayIcon as Play } from '@/components/ui/icons'

import { BrandLogo } from '@/components/public/brand-logo'
import { InstituteMark } from '@/components/public/institute-mark'
import { navigationItems } from '@/components/public/header'
import { NewsletterSignup } from '@/components/public/newsletter-signup'
import type { SiteSettings, SocialLink } from '@/lib/schemas'
import { publicExternalUrl } from '@/lib/public-link'

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
  const socialLinks = settings.socialLinks.flatMap((social) => {
    const url = publicExternalUrl(social.url)
    return url ? [{ ...social, url }] : []
  })

  return (
    <footer className="mt-auto bg-gradient-to-b from-transparent to-bg/90">
      <div className="site-shell pb-10 pt-4 sm:pb-12">
        <div className="glass relative grid gap-8 overflow-hidden rounded-2xl p-7 sm:p-10 lg:grid-cols-[1fr_1fr] lg:items-end lg:p-12">
          <span aria-hidden="true" className="absolute -left-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--color-brand)_30%,transparent)_0%,transparent_70%)]" />
          <div className="relative">
            <p className="eyebrow">Event updates</p>
            <h2 className="display-type mt-4 max-w-xl text-[clamp(1.9rem,3.8vw,2.9rem)]">
              Hear about the next event <span className="accent-serif text-accent">before the seats go.</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-6 text-fg-muted">
              One short email when registrations open. Nothing else.
            </p>
          </div>
          <div className="relative">
            <NewsletterSignup source="footer" compact />
          </div>
        </div>

        <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.7fr_1fr]">
          <div className="flex flex-col gap-6">
            <BrandLogo size="footer" />
            <p className="max-w-sm text-sm leading-6 text-fg-muted">{settings.positioningStatement}</p>
            <InstituteMark />
          </div>

          <nav aria-label="Footer navigation">
            <p className="meta-label text-fg-subtle">Explore</p>
            <ul className="mt-4 grid gap-2.5">
              {navigationItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} prefetch={false} className="text-sm text-fg-muted transition hover:text-fg">
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/contact" prefetch={false} className="text-sm text-fg-muted transition hover:text-fg">Contact</Link>
              </li>
            </ul>
          </nav>

          <div>
            <p className="meta-label text-fg-subtle">Get in touch</p>
            <a href={`mailto:${settings.clubEmail}`} className="mt-4 flex items-center gap-2 text-sm font-medium text-fg transition hover:text-accent">
              <Mail aria-hidden="true" className="size-4" /> {settings.clubEmail}
            </a>
            {settings.campusAddress ? (
              <address className="mt-3 max-w-xs text-sm not-italic leading-6 text-fg-muted">{settings.campusAddress}</address>
            ) : null}
            {socialLinks.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {socialLinks.map((social) => (
                  <a
                    key={`${social.platform}-${social.url}`}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label ?? `EntreVC on ${social.platform}`}
                    className="flex size-10 items-center justify-center rounded-full border border-fg/15 text-fg-muted transition hover:border-fg hover:bg-fg hover:text-bg"
                  >
                    <SocialIcon platform={social.platform} />
                  </a>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-fg/[0.08] pt-6 text-xs leading-5 text-fg-subtle sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getUTCFullYear()} EntreVC, IIM Ahmedabad. Run by students.</p>
          <p>
            Is your startup listed and something’s wrong?{' '}
            <a href={`mailto:${takedownEmail}?subject=Startup%20listing%20request`} className="text-fg-muted underline underline-offset-4 hover:text-accent">
              Tell us
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  )
}
