import type { Subscription } from '@/lib/types'

const PAYLOAD_KEYS = [
  'contactId',
  'description',
  'amount',
  'interval',
  'status',
  'billingDay',
  'nextBillingDate',
  'skipNext',
  'netTerms',
  'notes',
  'createdAt',
] as const satisfies readonly (keyof Subscription)[]

/** Fields accepted by the subscriptions API (excludes joined contactName/contactCompany). */
export function toSubscriptionPayload(sub: Partial<Subscription> & { id?: string }) {
  const payload: Record<string, unknown> = {}
  if (sub.id) payload.id = sub.id
  for (const key of PAYLOAD_KEYS) {
    if (sub[key] !== undefined) payload[key] = sub[key]
  }
  return payload
}

export function mergeSubscriptionRow(
  apiRow: Subscription,
  existing?: Subscription,
): Subscription {
  return {
    ...apiRow,
    contactName: existing?.contactName ?? apiRow.contactName,
    contactCompany: existing?.contactCompany ?? apiRow.contactCompany,
  }
}
