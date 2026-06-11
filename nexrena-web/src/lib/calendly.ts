export const CONTACT_EMAIL = 'NicholasL@Nexrena.com'

function readCalendlyUrl(): string {
  const fromPublic = (import.meta.env.PUBLIC_CALENDLY_URL as string | undefined)?.trim()
  const fromNext = (import.meta.env.NEXT_PUBLIC_CALENDLY_URL as string | undefined)?.trim()
  return fromPublic || fromNext || ''
}

const RAW_URL = readCalendlyUrl()

export const CALENDLY_EMBED_STYLE = (
  (import.meta.env.PUBLIC_CALENDLY_EMBED_STYLE as string | undefined)?.trim().toLowerCase() ||
  (import.meta.env.CALENDLY_EMBED_STYLE as string | undefined)?.trim().toLowerCase() ||
  'inline'
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

export function mailtoFallback(): string {
  return `mailto:${CONTACT_EMAIL}`
}
