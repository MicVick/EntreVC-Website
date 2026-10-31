/** Do not present seed-only destinations as working external links. */
export function publicExternalUrl(value: string | null | undefined): string | null {
  if (!value) return null

  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    if (url.hostname === 'example.com' || url.hostname.endsWith('.example.com')) return null
    if (/^\/(?:in\/|company\/)?@?example[-_.]/i.test(url.pathname)) return null
    return url.toString()
  } catch {
    return null
  }
}
