import type { KnowledgeChunk } from '../types'

export const servicesKnowledge: KnowledgeChunk[] = [
  {
    id: 'service-web-design',
    category: 'services',
    title: 'Web Design & Development',
    content:
      'High-conviction B2B builds on Astro and Next.js with headless CMS (Sanity, Builder, Shopify). Deliverables: editorial UX architecture, conversion-first page systems, 95–99 Lighthouse performance targets, CMS with marketing-team governance, analytics instrumentation. Typical timeline: 6–8 weeks for core B2B builds; 10–14 weeks for complex headless e-commerce with phased launches. Discovery to first production-ready page in ~3 weeks, then weekly sprints.',
    keywords: ['web', 'website', 'design', 'development', 'build', 'redesign', 'astro', 'next.js', 'cms', 'headless'],
    source: 'nexrena.com/services/web-design',
  },
  {
    id: 'service-seo',
    category: 'services',
    title: 'SEO & Search Growth',
    content:
      'Technical SEO that ships — not audit PDFs. Deliverables: prioritized technical audit, buyer-intent content architecture, on-page optimization standards, measurement dashboards tied to leads. Technical fixes (redirects, sitemaps, canonicals, crawlability) implemented in production. Results typically compound over 3–6 months; technical improvements can show in weeks. Can write priority pages or work with your SME writers.',
    keywords: ['seo', 'search', 'rank', 'google', 'organic', 'technical seo', 'keywords', 'content'],
    source: 'nexrena.com/services/seo-growth',
  },
  {
    id: 'service-full-service',
    category: 'services',
    title: 'Full-Service Growth',
    content:
      'Strategy, design, development, and SEO under one accountable owner — replaces fragmented vendors. Deliverables: quarterly growth strategy and KPI framework, unified design + engineering + SEO delivery, monthly reporting tied to revenue outcomes. Priced as flat monthly retainer based on output velocity — no hourly billing surprises. Best for founder-led teams, rebrand/rebuild cycles, multi-market demand generation.',
    keywords: ['full service', 'full-service', 'retainer', 'growth', 'strategy', 'partner', 'ongoing'],
    source: 'nexrena.com/services/full-service',
  },
  {
    id: 'service-waas-overview',
    category: 'services',
    title: 'Website as a Service (WaaS)',
    content:
      'Managed website for local and small businesses: custom design, hosting, SSL, security, maintenance, monthly edits, basic SEO, speed optimization, forms, analytics — one predictable monthly price with 12-month minimum. No huge upfront build fee on standard tiers. Alternative to DIY builders where you do all the work.',
    keywords: ['waas', 'website as a service', 'managed', 'monthly', 'small business', 'local'],
    source: 'nexrena.com/pricing',
  },
  {
    id: 'service-addons',
    category: 'services',
    title: 'Add-on services (portal shop)',
    content:
      'Beyond base plans: page upgrades, lead/conversion tools (booking, quote forms, call tracking), local SEO upgrades, trust sections (reviews, galleries, FAQs), copywriting, automation (CRM, notifications), branding (logo, colors), and scoped advanced projects (e-commerce, portals, dashboards, integrations). Each add-on is scoped clearly — work outside listed scope requires separate quote.',
    keywords: ['addon', 'add-on', 'upgrade', 'copywriting', 'automation', 'branding', 'landing page'],
    source: 'nexrena.com/pricing',
  },
  {
    id: 'service-platforms',
    category: 'services',
    title: 'Platforms and migrations',
    content:
      'Primary build stack: Astro, Next.js, Vercel, headless CMS. Also work with WordPress, Webflow, Shopify — assess current setup and recommend migration or improvement path. Migration best practices: preserve URLs where possible, redirect mapping, internal linking, post-launch ranking monitoring.',
    keywords: ['wordpress', 'webflow', 'shopify', 'platform', 'migrate', 'migration', 'stack'],
    source: 'nexrena.com/resources/faq',
  },
]
