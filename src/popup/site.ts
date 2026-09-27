export type Site = 'youtube' | 'instagram' | 'other'

export function siteFromUrl(value: string): Site {
  try {
    const { protocol, hostname } = new URL(value)
    if (protocol !== 'https:' && protocol !== 'http:') return 'other'
    if (hostname === 'youtube.com' || hostname === 'www.youtube.com') return 'youtube'
    if (hostname === 'instagram.com' || hostname === 'www.instagram.com') return 'instagram'
  } catch {
    // Missing or invalid tab URLs are unsupported.
  }
  return 'other'
}
