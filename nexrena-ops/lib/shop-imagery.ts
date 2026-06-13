import type { PortalPhotoKey } from '@/lib/portal-imagery'
import { PORTAL_IMAGES } from '@/lib/portal-imagery'
import type { PortalProduct, ServiceCategory } from '@/lib/product-catalog'

export type ShopShelfDensity = 'hero' | 'standard' | 'compact'

export type ShopCategoryVisual = {
  photo: PortalPhotoKey
  svgSrc?: string
  aisleLabel: string
  aisleNumber: number
}

export const SHOP_CATEGORY_VISUALS: Record<ServiceCategory, ShopCategoryVisual> = {
  'website-plan': {
    photo: 'hero',
    svgSrc: PORTAL_IMAGES.growthBar,
    aisleLabel: 'Front display',
    aisleNumber: 1,
  },
  'page-upgrade': {
    photo: 'websites',
    svgSrc: PORTAL_IMAGES.shopPageUpgrade,
    aisleLabel: 'Pages & layout',
    aisleNumber: 2,
  },
  'lead-conversion': {
    photo: 'request',
    aisleLabel: 'Lead & conversion',
    aisleNumber: 3,
  },
  'local-seo': {
    photo: 'schedule',
    aisleLabel: 'Local SEO',
    aisleNumber: 4,
  },
  'seo-content': {
    photo: 'websites',
    svgSrc: PORTAL_IMAGES.networkBg,
    aisleLabel: 'SEO content',
    aisleNumber: 5,
  },
  'trust-design': {
    photo: 'billing',
    aisleLabel: 'Trust & proof',
    aisleNumber: 6,
  },
  copywriting: {
    photo: 'messages',
    aisleLabel: 'Copy & content',
    aisleNumber: 7,
  },
  automation: {
    photo: 'auth',
    svgSrc: PORTAL_IMAGES.infrastructure,
    aisleLabel: 'Automation',
    aisleNumber: 8,
  },
  branding: {
    photo: 'files',
    aisleLabel: 'Branding',
    aisleNumber: 9,
  },
  advanced: {
    photo: 'files',
    svgSrc: PORTAL_IMAGES.infrastructure,
    aisleLabel: 'Scoped projects',
    aisleNumber: 10,
  },
}

const SHORT_TITLES: Record<string, string> = {
  'plan-launch': 'Launch',
  'plan-growth': 'Growth',
  'plan-lead-engine': 'Lead Engine',
}

export function shopShortTitle(product: PortalProduct): string {
  if (SHORT_TITLES[product.sku]) return SHORT_TITLES[product.sku]
  return product.name
    .replace(/\s+Website Plan$/i, '')
    .replace(/\s+—.*$/, '')
    .trim()
}

export function shopBenefit(product: PortalProduct): string {
  if (product.bestFor) {
    const line = product.bestFor.split('.')[0]?.trim()
    if (line) return line.endsWith('.') ? line : `${line}.`
  }
  return product.included[0] ?? product.scopeBoundary.split('.')[0] ?? ''
}

export function shopShelfDensity(product: PortalProduct): ShopShelfDensity {
  if (product.tier === 'plan') return 'hero'
  if (product.tier === 'advanced' || !product.checkoutEnabled) return 'compact'
  return 'standard'
}

export function shopPriceHint(product: PortalProduct): string {
  if (product.tier === 'plan') return 'Monthly · 12-month minimum'
  if (product.tier === 'upgrade' && product.kind === 'recurring') return 'Monthly add-on'
  if (product.tier === 'upgrade' && product.kind === 'one_time') return 'One-time order'
  return 'Quote required'
}
