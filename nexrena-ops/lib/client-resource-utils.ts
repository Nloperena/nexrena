export type ClientResourceType = 'github' | 'live_site' | 'staging'

export type PortalResource = {
  id: string
  contactId: string
  type: ClientResourceType
  title: string
  url: string
  description?: string | null
  relatedInvoiceId?: string | null
  createdAt: string
}

export function resourceDisplayDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

export function resourceActionLabel(type: ClientResourceType, url?: string): string {
  if (type === 'github') return 'Open on GitHub'
  const domain = url ? resourceDisplayDomain(url) : null
  if (type === 'live_site') return domain ? `Visit ${domain}` : 'Visit live site'
  return domain ? `Open ${domain}` : 'Open staging site'
}

export function resourceBrowseUrl(url: string, type: ClientResourceType): string {
  if (type === 'github') return url.replace(/\.git\/?$/, '')
  return url
}

export function resourceEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url)
    return parsed.toString()
  } catch {
    return url
  }
}

export function isEmbeddableResource(type: ClientResourceType): boolean {
  return type === 'live_site' || type === 'staging'
}
