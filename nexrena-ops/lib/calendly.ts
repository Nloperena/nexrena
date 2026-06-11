export const CONTACT_EMAIL = 'NicholasL@Nexrena.com'

const RAW_URL = process.env.NEXT_PUBLIC_CALENDLY_URL?.trim() ?? ''

export const CALENDLY_EMBED_STYLE = (
  process.env.NEXT_PUBLIC_CALENDLY_EMBED_STYLE?.trim().toLowerCase() || 'inline'
) as 'inline' | 'popup'

export function isCalendlyEnabled(): boolean {
  return RAW_URL.length > 0 && /^https?:\/\//i.test(RAW_URL)
}

type Prefill = { name?: string; email?: string }

export function buildCalendlyUrl(prefill?: Prefill): string {
  if (!isCalendlyEnabled()) return ''
  const url = new URL(RAW_URL)
  url.searchParams.set('primary_color', 'c9a96e')
  url.searchParams.set('text_color', '0c0f12')
  if (prefill?.name) url.searchParams.set('name', prefill.name)
  if (prefill?.email) url.searchParams.set('email', prefill.email)
  return url.toString()
}

export function mailtoFallback(href?: string): string {
  return href ?? `mailto:${CONTACT_EMAIL}`
}
