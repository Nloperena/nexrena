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

export function resourceActionLabel(type: ClientResourceType): string {
  if (type === 'github') return 'Open on GitHub'
  if (type === 'live_site') return 'Visit live site'
  return 'Open staging site'
}

export function resourceBrowseUrl(url: string, type: ClientResourceType): string {
  if (type === 'github') return url.replace(/\.git\/?$/, '')
  return url
}
