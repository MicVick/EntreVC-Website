import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ArrowUpRight, CheckCircle2, Mail, MapPin, MessageSquareText, Share2 } from 'lucide-react'

import { ContactForm } from '@/components/public/contact-form'
import { PageHero } from '@/components/public/page-hero'
import { Skeleton } from '@/components/ui/skeleton'
import { getRoleContacts, getSiteSettings } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'
import { publicExternalUrl } from '@/lib/public-link'

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: 'Contact EntreVC at IIM Ahmedabad for events, startup listings, sponsorship, speaking invitations and mentorship.',
  path: '/contact',
})

export default async function ContactPage() {
  const [settings, contacts] = await Promise.all([getSiteSettings(), getRoleContacts()])
  const takedownEmail = settings.takedownEmail ?? settings.clubEmail
  const socialLinks = settings.socialLinks.flatMap((social) => {
    const url = publicExternalUrl(social.url)
    return url ? [{ ...social, url }] : []
  })

  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact"
        description="Write to us about events, startup listings, speaking, mentoring or sponsorship. Pick a topic and your message goes straight to the person on the team who handles it."
        aside={
          <div className="rounded-lg surface-card p-6 sm:p-7">
            <p className="meta-label text-fg-subtle">People usually write to</p>
            <ul className="mt-5 space-y-4 text-sm leading-6 text-fg-muted">
              {['List or update a startup', 'Speak, mentor, sponsor or partner', 'Ask about an event or opportunity'].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 aria-hidden="true" className="mt-1 size-4 shrink-0 text-accent" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-border pt-5 text-xs leading-5 text-fg-subtle">One form. We route it to the right person.</p>
          </div>
        }
      />

      <section className="section-shell">
        <div className="site-shell grid gap-12 lg:grid-cols-[minmax(17rem,0.7fr)_minmax(0,1.3fr)]">
          <aside className="space-y-5 lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-lg surface-card p-6">
              <Mail aria-hidden="true" className="size-5 text-accent" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">Club email</p>
              <a href={`mailto:${settings.clubEmail}`} className="mt-2 block break-all font-semibold text-fg transition hover:text-accent">{settings.clubEmail}</a>
            </div>
            {settings.campusAddress ? (
              <div className="rounded-lg surface-card p-6">
                <MapPin aria-hidden="true" className="size-5 text-accent" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">Campus</p>
                <address className="mt-2 text-sm not-italic leading-6 text-fg-muted">{settings.campusAddress}</address>
              </div>
            ) : null}
            {socialLinks.length ? (
              <div className="rounded-lg surface-card p-6">
                <Share2 aria-hidden="true" className="size-5 text-accent" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">Find EntreVC</p>
                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-3">
                  {socialLinks.map((social) => (
                    <a
                      key={`${social.platform}-${social.url}`}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-sm font-semibold capitalize text-fg transition hover:text-accent"
                    >
                      {social.label ?? social.platform}
                      <ArrowUpRight aria-hidden="true" className="size-3.5" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="rounded-lg border border-brand bg-brand-muted p-6">
              <MessageSquareText aria-hidden="true" className="size-5 text-accent" />
              <h2 className="display-type mt-5 text-2xl">Fix or remove a startup listing</h2>
              <p className="mt-3 text-sm leading-6 text-fg-muted">Founders can ask us to correct or remove their startup’s profile at any time.</p>
              <a href={`mailto:${takedownEmail}?subject=Startup%20listing%20request`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-accent">
                {takedownEmail} <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          </aside>

          <div>
            <Suspense fallback={<Skeleton className="min-h-[42rem] w-full" />}>
              <ContactForm />
            </Suspense>
          </div>
        </div>
      </section>

      {contacts.length ? (
        <section className="section-shell">
          <div className="site-shell">
            <h2 className="display-type max-w-3xl text-[clamp(1.75rem,3.4vw,2.5rem)]">Or email the right person directly</h2>
            <div className="reveal-grid mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {contacts.map((contact) => (
                <article key={`${contact.role}-${contact.email}`} className="surface-card spotlight min-h-56 rounded-xl p-6 transition duration-500 hover:-translate-y-1">
                  <p className="meta-label text-accent">{contact.role}</p>
                  {contact.name ? <h3 className="display-type mt-7 text-2xl font-semibold">{contact.name}</h3> : null}
                  {contact.description ? <p className="mt-3 text-sm leading-6 text-fg-muted">{contact.description}</p> : null}
                  <a href={`mailto:${contact.email}`} className="mt-6 inline-flex items-center gap-2 break-all text-sm font-semibold text-accent">
                    Email <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                  </a>
                </article>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </>
  )
}
