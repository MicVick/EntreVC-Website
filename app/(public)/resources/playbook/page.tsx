import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowDown, ArrowLeft, ArrowUpRight, BookOpen, Download } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/components/ui/cn'
import { getPlaybookChapters, getPlaybookMeta } from '@/lib/content'
import { formatDateInIST } from '@/lib/format'
import { buildMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPlaybookMeta()
  return buildMetadata({
    title: meta.title,
    description: meta.intro.plainText,
    path: '/resources/playbook',
  })
}

export default async function PlaybookPage() {
  const [meta, chapters] = await Promise.all([getPlaybookMeta(), getPlaybookChapters()])

  return (
    <>
      <section className="surface-grid border-b border-border">
        <div className="site-shell py-12 sm:py-20">
          <Link href="/resources" className="inline-flex items-center gap-2 text-sm font-semibold text-fg-muted transition hover:text-accent">
            <ArrowLeft aria-hidden="true" className="size-4" /> Back to resources
          </Link>
          <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(17rem,0.8fr)] lg:items-end">
            <div>
              <p className="eyebrow">EntreVC field notes</p>
              <h1 className="display-type mt-6 max-w-5xl text-5xl font-semibold leading-[0.9] sm:text-7xl lg:text-8xl">{meta.title}</h1>
              <div className="rich-text mt-8 max-w-3xl" dangerouslySetInnerHTML={{ __html: meta.intro.html }} />
            </div>
            <div className="rounded-lg border border-border bg-surface p-6 sm:p-8">
              <BookOpen aria-hidden="true" className="size-7 text-accent" />
              <p className="display-type mt-6 text-3xl font-semibold">{chapters.length} chapters. One honest starting point.</p>
              {meta.updatedAt ? <p className="mt-4 text-sm text-fg-muted">Last revised {formatDateInIST(meta.updatedAt)}</p> : null}
              <div className="mt-7 flex flex-col gap-3">
                <a href="#chapter-1" className={buttonVariants({ size: 'sm' })}>
                  Start reading <ArrowDown aria-hidden="true" className="size-4" />
                </a>
                {meta.pdfUrl ? (
                  <a href={meta.pdfUrl} download className={buttonVariants({ variant: 'outline', size: 'sm' })}>
                    Download PDF <Download aria-hidden="true" className="size-4" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="site-shell grid gap-12 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="h-fit lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">In this playbook</p>
            {chapters.length ? (
              <nav aria-label="Playbook chapters" className="mt-5 border-l border-border">
                {chapters.map((chapter, index) => (
                  <a
                    key={chapter.id}
                    href={`#chapter-${chapter.order}`}
                    className="group flex gap-4 border-b border-border py-4 pl-4 text-sm text-fg-muted transition hover:border-brand hover:bg-surface hover:text-fg"
                  >
                    <span className="shrink-0 tabular-nums text-fg-subtle">{String(index + 1).padStart(2, '0')}</span>
                    <span className="font-semibold">{chapter.title}</span>
                  </a>
                ))}
              </nav>
            ) : null}
            {meta.pdfUrl ? (
              <a href={meta.pdfUrl} download className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'mt-6 w-full')}>
                <Download aria-hidden="true" className="size-4" /> Download PDF
              </a>
            ) : null}
          </aside>

          <div className="min-w-0">
            {chapters.length ? (
              chapters.map((chapter, index) => (
                <article
                  key={chapter.id}
                  id={`chapter-${chapter.order}`}
                  className="scroll-mt-28 border-b border-border pb-16 pt-2 first:pt-0 last:border-0 last:pb-0 [&+article]:pt-16"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex size-10 items-center justify-center rounded-full border border-brand bg-brand-muted text-xs font-bold tabular-nums text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <p className="text-xs font-bold uppercase tracking-[0.13em] text-fg-subtle">Chapter</p>
                  </div>
                  <h2 className="display-type mt-7 max-w-4xl text-4xl font-semibold leading-none sm:text-6xl">{chapter.title}</h2>
                  {chapter.summary ? <p className="mt-5 max-w-3xl text-lg leading-8 text-fg-muted">{chapter.summary}</p> : null}
                  <div className="rich-text mt-9 max-w-3xl" dangerouslySetInnerHTML={{ __html: chapter.body.html }} />
                </article>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-border-strong bg-surface p-8">
                <h2 className="display-type text-2xl font-semibold">The web edition is being prepared.</h2>
                <p className="mt-3 text-fg-muted">Check back soon, or use the PDF edition if it is available.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-brand text-brand-fg">
        <div className="site-shell flex flex-col gap-6 py-12 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.13em] opacity-75">Finished a chapter?</p>
            <h2 className="display-type mt-3 text-3xl font-semibold">Put it to work in a room full of builders.</h2>
          </div>
          <Link href="/events" className={cn(buttonVariants({ variant: 'secondary', size: 'lg' }), 'border-brand-fg/40 bg-brand-fg text-bg hover:bg-accent')}>
            Find an event <ArrowUpRight aria-hidden="true" className="size-4" />
          </Link>
        </div>
      </section>
    </>
  )
}
