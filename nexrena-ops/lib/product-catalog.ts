export type PortalProduct = {
  sku: string
  name: string
  description: string
  category: 'website' | 'seo' | 'extension'
  kind: 'one_time' | 'recurring'
  priceLabel: string
  priceCents: number
  interval: string | null
  features: string[]
  badge: string | null
}

export const SHOP_CATEGORY_LABELS: Record<PortalProduct['category'], string> = {
  website: 'Buy a website',
  seo: 'SEO content packages',
  extension: 'Renewable extensions',
}

export const SHOP_CATEGORY_HINTS: Record<PortalProduct['category'], string> = {
  website: 'Own your site outright — one payment, full build and launch.',
  seo: 'Monthly blog and content bundles to grow search traffic.',
  extension: 'Add pages or content on top of your plan — billed monthly, cancel after 3 months.',
}
