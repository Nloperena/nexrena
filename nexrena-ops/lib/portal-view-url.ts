import type { ClientPortalView } from '@/components/client-nav'

const VALID_VIEWS = new Set<ClientPortalView>([
  'home',
  'shop',
  'billing',
  'messages',
  'schedule',
  'files',
  'websites',
  'forms',
  'requests',
  'settings',
])

export function isPortalView(value: string | null | undefined): value is ClientPortalView {
  return Boolean(value && VALID_VIEWS.has(value as ClientPortalView))
}

export function readPortalViewFromUrl(): ClientPortalView {
  if (typeof window === 'undefined') return 'home'
  const view = new URLSearchParams(window.location.search).get('view')
  return isPortalView(view) ? view : 'home'
}

export function writePortalViewToUrl(view: ClientPortalView) {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  if (view === 'home') url.searchParams.delete('view')
  else url.searchParams.set('view', view)
  const next = `${url.pathname}${url.search}${url.hash}`
  if (`${window.location.pathname}${window.location.search}${window.location.hash}` !== next) {
    window.history.replaceState(null, '', next)
  }
}

export function readPortalShopParams(): {
  sku: string | null
  category: string | null
  purchased: boolean | null
} {
  if (typeof window === 'undefined') return { sku: null, category: null, purchased: null }
  const params = new URLSearchParams(window.location.search)
  const purchased = params.get('purchased')
  return {
    sku: params.get('sku'),
    category: params.get('category'),
    purchased: purchased === '1' ? true : purchased === '0' ? false : null,
  }
}
