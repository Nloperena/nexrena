export type ServiceTier = 'plan' | 'upgrade' | 'advanced'

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

export type ServiceKind = 'one_time' | 'recurring'

export type CatalogService = {
  sku: string
  name: string
  tier: ServiceTier
  category: ServiceCategory
  priceLabel: string
  /** Cents for checkout; null = scoped / quote required */
  priceCents: number | null
  kind: ServiceKind
  interval?: 'monthly'
  bestFor?: string
  included: string[]
  notIncluded: string[]
  scopeBoundary: string
  badge?: string
  checkoutEnabled: boolean
  projectType: 'web' | 'seo' | 'hosting'
}

export const UNIVERSAL_SCOPE_LANGUAGE =
  'Nexrena website plans include the website foundation: design, hosting, maintenance, mobile optimization, contact forms, and basic SEO setup. Additional pages, copywriting, SEO content, booking tools, automations, ecommerce, integrations, and custom features are available as service add-ons or scoped projects. Each service includes only the items listed in its description. Work outside the listed scope requires a separate service order, add-on, or written quote.'

export const PUBLIC_CATEGORY_SUMMARY: Array<{
  id: ServiceCategory | 'website-plan'
  label: string
  summary: string
}> = [
  { id: 'website-plan', label: 'Website Plan', summary: 'Monthly foundation: design, hosting, edits, maintenance, forms, and basic SEO.' },
  { id: 'page-upgrade', label: 'Page Upgrades', summary: 'Add pages, service pages, landing pages, or sales pages.' },
  { id: 'lead-conversion', label: 'Lead Upgrades', summary: 'Booking, quote forms, auto-replies, call tracking, or lead routing.' },
  { id: 'local-seo', label: 'SEO Upgrades', summary: 'Local pages, Google Business cleanup, metadata, and SEO content.' },
  { id: 'trust-design', label: 'Trust Upgrades', summary: 'Reviews, galleries, FAQs, pricing sections, and before/after proof.' },
  { id: 'copywriting', label: 'Content Upgrades', summary: 'Copywriting, blog posts, rewrites, and website content.' },
  { id: 'seo-content', label: 'SEO Content Pages', summary: 'Repeatable SEO page bundles for service areas and blogs.' },
  { id: 'automation', label: 'Automation', summary: 'Form routing, CRM connections, and workflow setup.' },
  { id: 'branding', label: 'Branding', summary: 'Logo, colors, fonts, and social profile graphics.' },
  { id: 'advanced', label: 'Scoped Projects', summary: 'Ecommerce, portals, dashboards, custom apps, and integrations.' },
]
