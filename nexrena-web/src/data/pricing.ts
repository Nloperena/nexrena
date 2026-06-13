export type EngagementModel = 'project' | 'waas';

export const engagementModels: Array<{
  id: EngagementModel;
  label: string;
  description: string;
}> = [
  {
    id: 'project',
    label: 'One-time project',
    description: 'Fixed-scope website build, redesign, or SEO engagement.',
  },
  {
    id: 'waas',
    label: 'Website as a Service (WaaS)',
    description: 'Managed website — design, hosting, updates, and ongoing care for one monthly price.',
  },
];

export const waasPageCopy = {
  hero: {
    title: 'A website that stays maintained, updated, and ready for customers.',
    subtitle:
      'Nexrena builds and manages modern websites for small businesses — without the upfront build cost, hosting headaches, or “launch and forget” cycle.',
  },
  pain: {
    eyebrow: 'The problem',
    headline: 'Most websites are launched and forgotten.',
    body: [
      'They look fine at first. Then nobody updates them. Nobody checks speed. Nobody fixes broken sections. Nobody improves SEO.',
      'Eventually the site stops helping the business grow — but hosting bills and maintenance requests keep showing up.',
    ],
  },
  positioning: {
    eyebrow: 'Website + care',
    headline: 'Not just a website. A managed online presence.',
    body:
      'Your website should not be a one-time project that gets abandoned after launch. Nexrena gives you a professionally built site with hosting, updates, support, SEO basics, performance monitoring, and ongoing improvements included — so you focus on running your business while we keep your site working, improving, and ready for customers.',
  },
  valueAnchor: {
    headline: 'One predictable monthly price — instead of a big upfront bill plus surprise costs later.',
    body:
      'A normal small-business website often costs $1,500–$5,000 upfront. Then hosting, edits, fixes, and maintenance are separate. Nexrena Website-as-a-Service gives you a managed website for one monthly price — no huge upfront cost, 12-month minimum.',
  },
  included: {
    eyebrow: 'What is included',
    headline: 'Everything you need to look trustworthy online',
    items: [
      'Custom website design',
      'Mobile-first build',
      'Hosting included',
      'Security and maintenance',
      'Monthly edits',
      'Basic SEO setup',
      'Speed optimization',
      'Contact forms / lead capture',
      'Analytics setup',
      'Ongoing support',
    ],
  },
  audience: {
    eyebrow: 'Who this is for',
    headline: 'Built for local and small businesses that need more than a template',
    items: [
      { title: 'Local service businesses', detail: 'Contractors, clinics, salons, and shops that need a clean, credible web presence.' },
      { title: 'Growing teams', detail: 'Businesses ready to turn their website into a steady source of leads — not just a brochure.' },
      { title: 'Owners who hate tech', detail: 'No time for hosting dashboards, plugin updates, or chasing freelancers for small fixes.' },
    ],
  },
  comparison: {
    eyebrow: 'Compare',
    headline: 'Traditional website vs Nexrena monthly plan',
    traditional: [
      '$1,500–$8,000+ upfront for design and build',
      'Hosting billed separately',
      'Edits and fixes quoted per request',
      'SEO and speed often “extra”',
      'Site goes stale after launch',
    ],
    nexrena: [
      'No huge upfront build fee',
      'Hosting and maintenance included',
      'Monthly edits built into your plan',
      'SEO basics and performance care included',
      'Ongoing support — site keeps improving',
    ],
  },
} as const;

export const waasTiers = [
  {
    id: 'waas-starter',
    name: 'Starter',
    priceLabel: '$149',
    priceSuffix: '/mo',
    budgetValue: '149/mo',
    tagline: 'For simple local businesses that need a clean online presence.',
    minimum: '12-month minimum',
    recommended: false,
    features: [
      '1–3 page website',
      'Hosting included',
      'Mobile-first design',
      'Contact form',
      'Basic SEO setup',
      '30 minutes of edits per month',
    ],
  },
  {
    id: 'waas-growth',
    name: 'Growth',
    priceLabel: '$249',
    priceSuffix: '/mo',
    budgetValue: '249/mo',
    tagline: 'For businesses that want their website to actually bring in leads.',
    minimum: '12-month minimum · Recommended',
    recommended: true,
    features: [
      'Everything in Starter',
      'Up to 5 pages',
      'Stronger homepage sections',
      'Google Business Profile guidance',
      'Monthly content & update support',
      'Basic analytics',
      '1 hour of edits per month',
    ],
  },
  {
    id: 'waas-pro',
    name: 'Pro',
    priceLabel: '$399',
    priceSuffix: '/mo+',
    budgetValue: '399/mo',
    tagline: 'For businesses that need more serious marketing support.',
    minimum: '12-month minimum',
    recommended: false,
    features: [
      'Everything in Growth',
      'Service & location pages',
      'Blog or SEO page support',
      'Conversion improvements',
      'Priority support',
      '2 hours of edits per month',
    ],
  },
] as const;

