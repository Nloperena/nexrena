import type { ServiceRequest } from '@/lib/types'

const PAYLOAD_KEYS = [
  'contactId',
  'projectType',
  'description',
  'budget',
  'timeline',
  'status',
  'internalNotes',
  'source',
] as const satisfies readonly (keyof ServiceRequest)[]

export function toServiceRequestPayload(sub: Partial<ServiceRequest>) {
  const payload: Record<string, unknown> = {}
  for (const key of PAYLOAD_KEYS) {
    if (sub[key] !== undefined) payload[key] = sub[key]
  }
  return payload
}

export function mergeServiceRequestRow(
  apiRow: ServiceRequest,
  existing?: ServiceRequest,
): ServiceRequest {
  return {
    ...apiRow,
    contactName: apiRow.contactName ?? existing?.contactName,
    contactCompany: apiRow.contactCompany ?? existing?.contactCompany,
    contactEmail: apiRow.contactEmail ?? existing?.contactEmail,
    assets: apiRow.assets ?? existing?.assets,
  }
}

export const SERVICE_REQUEST_PROJECT_TYPES = [
  { value: 'web', label: 'Website' },
  { value: 'seo', label: 'Growth / SEO' },
  { value: 'hosting', label: 'Support / Hosting' },
  { value: 'strategy', label: 'Strategy' },
  { value: 'both', label: 'Web + SEO' },
  { value: 'other', label: 'Other' },
] as const

export const SERVICE_REQUEST_STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'reviewing', label: 'Reviewing' },
  { value: 'quoted', label: 'Quoted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'declined', label: 'Declined' },
  { value: 'closed', label: 'Closed' },
] as const
