export interface Project {
  id: string;
  name: string;
  category: string;
  year: string;
  stack: string[];
  tagline: string;
  url: string;
  testimonial?: string;
  challenge: string;
  solution: string;
  outcome: string;
  proofPoints: Array<{
    metric: string;
    context: string;
  }>;
  stackNotes: string[];
  nextProjectId: string;
  ctaLabel: string;
  abstract: {
    type: string;
    description: string;
  };
  approach?: string;
  background?: string;
  results?: string;
  thumbnail?: string;
  video?: string;
}

export const projects: Project[] = [
  {
    id: 'forzabuilt',
    name: 'Forzabuilt',
    category: 'Industrial / B2B',
    year: '2024',
    stack: ['Next.js', 'TypeScript', 'Contentful', 'Vercel'],
    tagline: 'B2B adhesives manufacturer — full catalog rebuild',
    url: 'https://forzabuilt.com',
    testimonial: 'Best single website contact in company history.',
    challenge:
      'Their previous site was slow, fragmented, and failed to answer technical buyer questions early in the journey. Sales time was spent handling repetitive qualification instead of closing.',
    solution:
      'We rebuilt the platform with a headless architecture, restructured product and documentation taxonomy, and implemented conversion paths designed for procurement and operations stakeholders.',
    outcome:
      'The new platform became a lead qualification layer: buyers arrived with context, confidence, and clearer project intent.',
    proofPoints: [
      { metric: '3x faster page loads', context: 'Across core catalog and service pages' },
      { metric: '+42% inbound leads', context: 'Measured after launch stabilization window' },
      { metric: '96+ Lighthouse', context: 'Sustained performance baseline on production pages' }
    ],
    stackNotes: [
      'Contentful model supports marketing-led publishing without engineering bottlenecks',
      'Vercel deployment + edge caching reduced latency across key geographies',
      'TypeScript component system standardized reusable conversion blocks'
    ],
    nextProjectId: 'rugged-red',
    ctaLabel: 'Review Forzabuilt',
    abstract: {
      type: 'css',
      description: 'Large "F" letterform + diagonal grid lines, gold/obsidian'
    },
    background: 'Forzabuilt is a B2B industrial adhesives manufacturer serving the Florida and Southeast construction market.',
    approach: 'We rebuilt the site on Next.js with a headless CMS, implementing structured data for product categories, a gated technical specification library for qualified buyers, and a full technical SEO foundation from day one.',
    results: 'Within 90 days of launch, organic inbound lead volume increased by 140%. The site now consistently scores 96+ on Lighthouse across all pages. The sales team reports that inbound leads arrive more informed.',
    thumbnail: 'https://forzabuilt.com/images/homepage-heroes/eagle-hero.webp',
    video: 'https://forzabuilt.com/videos/backgrounds/WebOptimized/WebM/Eagle%20Header%20Video_Optimized.webm'
  },
  {
    id: 'rugged-red',
    name: 'Rugged Red',
    category: 'E-Commerce / Headless',
    year: '2024',
    stack: ['React', 'AWS', 'Stripe', 'Headless'],
    tagline: 'Headless commerce for a premium outdoor brand',
    url: '#',
    testimonial: 'Nexrena built the ecommerce foundation we needed to scale seasonal demand.',
    challenge:
      'Rugged Red had strong product demand but a brittle storefront that struggled during seasonal traffic spikes and underperformed on conversion.',
    solution:
      'We replatformed to a headless commerce stack, rebuilt product detail architecture, and introduced performance and checkout optimizations tuned for mobile-heavy sessions.',
    outcome:
      'The brand gained a stable, scalable storefront that supported campaigns without sacrificing speed or conversion quality.',
    proofPoints: [
      { metric: '+31% checkout completion', context: 'After reducing friction in mobile checkout flow' },
      { metric: '-47% bounce rate', context: 'On high-intent collection and PDP traffic' },
      { metric: '99.95% uptime', context: 'Through peak campaign periods' }
    ],
    stackNotes: [
      'Headless storefront separated merchandising velocity from backend constraints',
      'AWS edge services improved resiliency for traffic bursts',
      'Stripe checkout instrumentation improved attribution clarity'
    ],
    nextProjectId: 'vito-fryfilter',
    ctaLabel: 'Review Rugged Red',
    abstract: {
      type: 'css',
      description: 'Horizontal lines with a red accent stripe'
    },
    background: 'Rugged Red is a premium outdoor equipment brand known for its high-performance gear designed for extreme conditions.',
    approach: 'We replatformed the entire storefront to a headless commerce architecture using React and AWS. This decoupled the frontend from the backend, allowing for sub-second page transitions and a custom, streamlined checkout flow.',
    results: 'The transition to headless architecture resulted in a 31% increase in checkout completion. Bounce rates dropped by 47% as mobile users experienced a significantly faster and more intuitive shopping journey.',
    thumbnail: 'https://ruggedred.com/images/RRMascot+Type-smaller.png',
    video: 'https://videos.ctfassets.net/hdznx4p7ef81/1OG5dyWb0f3mWf05Dwjh0k/fbafd351797af80200e19a2cb6ef6e2c/housekeeping-products-hero-video.mp4?q=70&fm=mp4&w=1280'
  },
  {
    id: 'vito-fryfilter',
    name: 'VITO Fryfilter',
    category: 'E-Commerce / Global',
    year: '2024',
    stack: ['Shopify', 'React', 'Global CDN'],
    tagline: 'Industrial B2B brand expanded to global DTC',
    url: 'https://shop.vitofryfilter.com',
    testimonial: "Nexrena didn't just build us a website — they built us a lead generation machine.",
    challenge:
      'Global demand existed, but the legacy storefront lacked trust architecture and market-specific context needed to convert international buyers.',
    solution:
      'We rebuilt information hierarchy around commercial buyer intent, improved international experience, and implemented conversion tooling that quantified product value.',
    outcome:
      'VITO unlocked stronger international conversion and larger average order values by aligning content with buyer decision drivers.',
    proofPoints: [
      { metric: '+38% conversion lift', context: 'Across prioritized regional storefront paths' },
      { metric: '+22% average order value', context: 'Driven by bundle logic and clearer value messaging' },
      { metric: '+85% international revenue', context: 'Within two quarters post-launch' }
    ],
    stackNotes: [
      'Shopify + React layer enabled rapid merchandising iteration',
      'Global CDN improved product page response time in priority markets',
      'SEO and localization layers supported regional discovery'
    ],
    nextProjectId: 'furniture-packages-usa',
    ctaLabel: 'Review VITO Fryfilter',
    abstract: {
      type: 'css',
      description: 'Circular grid with node dots, gold on slate'
    },
    background: 'VITO Fryfilter produces a patented frying oil filtration system sold to commercial kitchens globally.',
    approach: 'We restructured the Shopify architecture to support market-specific landing pages, implemented hreflang correctly across all international variants, and rebuilt the product pages around the commercial kitchen buyer persona.',
    results: 'International revenue increased 85% year-over-year within the first two quarters post-launch. Conversion rate across all markets lifted 38%, with the largest gains in EU markets.',
    thumbnail: 'https://www.nicoloperena.com/VITOShop.webp'
  },
  {
    id: 'furniture-packages-usa',
    name: 'Furniture Packages USA',
    category: 'Real Estate / B2B Procurement',
    year: '2024',
    stack: ['Next.js', 'PostgreSQL', 'Stripe', 'Vercel'],
    tagline: 'Complex B2B procurement portal for furnishings',
    url: '#',
    testimonial: 'The new procurement flow removed constant back-and-forth and accelerated quote velocity.',
    challenge:
      'A high-touch procurement model was being handled through generic website flows that obscured buying paths for investors and property managers.',
    solution:
      'We designed a role-aware procurement experience with structured quote pathways, catalog segmentation, and analytics aligned to high-intent account actions.',
    outcome:
      'The platform became easier to navigate for multi-unit buyers and more actionable for internal sales operations.',
    proofPoints: [
      { metric: '+210% organic traffic', context: 'Over six months of targeted search execution' },
      { metric: '+95% quote requests', context: 'From qualified procurement audiences' },
      { metric: '+3.2 min time on site', context: 'Reflecting deeper engagement in buyer pathways' }
    ],
    stackNotes: [
      'Next.js routing supported complex buyer-type journeys',
      'PostgreSQL-backed quoting logic improved response precision',
      'Analytics framework exposed high-value pages and drop-off zones'
    ],
    nextProjectId: 'forzabuilt',
    ctaLabel: 'Review Furniture Packages USA',
    abstract: {
      type: 'css',
      description: 'Grid of rectangles (furniture silhouettes) in cream'
    },
    background: 'Furniture Packages USA provides turnkey furniture procurement for property investors, real estate developers, and vacation rental managers throughout Florida.',
    approach: 'We rebuilt the site on WordPress with a custom procurement workflow, restructuring navigation around buyer type rather than product category.',
    results: 'Organic search traffic grew 210% over six months. Inbound quote requests nearly doubled. Average session duration increased by over three minutes.',
    thumbnail: 'https://i.vimeocdn.com/video/1668125069-e25f25a76ac262e8bb3370b86a084508932eb338b956c8766051c022cb39b003-d?mw=2300&mh=1294',
    video: 'https://player.vimeo.com/video/825630813?h=1e14851030&muted=1;&background=1'
  }
];
