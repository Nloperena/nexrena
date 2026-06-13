export type ProductCategory = 'website' | 'seo' | 'extension'
export type ProductKind = 'one_time' | 'recurring'

export type CatalogProduct = {
  sku: string
  name: string
  description: string
  category: ProductCategory
  kind: ProductKind
  priceCents: number
  priceLabel: string
  interval?: 'monthly' | 'quarterly' | 'annually'
  features: string[]
  badge?: string
  projectType: string
}

export const PRODUCT_CATALOG: CatalogProduct[] = [
  {
    sku: 'website-buy-starter',
    name: 'Website — Starter',
    description: 'Outright purchase of a professional 5-page business website.',
    category: 'website',
    kind: 'one_time',
    priceCents: 199_900,
    priceLabel: '$1,999',
    features: [
      'Up to 5 custom pages',
      'Mobile-first design',
      'Contact & lead forms',
      'Basic SEO setup',
      'Launch support',
    ],
    projectType: 'web',
  },
  {
    sku: 'website-buy-growth',
    name: 'Website — Growth',
    description: 'Conversion-focused site for businesses ready to generate leads.',
    category: 'website',
    kind: 'one_time',
    priceCents: 349_900,
    priceLabel: '$3,499',
    badge: 'Popular',
    features: [
      'Up to 10 custom pages',
      'Stronger homepage sections',
      'Service & location pages',
      'Analytics setup',
      'Priority launch timeline',
    ],
    projectType: 'web',
  },
  {
    sku: 'website-buy-pro',
    name: 'Website — Pro',
    description: 'Full build with blog foundation and advanced SEO structure.',
    category: 'website',
    kind: 'one_time',
    priceCents: 599_900,
    priceLabel: '$5,999',
    features: [
      'Up to 15 custom pages',
      'Blog or resource hub setup',
      'Advanced SEO foundation',
      'Conversion optimization pass',
      'Dedicated project manager',
    ],
    projectType: 'web',
  },
  {
    sku: 'seo-bundle-starter',
    name: 'SEO Content — Starter',
    description: 'Monthly blog content to build search visibility.',
    category: 'seo',
    kind: 'recurring',
    priceCents: 49_900,
    priceLabel: '$499/mo',
    interval: 'monthly',
    features: [
      '2 SEO blog posts per month',
      'Keyword research',
      'On-page optimization',
      'Monthly performance snapshot',
    ],
    projectType: 'seo',
  },
  {
    sku: 'seo-bundle-growth',
    name: 'SEO Content — Growth',
    description: 'More content plus ongoing on-page SEO improvements.',
    category: 'seo',
    kind: 'recurring',
    priceCents: 89_900,
    priceLabel: '$899/mo',
    interval: 'monthly',
    badge: 'Recommended',
    features: [
      '4 SEO blog posts per month',
      'On-page SEO updates',
      'Internal linking strategy',
      'Monthly reporting call',
    ],
    projectType: 'seo',
  },
  {
    sku: 'seo-bundle-authority',
    name: 'SEO Content — Authority',
    description: 'High-volume content program for competitive markets.',
    category: 'seo',
    kind: 'recurring',
    priceCents: 149_900,
    priceLabel: '$1,499/mo',
    interval: 'monthly',
    features: [
      '8 SEO blog posts per month',
      'Content strategy & calendar',
      'Topic cluster planning',
      'Priority support',
    ],
    projectType: 'seo',
  },
  {
    sku: 'ext-pages-pack-3',
    name: 'Extra Pages — 3 pack',
    description: 'Renewable add-on: up to 3 additional pages on your site each month.',
    category: 'extension',
    kind: 'recurring',
    priceCents: 4900,
    priceLabel: '$49/mo',
    interval: 'monthly',
    features: [
      'Up to 3 new or updated pages',
      'Design-matched to your site',
      'Copy placement & formatting',
      'Cancel anytime after 3 months',
    ],
    projectType: 'web',
  },
  {
    sku: 'ext-pages-pack-5',
    name: 'Extra Pages — 5 pack',
    description: 'Renewable add-on: up to 5 additional pages per billing cycle.',
    category: 'extension',
    kind: 'recurring',
    priceCents: 7900,
    priceLabel: '$79/mo',
    interval: 'monthly',
    features: [
      'Up to 5 new or updated pages',
      'Service, location, or landing pages',
      'Mobile optimization included',
      'Cancel anytime after 3 months',
    ],
    projectType: 'web',
  },
  {
    sku: 'ext-content-boost',
    name: 'Content Boost add-on',
    description: 'Renewable add-on: 2 extra blog posts per month on top of your SEO plan.',
    category: 'extension',
    kind: 'recurring',
    priceCents: 19_900,
    priceLabel: '$199/mo',
    interval: 'monthly',
    features: [
      '2 additional blog posts per month',
      'Stacks with any SEO bundle',
      'Same keyword & QA process',
      'Cancel anytime after 3 months',
    ],
    projectType: 'seo',
  },
]

export function getCatalogProduct(sku: string): CatalogProduct | undefined {
  return PRODUCT_CATALOG.find((p) => p.sku === sku)
}

export function listCatalogProducts(category?: ProductCategory): CatalogProduct[] {
  if (!category) return PRODUCT_CATALOG
  return PRODUCT_CATALOG.filter((p) => p.category === category)
}

export function catalogProductForClient(product: CatalogProduct) {
  return {
    sku: product.sku,
    name: product.name,
    description: product.description,
    category: product.category,
    kind: product.kind,
    priceLabel: product.priceLabel,
    priceCents: product.priceCents,
    interval: product.interval ?? null,
    features: product.features,
    badge: product.badge ?? null,
  }
}
