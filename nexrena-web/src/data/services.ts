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
    statusQuoTitle?: string;
    shiftTitle?: string;
    statusQuoItems?: string[];
    shiftItems?: string[];
  };
  featureHeading?: string;
  outcomesHeading?: string;
  features?: Array<{
    title: string;
    desc: string;
  }>;
  processHeading?: string;
  processDescription?: string;
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
    body: 'High-conviction builds for teams that need a site they can measure, ship, and improve every month.',
    tags: ['Astro', 'Next.js', 'Sanity', 'Vercel'],
    intro: 'For B2B teams outgrowing brochureware, I build sites that are fast, measurable, and operationally maintainable.',
    idealFor: [
      'Manufacturers with complex catalogs and technical buyers',
      'E-commerce brands migrating to a faster, headless stack',
      'Service firms needing a clearer lead-to-revenue funnel'
    ],
    deliverables: [
      'Editorial UX architecture and conversion-first page systems',
      'Performance engineering targeting 95-99 Lighthouse scores',
      'CMS implementation with governance for marketing teams',
      'Analytics instrumentation for funnel-level decision making'
    ],
    outcomes: [
      { metric: 'Day 30', detail: 'Architecture doc approved, with conversion mapping across 3-5 priority buyer journeys.' },
      { metric: 'Day 60', detail: 'Homepage, key template(s), and 3-5 priority pages live with analytics and publishing workflow enabled.' },
      { metric: 'Day 90', detail: 'Optimization cycle active on live pages; extended e-commerce scopes continue on a phased launch cadence.' }
    ],
    processHook: 'Discovery to first production-ready page in 3 weeks, then scale in weekly sprints.',
    cta: {
      label: 'Request a build review',
      helper: 'Share your current stack, constraints, and goals. If there is a fit, I will map your 90-day growth plan.'
    },
    heroSubtitle: 'Production-grade B2B sites built by one senior operator. Measurable, maintainable, and designed to outlast launch.',
    problem: {
      statement: 'Your website looks like a brochure, but you need a machine.',
      agitation: 'Most redesigns ship visuals, not systems. Teams cannot measure what is working, cannot update confidently, and cannot hand off content without developer bottlenecks.',
      statusQuoTitle: 'Common failure modes',
      shiftTitle: 'How this is different',
      statusQuoItems: [
        'Pages that look polished but have no measurable conversion path',
        'CMS workflows that require technical help for simple updates',
        'Rebuilds that age quickly because nobody owns iteration',
      ],
      shiftItems: [
        'A conversion architecture tied to buyer intent',
        'A maintainable publishing system your team can operate',
        'A release workflow built for continuous improvement',
      ],
    },
    featureHeading: 'Build quality that survives launch.',
    outcomesHeading: '90-DAY DELIVERABLES',
    features: [
      { title: 'Instrumented Conversion Paths', desc: 'Key journeys are mapped, tracked, and reviewed so conversion discussions rely on data, not opinion.' },
      { title: 'Infrastructure You Can Operate', desc: 'Routing, templates, and CMS workflows are designed for non-fragile handoff so updates can ship without chaos.' },
      { title: 'Performance With Intent', desc: 'Performance effort is concentrated on homepage, category, and high-intent product/service pages where speed directly influences pipeline.' }
    ],
    processHeading: 'How this ships.',
    processDescription: 'One senior operator from strategy through implementation. No handoff tax, no vague ownership, and no black-box vendor chains.',
    process: [
      { phase: '01', title: 'Audit + Blueprint', desc: 'Current-state teardown, conversion map, and architecture decisions that de-risk build execution.' },
      { phase: '02', title: 'System Build', desc: 'Design system and templates implemented in production with performance and measurement baked in.' },
      { phase: '03', title: 'Launch + Iterate', desc: 'Go live with QA guardrails, then run weekly optimization cycles on pages that matter most.' }
    ],
    faq: [
      { q: 'How long does a typical build take?', a: 'Most core B2B builds ship in 6 to 8 weeks. Complex headless e-commerce scopes typically run 10 to 14 weeks, with phased launches and milestone-based optimization.' },
      { q: 'What tech stack do you use?', a: 'We primarily build on Astro and Next.js, integrating with headless CMS platforms like Sanity, Builder, or Shopify.' }
    ],
    metaDescription: 'B2B web design and development for teams that need measurable conversion systems. Astro and Next.js builds designed for speed, clarity, and maintainable growth.'
  },
  {
    id: 'seo-growth',
    number: '02',
    title: 'SEO &\nSearch Growth',
    body: "SEO execution for teams that need technical fixes shipped, not another audit PDF.",
    tags: ['Technical SEO', 'Content Strategy', 'Analytics'],
    intro: 'Search growth for B2B only works when strategy and implementation stay connected. I handle both.',
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
      { metric: 'Day 30', detail: 'Technical blockers, priority keywords, and implementation sequence locked' },
      { metric: 'Day 60', detail: 'High-impact fixes shipped with crawl/index validation in place' },
      { metric: 'Day 90', detail: 'Compounding content + technical cadence running with clear reporting' }
    ],
    processHook: 'Week 1 baseline audit, week 2 implementation priorities, week 3 onward execution cadence.',
    cta: {
      label: 'Start a search audit',
      helper: 'If there is a fit, I will map your 90-day growth plan before you publish another page.'
    },
    heroSubtitle: 'Capture high-intent traffic without renting it. We build SEO systems that turn your website into a compounding asset.',
    problem: {
      statement: 'You are invisible when it matters most.',
      agitation: 'Most SEO work fails because recommendations and implementation are split across teams. Audits get delivered, engineering deprioritizes fixes, and search performance stalls.',
      statusQuoTitle: 'What usually happens',
      shiftTitle: 'What happens here',
      statusQuoItems: [
        'Technical SEO reports that never make it into production',
        'Content plans disconnected from buyer-intent keywords',
        'No release verification, so regressions repeat',
      ],
      shiftItems: [
        'Technical recommendations shipped directly into the stack',
        'Content strategy tied to intent and crawlable architecture',
        'Validation workflow that catches regressions before they spread',
      ],
    },
    featureHeading: 'SEO that ships, not shelfware.',
    outcomesHeading: '90-DAY DELIVERABLES',
    features: [
      { title: 'Technical SEO Implementation', desc: 'Redirect logic, sitemap integrity, canonical behavior, and crawlability fixes are implemented and verified in production.' },
      { title: 'Intent-Led Content System', desc: 'Keyword and content maps are built around purchase intent so pages support pipeline, not vanity traffic.' },
      { title: 'Release Guardrails', desc: 'Stage-based audits and deployment checks reduce repeated regressions across future updates.' }
    ],
    processHeading: 'From diagnosis to shipped fixes.',
    processDescription: 'I run technical and content work as one execution track so improvements are not trapped in handoff queues.',
    process: [
      { phase: '01', title: 'Diagnosis', desc: 'Baseline crawl, indexation, and intent analysis to isolate the highest-leverage SEO constraints.' },
      { phase: '02', title: 'Implementation', desc: 'Priority technical and structural content fixes ship directly into production with validation checks.' },
      { phase: '03', title: 'Compounding Cadence', desc: 'Repeatable optimization cycles keep technical health and intent coverage improving over time.' }
    ],
    faq: [
      { q: 'How long until we see SEO results?', a: 'While technical fixes can show improvements in weeks, compounding organic growth typically takes 3-6 months to mature.' },
      { q: 'Do you write the content?', a: 'I provide detailed SEO briefs and can write priority pages directly or work with your internal SME/writer workflow.' }
    ]
  },
  {
    id: 'full-service',
    number: '03',
    title: 'Full-Service\nGrowth',
    body: 'Strategy, design, development, and SEO in one operating rhythm for teams that need senior ownership without agency overhead.',
    tags: ['Strategy', 'Design', 'Dev', 'SEO'],
    intro: 'When growth stalls because handoffs stall, this model replaces fragmented vendors with one accountable execution owner.',
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
      { metric: 'Day 30', detail: 'Unified roadmap, priorities, and KPI model established' },
      { metric: 'Day 60', detail: 'Cross-discipline execution sprinting in one backlog' },
      { metric: 'Day 90', detail: 'Measured growth operating cadence fully active' }
    ],
    processHook: 'A shared operating cadence with weekly delivery and monthly growth reviews.',
    cta: {
      label: 'Talk full-service partnership',
      helper: 'If there is a fit, I will map scope, sequencing, and expected outcomes before any retainer conversation.'
    },
    heroSubtitle: 'Eliminate vendor bloat. We fuse strategy, design, engineering, and acquisition into a single, accountable growth engine.',
    problem: {
      statement: 'Fragmented teams lead to fragmented results.',
      agitation: 'Agency-of-four setups create coordination overhead that quietly burns budget. Strategy, design, engineering, and SEO move at different speeds, and execution quality degrades at each handoff.',
      statusQuoTitle: 'What fragmented delivery looks like',
      shiftTitle: 'What integrated delivery looks like',
      statusQuoItems: [
        'Multiple vendors with no shared execution owner',
        'Roadmaps that drift because implementation is disconnected',
        'You spend cycles coordinating instead of scaling',
      ],
      shiftItems: [
        'One accountable owner across strategy, build, and search',
        'Single backlog with clear business-priority sequencing',
        'Faster cycle time from decision to shipped outcome',
      ],
    },
    featureHeading: 'Integrated execution without handoff drag.',
    outcomesHeading: '90-DAY DELIVERABLES',
    features: [
      { title: 'Unified Roadmap Ownership', desc: 'Strategy, design, engineering, and SEO are sequenced in one plan tied to business priorities.' },
      { title: 'Cross-Stack Sprint Execution', desc: 'Build changes, SEO implementation, and conversion updates ship in the same cadence.' },
      { title: 'Single Accountability Layer', desc: 'One owner for decisions, delivery, and reporting so execution does not dissolve into vendor debate.' }
    ],
    processHeading: 'How full-service actually works.',
    processDescription: 'This is a focused operating model for teams that value depth of ownership over breadth of junior resourcing.',
    process: [
      { phase: '01', title: 'Alignment + Prioritization', desc: 'Goals, constraints, and economics translated into a clear 90-day execution sequence.' },
      { phase: '02', title: 'Build + Implement', desc: 'Web, SEO, and conversion work shipped in weekly cycles through one accountable backlog.' },
      { phase: '03', title: 'Optimize + Scale', desc: 'Performance data drives next-sprint decisions so gains compound instead of reset.' }
    ],
    faq: [
      { q: 'Who manages the day-to-day?', a: 'I manage day-to-day strategy and execution directly. When specialty support is needed, it is scoped explicitly and kept inside one accountable workflow.' },
      { q: 'How is this priced?', a: 'We operate on a flat monthly retainer based on the velocity of output required. No hourly billing surprises.' }
    ],
    metaDescription: 'Full-service digital agency. Strategy, design, development, and SEO under one roof. One partner, not four vendors. Talk full-service partnership.'
  }
];
