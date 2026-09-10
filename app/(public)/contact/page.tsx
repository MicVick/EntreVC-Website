import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ArrowUpRight, Mail, MapPin, MessageSquareText } from 'lucide-react'

import { ContactForm } from '@/components/public/contact-form'
import { Skeleton } from '@/components/ui/skeleton'
import { getRoleContacts, getSiteSettings } from '@/lib/content'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Contact',
  description: 'Contact EntreVC at IIM Ahmedabad for events, startup listings, sponsorship, speaking invitations and mentorship.',
  path: '/contact',
})

export default async function ContactPage() {
  const [settings, contacts] = await Promise.all([getSiteSettings(), getRoleContacts()])
  const takedownEmail = settings.takedownEmail ?? settings.clubEmail

  return (
    <>
      <section className="surface-grid border-b border-border">
        <div className="site-shell py-16 sm:py-24">
          <p className="eyebrow">Start a useful conversation</p>
          <h1 className="display-type mt-6 max-w-5xl text-5xl font-semibold leading-[0.9] sm:text-7xl lg:text-8xl">
            You should not need to guess who to{' '}
            <span className="text-accent">email.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-fg-muted">Choose what your note is about. The site routes it to the relevant EntreVC vertical and keeps a copy even if email delivery has a bad day.</p>
        </div>
      </section>

      <section className="section-shell">
        <div className="site-shell grid gap-12 lg:grid-cols-[minmax(17rem,0.7fr)_minmax(0,1.3fr)]">
          <aside className="space-y-5 lg:sticky lg:top-28 lg:h-fit">
            <div className="rounded-lg border border-border bg-surface p-6">
              <Mail aria-hidden="true" className="size-5 text-accent" />
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">Club email</p>
              <a href={`mailto:${settings.clubEmail}`} className="mt-2 block break-all font-semibold text-fg transition hover:text-accent">{settings.clubEmail}</a>
            </div>
            {settings.campusAddress ? (
              <div className="rounded-lg border border-border bg-surface p-6">
                <MapPin aria-hidden="true" className="size-5 text-accent" />
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">Campus</p>
                <address className="mt-2 text-sm not-italic leading-6 text-fg-muted">{settings.campusAddress}</address>
              </div>
            ) : null}
            <div className="rounded-lg border border-brand bg-brand-muted p-6">
              <MessageSquareText aria-hidden="true" className="size-5 text-accent" />
              <h2 className="display-type mt-5 text-2xl font-semibold">Listing corrections & removal</h2>
              <p className="mt-3 text-sm leading-6 text-fg-muted">Founders can request a correction or complete removal of their venture profile at any time.</p>
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
        <section className="section-shell border-t border-border bg-surface">
          <div className="site-shell">
            <p className="eyebrow">Direct routes</p>
            <h2 className="display-type mt-5 max-w-3xl text-4xl font-semibold leading-none sm:text-5xl">When you already know what you need.</h2>
            <div className="mt-10 grid border-l border-t border-border sm:grid-cols-2 lg:grid-cols-4">
              {contacts.map((contact) => (
                <article key={`${contact.role}-${contact.email}`} className="min-h-64 border-b border-r border-border bg-bg p-6">
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-brand">{contact.role}</p>
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
