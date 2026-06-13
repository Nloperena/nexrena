export type ServiceCategory =
  | 'website-plan'
  | 'page-upgrade'
  | 'seo-content'
  | 'copywriting'
  | 'lead-conversion'
  | 'trust-design'
  | 'local-seo'
  | 'automation'
  | 'branding'
  | 'advanced'

export type PortalProduct = {
  sku: string
  name: string
  tier: 'plan' | 'upgrade' | 'advanced'
  category: ServiceCategory
  priceLabel: string
  priceCents: number | null
  kind: 'one_time' | 'recurring'
  interval: string | null
  bestFor: string | null
  included: string[]
  notIncluded: string[]
  scopeBoundary: string
  badge: string | null
  checkoutEnabled: boolean
}

export type PortalCatalogResponse = {
  scopeLanguage: string
  categories: ServiceCategory[]
  services: PortalProduct[]
}

export const SHOP_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  'website-plan': 'Website plans',
  'page-upgrade': 'Page upgrades',
  'seo-content': 'SEO content pages',
  copywriting: 'Copywriting',
  'lead-conversion': 'Lead & conversion',
  'trust-design': 'Trust & design',
  'local-seo': 'Local SEO',
  automation: 'Automation & integrations',
  branding: 'Branding',
  advanced: 'Scoped projects',
}

export const SHOP_CATEGORY_HINTS: Record<ServiceCategory, string> = {
  'website-plan': 'Monthly foundation — design, hosting, edits, maintenance, forms, and basic SEO.',
  'page-upgrade': 'Add pages, landing pages, or sales pages beyond your plan.',
  'seo-content': 'Repeatable SEO page bundles for service areas and blogs.',
  copywriting: 'Copy rewrites, blog posts, and full site content packs.',
  'lead-conversion': 'Forms, booking, call tracking, auto-replies, and lead routing.',
  'trust-design': 'Reviews, galleries, FAQs, pricing sections, and image packs.',
  'local-seo': 'Local setup, Google Business cleanup, and city/service pages.',
  automation: 'Notifications, CRM connections, and workflow setup.',
  branding: 'Logo, colors, fonts, and social profile graphics.',
  advanced: 'Ecommerce, portals, dashboards, and custom integrations — scoped before work starts.',
}

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

export const PUBLIC_CATEGORY_SUMMARY = [
  { id: 'website-plan' as const, label: 'Website Plan', summary: 'Your monthly website foundation.' },
  { id: 'page-upgrade' as const, label: 'Page Upgrades', summary: 'Add more pages, service pages, landing pages, or sales pages.' },
  { id: 'lead-conversion' as const, label: 'Lead Upgrades', summary: 'Booking, quote forms, auto-replies, call tracking, or lead routing.' },
  { id: 'local-seo' as const, label: 'SEO Upgrades', summary: 'Local pages, Google Business cleanup, metadata, and SEO content.' },
  { id: 'trust-design' as const, label: 'Trust Upgrades', summary: 'Reviews, galleries, FAQs, pricing sections, and before/after proof.' },
  { id: 'copywriting' as const, label: 'Content Upgrades', summary: 'Copywriting, blog posts, rewrites, and website content.' },
  { id: 'automation' as const, label: 'Automation', summary: 'Notifications, CRM connections, and workflow setup.' },
  { id: 'branding' as const, label: 'Branding', summary: 'Logo, colors, fonts, and social profile graphics.' },
  { id: 'advanced' as const, label: 'Scoped Projects', summary: 'Ecommerce, portals, dashboards, custom apps, and integrations.' },
]