export const waasPricingFaq = [
  {
    id: 'waas-setup-fee',
    question: 'Is there a setup fee?',
    answer:
      'Our standard WaaS plans have no huge upfront build fee — just a simple monthly website care plan with a 12-month minimum. If you need a custom scope beyond your tier, we will quote it clearly before you commit.',
  },
  {
    id: 'waas-minimum',
    question: 'Why a 12-month minimum?',
    answer:
      'A great website is built and improved over time — not abandoned after launch. The minimum lets us invest properly in your design, setup, and first months of care without relying on a large upfront project fee.',
  },
  {
    id: 'waas-edits',
    question: 'What counts as a monthly edit?',
    answer:
      'Copy changes, photo swaps, hours updates, new team members, minor layout tweaks, and small section adjustments. Larger new pages or features may be scoped separately or covered under Pro.',
  },
  {
    id: 'waas-vs-diy',
    question: 'How is this different from Wix or Squarespace?',
    answer:
      'DIY builders are cheap but you do the work — design, setup, updates, and fixes. Nexrena is a managed service: we design, build, host, maintain, and support your site so it stays fast, secure, and effective.',
  },
  {
    id: 'waas-cancel',
    question: 'What if I need to cancel?',
    answer:
      'After your 12-month minimum, you can cancel with 30 days notice. You can also purchase your website source files for a one-time export fee if you want to move off WaaS — ask us for details.',
  },
] as const;

export const projectBuildTiers = [
  {
    id: 'starter',
    name: 'Starter',
    price: '$10,000–$15,000',
    scope: '5–7 pages, modern design, mobile-first, CMS',
    timeline: '6–8 weeks',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: '$15,000–$30,000',
    scope: '10–20 pages, conversion architecture, headless CMS',
    timeline: '8–12 weeks',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: '$30,000–$50,000+',
    scope: 'Full rebuild, e-commerce or portal, custom integrations',
    timeline: '10–16 weeks',
  },
] as const;

export const pricingTransparency = {
  headline: 'Simple monthly website care plans.',
  subhead:
    'Website, hosting, edits, maintenance, and support — one predictable price. No “contact us for a quote” on standard WaaS tiers.',
  billingNote: 'All WaaS plans billed monthly · 12-month minimum · Cancel with 30 days notice after minimum',
  projectNote: 'Need a larger custom build? One-time projects are scoped separately — 50% to start, 50% at launch.',
} as const;

export const projectBudgetOptions = [
  { value: '10k-25k', label: '$10k – $25k' },
  { value: '25k-50k', label: '$25k – $50k' },
  { value: '50k+', label: '$50k+' },
] as const;

export const projectTypeOptions = [
  { value: 'web-design', label: 'Web Design & Development' },
  { value: 'seo', label: 'SEO & Growth' },
  { value: 'full-service', label: 'Full-Service' },
] as const;

export function formatLeadPlanLabel(projectType?: string | null, budget?: string | null) {
  if (projectType?.startsWith('waas-')) {
    const tier = waasTiers.find((t) => t.id === projectType);
    return tier ? `WaaS · ${tier.name} (${tier.priceLabel}${tier.priceSuffix})` : 'WaaS';
  }
  const type = projectTypeOptions.find((t) => t.value === projectType);
  const budgetOption = projectBudgetOptions.find((b) => b.value === budget);
  if (type && budgetOption) return `${type.label} · ${budgetOption.label}`;
  if (type) return type.label;
  if (budgetOption) return budgetOption.label;
  return 'Not specified';
}
