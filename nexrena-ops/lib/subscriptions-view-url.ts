import type { SubscriptionStatus } from '@/lib/types'

export type SubscriptionViewFilter = 'all' | SubscriptionStatus

export function readSubscriptionFilterFromUrl(): SubscriptionViewFilter {
  if (typeof window === 'undefined') return 'all'
  const status = new URLSearchParams(window.location.search).get('status')
  if (status === 'active' || status === 'paused' || status === 'cancelled') return status
  return 'all'
}

export function writeSubscriptionFilterToUrl(filter: SubscriptionViewFilter) {
  const url = new URL(window.location.href)
  if (filter === 'all') url.searchParams.delete('status')
  else url.searchParams.set('status', filter)
  window.history.replaceState(null, '', `${url.pathname}${url.search}${url.hash}`)
}

const EXPANDED_KEY = 'nx-subscriptions-expanded'

export function readExpandedClientGroups(): Record<string, boolean> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = sessionStorage.getItem(EXPANDED_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, boolean>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function writeExpandedClientGroups(expanded: Record<string, boolean>) {
  try {
    sessionStorage.setItem(EXPANDED_KEY, JSON.stringify(expanded))
  } catch {
    // ignore quota errors
  }
}
