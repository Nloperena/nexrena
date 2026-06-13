import type { CatalogService, ServiceCategory } from './types'
import { WEBSITE_PLANS } from './plans'
import { PAGE_UPGRADES, SEO_CONTENT_BUNDLES } from './pages-seo'
import { COPYWRITING, LEAD_CONVERSION } from './copy-lead'
import { TRUST_DESIGN, LOCAL_SEO } from './trust-local'
import { AUTOMATION, BRANDING, ADVANCED_PROJECTS } from './automation-advanced'

export * from './types'
export { WEBSITE_PLANS } from './plans'

export const SERVICE_CATALOG: CatalogService[] = [
  ...WEBSITE_PLANS,
  ...PAGE_UPGRADES,
  ...SEO_CONTENT_BUNDLES,
  ...COPYWRITING,
  ...LEAD_CONVERSION,
  ...TRUST_DESIGN,
  ...LOCAL_SEO,
  ...AUTOMATION,
  ...BRANDING,
  ...ADVANCED_PROJECTS,
]

export const CATEGORY_ORDER: ServiceCategory[] = [
  'website-plan',
  'page-upgrade',
  'lead-conversion',
  'local-seo',
  'seo-content',
  'trust-design',
  'copywriting',
  'automation',
  'branding',
  'advanced',
]

export function getCatalogService(sku: string): CatalogService | undefined {
  return SERVICE_CATALOG.find((s) => s.sku === sku)
}

export function listCatalogServices(category?: ServiceCategory): CatalogService[] {
  if (!category) return SERVICE_CATALOG
  return SERVICE_CATALOG.filter((s) => s.category === category)
}

export function catalogServiceForClient(service: CatalogService) {
  return {
    sku: service.sku,
    name: service.name,
    tier: service.tier,
    category: service.category,
    priceLabel: service.priceLabel,
    priceCents: service.priceCents,
    kind: service.kind,
    interval: service.interval ?? null,
    bestFor: service.bestFor ?? null,
    included: service.included,
    notIncluded: service.notIncluded,
    scopeBoundary: service.scopeBoundary,
    badge: service.badge ?? null,
    checkoutEnabled: service.checkoutEnabled,
  }
}

/** @deprecated Use getCatalogService */
export const getCatalogProduct = getCatalogService

/** @deprecated Use listCatalogServices */
export const listCatalogProducts = listCatalogServices

/** @deprecated Use SERVICE_CATALOG */
export const PRODUCT_CATALOG = SERVICE_CATALOG

/** @deprecated Use catalogServiceForClient */
export const catalogProductForClient = catalogServiceForClient

export type { CatalogService as CatalogProduct }
