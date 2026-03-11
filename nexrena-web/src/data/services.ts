export interface Service {
  id: string;
  number: string;
  title: string;
  body: string;
  metaDescription?: string;
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
  // Expanded data for detailed service pages
  heroSubtitle?: string;
  problem?: {
    statement: string;
    agitation: string;
  };
  features?: Array<{
    title: string;
    desc: string;
  }>;
  process?: Array<{
    phase: string;
    title: string;
    desc: string;
  }>;
  faq?: Array<{
    q: string;
    a: string;
  }>;
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
    },
    heroSubtitle: 'Engineering high-performance digital experiences that act as your best salesperson. We bridge the gap between stunning design and relentless conversion.',
    problem: {
      statement: 'Your website looks like a brochure, but you need a machine.',
      agitation: 'Most B2B websites are digital business cards. They look fine but fail to guide technical buyers, load too slowly to capture attention, and leave your sales team scrambling to explain what you actually do. You don\'t need a facelift; you need an upgrade.'
    },
    features: [
      { title: 'Conversion Architecture', desc: 'Every component is engineered to guide users toward an action, reducing friction in complex B2B buying journeys.' },
      { title: 'Headless Performance', desc: 'Sub-second load times using Astro and Next.js. Fast sites rank better and convert more consistently.' },
      { title: 'Scalable Design Systems', desc: 'Stop redesigning every three years. We build modular systems that grow as your company expands.' }
    ],
    process: [
      { phase: '01', title: 'UX & Content Audit', desc: 'We tear down your current analytics to find where users drop off and rebuild the user journey from the ground up.' },
      { phase: '02', title: 'System Design', desc: 'Establishing typography, spacing, and interaction paradigms that align with your brand\'s premium positioning.' },
      { phase: '03', title: 'Development Sprints', desc: 'Transparent, weekly delivery. You see components come to life in the browser, not just in Figma.' }
    ],
    faq: [
      { q: 'How long does a typical build take?', a: 'Most core builds are completed in 6 to 8 weeks, with complex headless e-commerce taking 10 to 14 weeks.' },
      { q: 'What tech stack do you use?', a: 'We primarily build on Astro and Next.js, integrating with headless CMS platforms like Sanity, Builder, or Shopify.' }
    ],
    metaDescription: 'B2B web design and development. We build conversion-focused sites on Astro and Next.js. Fast, accessible, built to scale. Plan your rebuild.'
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
    },
    heroSubtitle: 'Capture high-intent traffic without renting it. We build SEO systems that turn your website into a compounding asset.',
    problem: {
      statement: 'You are invisible when it matters most.',
      agitation: 'Your buyers are researching solutions, but your competitors are answering their questions. Relying solely on paid ads means your growth stops the second you turn off the budget. You need an organic moat.'
    },
    features: [
      { title: 'Technical Foundations', desc: 'Fixing crawl budget, site speed, and structured data so search engines understand your value immediately.' },
      { title: 'Intent-Driven Content', desc: 'We target commercial intent, not just volume. Ranking #1 for a vanity term means nothing if it doesn\'t drive pipeline.' },
      { title: 'Authority Building', desc: 'Strategic internal linking and entity development to signal your expertise to algorithms and users alike.' }
    ],
    process: [
      { phase: '01', title: 'Technical Audit', desc: 'We identify structural blockers preventing you from ranking, delivering a prioritized fix list.' },
      { phase: '02', title: 'Content Gap Analysis', desc: 'Mapping your buyer\'s journey against current search volume to find the high-ROI topics.' },
      { phase: '03', title: 'Execution Cadence', desc: 'Ongoing optimization, brief creation, and publishing sprints to build topical authority month over month.' }
    ],
    faq: [
      { q: 'How long until we see SEO results?', a: 'While technical fixes can show improvements in weeks, compounding organic growth typically takes 3-6 months to mature.' },
      { q: 'Do you write the content?', a: 'We provide detailed, SEO-engineered briefs. We can either execute the writing with our specialists or guide your internal SMEs.' }
    ]
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
    },
    heroSubtitle: 'Eliminate vendor bloat. We fuse strategy, design, engineering, and acquisition into a single, accountable growth engine.',
    problem: {
      statement: 'Fragmented teams lead to fragmented results.',
      agitation: 'Your SEO agency blames the developers for slow speeds. The developers blame the designers for complex layouts. Meanwhile, growth stalls. When you hire specialists who don\'t talk to each other, you end up managing the chaos instead of running your business.'
    },
    features: [
      { title: 'Unified Strategy', desc: 'Design, code, and search operate from the same playbook and KPI framework.' },
      { title: 'Rapid Iteration', desc: 'Because we control the entire stack, we can deploy a conversion test, measure the SEO impact, and push a design update in the same sprint.' },
      { title: 'Radical Accountability', desc: 'One partner. One dashboard. We tie our success directly to your pipeline and revenue targets.' }
    ],
    process: [
      { phase: '01', title: 'Deep Discovery', desc: 'We align on business goals, map your unit economics, and build a 12-month integrated growth roadmap.' },
      { phase: '02', title: 'Platform Build', desc: 'We overhaul your technical infrastructure, redesigning the site for speed and conversion.' },
      { phase: '03', title: 'Growth Operations', desc: 'Continuous testing, content scaling, and paid acquisition management to drive compounding returns.' }
    ],
    faq: [
      { q: 'Who manages the day-to-day?', a: 'You get a dedicated Senior Strategist who acts as your fractional VP of Growth, coordinating our internal specialists.' },
      { q: 'How is this priced?', a: 'We operate on a flat monthly retainer based on the velocity of output required. No hourly billing surprises.' }
    ],
    metaDescription: 'Full-service digital agency. Strategy, design, development, and SEO under one roof. One partner, not four vendors. Talk full-service partnership.'
  }
];
