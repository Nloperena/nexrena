export interface Service {
  id: string;
  number: string;
  title: string;
  body: string;
  tags: string[];
  intro: string;
  idealFor: string[];
  deliverables: string[];
  outcomes: Array<{
    metric: string;
    detail: string;
  }>;
  processHook: string;
  cta: {
    label: string;
    helper: string;
  };
}

export const services: Service[] = [
  {
    id: 'web-design',
    number: '01',
    title: 'Web Design\n& Development',
    body: 'From brand-new builds to full platform migrations. We design and engineer sites that convert visitors into buyers — fast, accessible, and built to scale.',
    tags: ['Next.js', 'Headless', 'Shopify', 'Astro'],
    intro: 'For B2B teams outgrowing brochure sites and slow CMS setups, we build conversion infrastructure that sales teams can actually use.',
    idealFor: [
      'Manufacturers with complex catalogs and technical buyers',
      'E-commerce brands migrating to a faster, headless stack',
      'Service firms needing a clearer lead-to-revenue funnel'
    ],
    deliverables: [
      'Editorial UX architecture and conversion-first page systems',
      'Performance engineering targeting 90+ Lighthouse scores',
      'CMS implementation with governance for marketing teams',
      'Analytics instrumentation for funnel-level decision making'
    ],
    outcomes: [
      { metric: '3x faster page load', detail: 'Measured after migration from legacy CMS stacks' },
      { metric: 'Higher lead quality', detail: 'Forms and paths tuned for qualified intent' },
      { metric: 'Lower maintenance overhead', detail: 'Clean components and predictable publishing workflow' }
    ],
    processHook: 'Discovery to first production-ready page in 3 weeks, then scale in weekly sprints.',
    cta: {
      label: 'Plan your rebuild',
      helper: 'Share your current stack and growth targets.'
    }
  },
  {
    id: 'seo-growth',
    number: '02',
    title: 'SEO &\nSearch Growth',
    body: "Rank for what your buyers search. We build content architecture and technical SEO that compounds — delivering leads you don't pay for.",
    tags: ['Technical SEO', 'Content Strategy', 'Analytics'],
    intro: 'Search growth for B2B is an operating system, not a blog checklist. We engineer technical foundations and content maps that compound every quarter.',
    idealFor: [
      'Companies with strong offers but weak organic visibility',
      'Teams relying too heavily on paid acquisition',
      'Brands entering new verticals with no topic authority'
    ],
    deliverables: [
      'Technical SEO audit with prioritized implementation roadmap',
      'Buyer-intent content architecture and internal linking model',
      'On-page optimization standards for templates and new pages',
      'Measurement dashboards tied to leads and pipeline'
    ],
    outcomes: [
      { metric: 'Compounding visibility', detail: 'Topic clusters built for durable rankings' },
      { metric: 'Lower CAC pressure', detail: 'Qualified traffic without paying for every click' },
      { metric: 'Faster content velocity', detail: 'Clear briefs and templates reduce editorial drag' }
    ],
    processHook: 'Week 1 baseline audit, week 2 implementation priorities, week 3 onward execution cadence.',
    cta: {
      label: 'Start a search audit',
      helper: 'Get the first 90 days mapped before publishing more pages.'
    }
  },
  {
    id: 'full-service',
    number: '03',
    title: 'Full-Service\nGrowth',
    body: 'Strategy, design, development, and SEO under one roof. For companies who want one partner, not four vendors.',
    tags: ['Strategy', 'Design', 'Dev', 'SEO'],
    intro: 'When growth is blocked by fragmented execution, we run web, search, and conversion as one integrated system.',
    idealFor: [
      'Founder-led teams that need one accountable partner',
      'Companies in a rebrand and rebuild cycle',
      'Businesses scaling into multi-market demand generation'
    ],
    deliverables: [
      'Quarterly growth strategy and KPI framework',
      'Unified design + engineering + SEO delivery',
      'Monthly reporting tied to revenue outcomes',
      'Continuous optimization backlog across channels'
    ],
    outcomes: [
      { metric: 'Single accountable team', detail: 'No handoff gaps between strategy and execution' },
      { metric: 'Faster decision cycles', detail: 'One roadmap across design, dev, and growth' },
      { metric: 'Compounding performance', detail: 'Every sprint improves both UX and acquisition' }
    ],
    processHook: 'A shared operating cadence with weekly delivery and monthly growth reviews.',
    cta: {
      label: 'Talk full-service partnership',
      helper: 'We will map scope, sequencing, and expected outcomes.'
    }
  }
];
