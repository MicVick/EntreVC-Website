import type { Metadata } from 'next'
import { Manrope, Space_Grotesk } from 'next/font/google'

import { Footer } from '@/components/public/footer'
import { GoogleAnalytics } from '@/components/public/google-analytics'
import { Header } from '@/components/public/header'
import { Toaster } from '@/components/ui/toast'
import { getSiteSettings } from '@/lib/content'
import { getSiteUrl } from '@/lib/seo'

import '../globals.css'

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  variable: '--font-space-grotesk',
  subsets: ['latin'],
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
    },
    twitter: {
      card: 'summary',
      title: 'EntreVC · IIM Ahmedabad',
      description: settings.positioningStatement,
    },
  }
}

export default async function PublicLayout({ children }: LayoutProps<'/'>) {
  const settings = await getSiteSettings()

  return (
    <html lang="en" className={`${manrope.variable} ${spaceGrotesk.variable} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col bg-bg text-fg">
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-24 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-fg shadow-lg transition focus:translate-y-0"
        >
          Skip to content
        </a>
        <Header />
        <main id="main-content" className="min-h-[60vh] flex-1">
          {children}
        </main>
        <Footer settings={settings} />
        <Toaster />
        <GoogleAnalytics measurementId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
      </body>
    </html>
  )
}
