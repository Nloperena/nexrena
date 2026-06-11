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
    description: 'Monthly partnership — site, hosting, updates, and ongoing growth.',
  },
];

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

export const waasTiers = [
  {
    id: 'waas-essentials',
    name: 'Essentials',
    priceLabel: '$3,000',
    priceSuffix: '/mo',
    budgetValue: '3000/mo',
    tagline: 'Keep the site healthy and improving without hiring in-house.',
    includes: 'Maintenance, analytics, 2 content updates/mo, minor site changes',
    minimum: '3-month minimum',
    recommended: false,
    features: [
      'Hosting, SSL, and uptime monitoring',
      'Security patches & dependency updates',
      'Monthly analytics snapshot',
      '2 content or copy updates per month',
      'Minor design tweaks & bug fixes',
      'Email support · 1 business day response',
    ],
  },
  {
    id: 'waas-growth',
    name: 'Growth',
    priceLabel: '$5,000',
    priceSuffix: '/mo',
    budgetValue: '5000/mo',
    tagline: 'For teams that want the site to actively drive pipeline.',
    includes: 'Essentials + SEO optimization, A/B testing, quarterly roadmap',
    minimum: '3-month minimum',
    recommended: true,
    features: [
      'Everything in Essentials',
      'Technical SEO & on-page optimization',
      'Conversion experiments (A/B tests)',
      'Quarterly growth roadmap session',
      'Landing page iterations',
      'Priority support · same-day triage',
    ],
  },
  {
    id: 'waas-strategic',
    name: 'Strategic',
    priceLabel: '$8,000',
    priceSuffix: '/mo',
    budgetValue: '8000/mo',
    tagline: 'Senior operator embedded — new features, not just maintenance.',
    includes: 'Growth + new feature development, paid media coordination',
    minimum: '3-month minimum',
    recommended: false,
    features: [
      'Everything in Growth',
      'New features & sections shipped monthly',
      'Paid media landing page coordination',
      'CMS workflow & team training',
      'Dedicated Slack channel',
      'Monthly strategy call with founder',
    ],
  },
] as const;

export const pricingTransparency = {
  headline: 'Transparent pricing. No “contact us for a quote.”',
  subhead:
    'Monthly WaaS plans include hosting, updates, and senior execution — billed monthly with a 3-month minimum. One-time builds are scoped before we invoice.',
  billingNote: 'All WaaS plans billed monthly · 3-month minimum · Cancel with 30 days notice after minimum',
  projectNote: 'One-time projects: 50% to start, 50% at launch unless otherwise scoped.',
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
