export type AnalyticsEvent =
  | 'register_start'
  | 'registration_complete'
  | 'newsletter_signup'
  | 'startup_view'
  | 'contact_submit'

type AnalyticsParams = Readonly<Record<string, string | number | boolean | null>>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (command: 'event', event: AnalyticsEvent, params?: AnalyticsParams) => void
  }
}

export function trackAnalytics(event: AnalyticsEvent, params?: AnalyticsParams): void {
  if (typeof window === 'undefined') return

  window.gtag?.('event', event, params)
  window.dispatchEvent(new CustomEvent(`entrevc:${event}`, { detail: params }))
}
