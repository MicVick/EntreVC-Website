import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { EntreVCSprite } from '@/components/public/entrevc-sprite'
import { Footer } from '@/components/public/footer'
import { GoogleAnalytics } from '@/components/public/google-analytics'
import { Header } from '@/components/public/header'
import { JourneyBackdrop } from '@/components/public/journey-backdrop'
import { PointerGlow } from '@/components/public/pointer-glow'
import { getSiteSettings } from '@/lib/content'
import { getSiteUrl, shareImage } from '@/lib/seo'

import '../globals.css'

// Geist for headings and text, Instrument Serif italic for the odd accent word, Geist
// Mono for labels, dates and numbers. All latin-only woff2, self-hosted, OFL.
const geist = localFont({
  src: '../../brand/fonts/geist-variable.woff2',
  variable: '--font-geist',
  weight: '100 900',
  display: 'swap',
})

const geistMono = localFont({
  src: '../../brand/fonts/geist-mono-variable.woff2',
  variable: '--font-geist-mono',
  weight: '100 900',
  display: 'swap',
})

const instrumentSerif = localFont({
  src: [
    { path: '../../brand/fonts/instrument-serif-regular.woff2', weight: '400', style: 'normal' },
    { path: '../../brand/fonts/instrument-serif-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-instrument',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings()

  return {
    metadataBase: getSiteUrl(),
    title: {
      default: 'EntreVC · IIM Ahmedabad',
      template: '%s · EntreVC',
    },
    description: settings.positioningStatement,
    applicationName: 'EntreVC',
    category: 'Entrepreneurship',
    creator: 'EntreVC, IIM Ahmedabad',
    openGraph: {
      type: 'website',
      siteName: 'EntreVC · IIM Ahmedabad',
      title: 'EntreVC · IIM Ahmedabad',
      description: settings.positioningStatement,
      url: '/',
      locale: 'en_IN',
      images: [shareImage()],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'EntreVC · IIM Ahmedabad',
      description: settings.positioningStatement,
      images: [{ url: shareImage().url, alt: shareImage().alt }],
    },
  }
}

export default async function PublicLayout({ children }: LayoutProps<'/'>) {
  const settings = await getSiteSettings()

  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}>
      <body className="relative isolate flex min-h-dvh flex-col bg-bg text-fg">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-brand px-5 py-3 text-sm font-semibold text-brand-fg shadow-lg transition focus:translate-y-0"
        >
          Skip to content
        </a>
        <EntreVCSprite />
        <JourneyBackdrop />
        <Header />
        <main id="main-content" className="min-h-[60vh] flex-1">
          {children}
        </main>
        <Footer settings={settings} />
        <PointerGlow />
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      </body>
    </html>
  )
}
