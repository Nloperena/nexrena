import type { ClientResource } from '@prisma/client'

export const RESOURCE_TYPES = new Set(['github', 'live_site', 'staging'])

export function serializeClientResource(row: ClientResource) {
  return {
    id: row.id,
    contactId: row.contactId,
    type: row.type,
    title: row.title,
    url: row.url,
    description: row.description,
    relatedInvoiceId: row.relatedInvoiceId,
    createdAt: row.createdAt.toISOString(),
  }
}

export function parseResourceBody(body: Record<string, unknown>) {
  const type = typeof body.type === 'string' ? body.type.trim() : ''
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const url = typeof body.url === 'string' ? body.url.trim() : ''
  const description = typeof body.description === 'string'
    ? body.description.trim().slice(0, 500) || null
    : body.description === null ? null : undefined
  const contactId = typeof body.contactId === 'string' ? body.contactId.trim() : ''
  const relatedInvoiceId = typeof body.relatedInvoiceId === 'string'
    ? body.relatedInvoiceId.trim() || null
    : body.relatedInvoiceId === null ? null : undefined

  return { type, title, url, description, contactId, relatedInvoiceId }
}

export function validateResourceFields(fields: ReturnType<typeof parseResourceBody>, requireContact = true) {
  if (requireContact && !fields.contactId) return 'contactId is required'
  if (!fields.type || !RESOURCE_TYPES.has(fields.type)) {
    return 'type must be github, live_site, or staging'
  }
  if (!fields.title) return 'title is required'
  if (!fields.url) return 'url is required'
  try {
    const parsed = new URL(fields.url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return 'url must use http or https'
  } catch {
    return 'url must be a valid URL'
  }
  return null
}

export function githubBrowseUrl(url: string): string {
  return url.replace(/\.git\/?$/, '')
}
