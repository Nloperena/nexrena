export interface Project {
  id: string;
  name: string;
  category: string;
  year: string;
  stack: string[];
  tagline: string;
  url: string;
  metaDescription?: string;
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
  /** Whether to show an iframe embed of the live site in the preview section */
  embedSite?: boolean;
  /** SEO strategy highlights shown in the dedicated SEO section */
  seoHighlights: Array<{
    title: string;
    description: string;
  }>;
}

export const projects: Project[] = [
  {
    id: 'forzabuilt',
    name: 'Forzabuilt',
    category: 'Industrial / B2B',
    year: '2026',
    stack: ['Astro', 'React Islands', 'Tailwind', 'Vercel'],
    tagline: 'Rebrand, Astro rebuild, and the SEO architecture that turned a cold site into a qualified-lead channel.',
    url: 'https://forzabuilt.com',
    testimonial: 'Best single website contact in company history.',
    challenge:
      'ForzaBuilt rebranded, rebuilt a media-heavy 200+ SKU industrial catalog, and migrated from legacy WordPress URL patterns to Astro in one transition. B2B migrations often trigger visibility loss when URL structures change, redirect coverage slips, and crawl/index signals degrade after launch.',
    solution:
      'I ran build and SEO architecture as one program: Astro with React islands, Tailwind, and Vercel delivery; canonical route structure replacing legacy URL sprawl; layered redirect continuity across middleware and edge rules; hardened canonicals and sitemaps; Product and FAQ schema across the catalog; and IA rebuilt around procurement intent (application, substrate, specification).',
    outcome:
      'The site launched with strong technical quality and then completed staged post-launch remediation (forensic audit, prioritized fixes, release validation, and repeatable audit workflow), resulting in a handoff-ready SEO operating system and a clear qualified inbound lift.',
    proofPoints: [
      { metric: '99% SEO health', context: 'Post-remediation technical audit score' },
      { metric: '99% Lighthouse', context: 'Desktop score on a media-heavy website' },
      { metric: '0 -> 28 MQLs', context: 'Qualified inbound in first four months post-launch (26 unique contacts)' }
    ],
    stackNotes: [
      'Migration architecture under constraint: shipped a full platform transition on a 200+ SKU catalog without the indexing collapse common in B2B rebuilds',
      'Layered redirect strategy: middleware + edge rules preserved equity on high-impact legacy paths across changed URL patterns',
      'B2B-native information architecture: catalog rebuilt around procurement intent, not marketing taxonomy',
      'Production-grade performance: sustained 99% Lighthouse desktop on a media-heavy site with selective hydration and delivery optimization',
      'Repeatable SEO release workflow: stage-based audit outputs that gave the internal team durable guardrails for future updates'
    ],
    nextProjectId: 'furniture-packages-usa',
    ctaLabel: 'Review Forzabuilt',
    abstract: {
      type: 'css',
      description: 'Large "F" letterform + diagonal grid lines, gold/obsidian'
    },
    background: 'Forzabuilt is a B2B industrial adhesives manufacturer serving the Florida and Southeast construction market.',
    metaDescription: 'ForzaBuilt case study: rebrand, Astro rebuild, and SEO architecture. 99% SEO health, 99% Lighthouse desktop, and 0 to 28 qualified MQL submissions in four months.',
    approach: 'I led the transition as a unified architecture program, combining platform rebuild decisions with SEO-critical controls (URL continuity, crawl/index hardening, structured data, and release validation) so the migration could ship fast without sacrificing long-term search resilience.',
    results: 'Final outcomes at handoff: 99% technical SEO health, 99% Lighthouse desktop on a media-heavy catalog, and qualified inbound growth from effectively zero baseline to 28 estimated MQL submissions (26 unique contacts) in the first four months post-launch.',
    thumbnail: 'https://forzabuilt.com/images/homepage-heroes/eagle-hero.webp',
    video: 'https://forzabuilt.com/videos/backgrounds/WebOptimized/WebM/Eagle%20Header%20Video_Optimized.webm',
    embedSite: true,
    seoHighlights: [
      { title: 'Technical SEO Architecture', description: 'Built a crawlable, indexable foundation from day one — clean URL structure, XML sitemaps, and canonical tags across 200+ product pages.' },
      { title: 'Structured Data for Industrial Products', description: 'Implemented Product and FAQ schema markup across the entire catalog, earning rich snippets in Google search results.' },
      { title: 'Content Hierarchy for Buyer Intent', description: 'Restructured information architecture around how procurement teams actually search — by application, substrate, and specification.' },
      { title: 'Core Web Vitals Optimization', description: 'Achieved and sustained 96+ Lighthouse scores through image optimization, edge caching, and code splitting.' },
    ]
  },
  {
    id: 'rugged-red',
    name: 'Rugged Red',
    category: 'E-Commerce / Headless',
    year: '2025',
    stack: ['React', 'AWS', 'Stripe', 'Headless'],
    tagline: "Launching ForzaBuilt's cleaning division as a clear standalone digital brand",
    url: 'https://www.ruggedred.com',
    testimonial: 'Nexrena built the ecommerce foundation we needed to scale seasonal demand.',
    challenge:
      'ForzaBuilt needed to launch Rugged Red as a credible standalone cleaning division while keeping it operationally aligned with the parent platform and existing product systems.',
    solution:
      'I implemented Rugged Red as a first-class product family in the website architecture: dedicated category routing, focused cleaners experience, and clear division-level positioning that still fits inside shared operational workflows.',
    outcome:
      'The business launched a cleaner-specific digital presence without fragmenting systems, giving sales and marketing a focused division experience that can scale with future product expansion.',
    proofPoints: [
      { metric: 'Division-first navigation', context: 'Cleaners made discoverable from primary website pathways' },
      { metric: 'Dedicated cleaners route', context: 'Rugged Red product experience separated from adhesive workflows' },
      { metric: 'Shared ops backbone', context: 'Both brands managed without duplicating systems or content operations' }
    ],
    stackNotes: [
      'Clear division positioning: Rugged Red established as a first-class cleaning product family under the ForzaBuilt umbrella',
      'Dedicated product architecture: cleaners routing and content pathways support focused user intent',
      'Operational continuity: shared data and routing logic preserved maintainability across related brands',
      'Scalable foundation: structure supports future cleaning-division expansion without platform fragmentation'
    ],
    nextProjectId: 'vito-fryfilter',
    ctaLabel: 'Review Rugged Red',
    abstract: {
      type: 'css',
      description: 'Horizontal lines with a red accent stripe'
    },
    background: 'Rugged Red is a premium outdoor equipment brand known for its high-performance gear designed for extreme conditions.',
    metaDescription: "Rugged Red case study: launched ForzaBuilt's cleaning division as a dedicated digital brand with clear category architecture and scalable shared operations.",
    approach: 'I delivered a launch-ready division architecture that balanced differentiation and integration: branded cleaners pathways, dedicated category experience, and shared platform logic for maintainable multi-brand operations.',
    results: 'Rugged Red launched with a focused customer-facing identity and cleaner product discovery flow, while the internal team retained one scalable operating system for content, products, and updates across both brands.',
    thumbnail: 'https://ruggedred.com/images/RRMascot+Type-smaller.png',
    video: 'https://videos.ctfassets.net/hdznx4p7ef81/1OG5dyWb0f3mWf05Dwjh0k/fbafd351797af80200e19a2cb6ef6e2c/housekeeping-products-hero-video.mp4?q=70&fm=mp4&w=1280',
    seoHighlights: [
      { title: 'Division-Level Discoverability', description: 'Introduced Rugged Red as a dedicated cleaners branch in core navigation and product pathways so search engines and users can discover the division directly.' },
      { title: 'Category Separation Without Fragmentation', description: 'Structured cleaners routes and content to remain distinct from adhesive flows while preserving shared operational logic and consistent crawl behavior.' },
      { title: 'Scalable Multi-Brand URL Logic', description: 'Implemented routing patterns that support ongoing Rugged Red growth without forcing a separate website stack or duplicate content systems.' },
      { title: 'Foundation-First SEO Hygiene', description: 'Maintained canonical and indexability consistency while expanding product families, reducing long-term crawl risk as the division scales.' },
    ]
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
    nextProjectId: 'forzabuilt',
    ctaLabel: 'Review VITO Fryfilter',
    abstract: {
      type: 'css',
      description: 'Circular grid with node dots, gold on slate'
    },
    background: 'VITO Fryfilter produces a patented frying oil filtration system sold to commercial kitchens globally.',
    metaDescription: 'VITO Fryfilter case study: Global DTC expansion. +38% conversion, +85% international revenue. Shopify, React, commercial buyer intent.',
    approach: 'We restructured the Shopify architecture to support market-specific landing pages, implemented hreflang correctly across all international variants, and rebuilt the product pages around the commercial kitchen buyer persona.',
    results: 'International revenue increased 85% year-over-year within the first two quarters post-launch. Conversion rate across all markets lifted 38%, with the largest gains in EU markets.',
    thumbnail: 'https://www.nicoloperena.com/VITOShop.webp',
    seoHighlights: [
      { title: 'International SEO & Hreflang', description: 'Implemented correct hreflang tags across all international storefronts, eliminating duplicate content issues and ensuring regional search visibility.' },
      { title: 'Market-Specific Landing Pages', description: 'Created geo-targeted landing pages optimized for local search intent in priority EU and North American markets.' },
      { title: 'Commercial Buyer Intent Keywords', description: 'Researched and targeted the exact search terms commercial kitchen operators use when evaluating oil filtration solutions.' },
      { title: 'Product Schema for Global Availability', description: 'Deployed rich product schema with pricing, availability, and review data — earning enhanced listings across international Google SERPs.' },
    ]
  },
  {
    id: 'furniture-packages-usa',
    name: 'Furniture Packages USA',
    category: 'Real Estate / B2B Procurement',
    year: '2026',
    stack: ['Next.js', 'PostgreSQL', 'Stripe', 'Vercel'],
    tagline: 'Complex B2B procurement portal for furnishings',
    url: 'https://furniturepackagesusa.com',
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
    nextProjectId: 'rugged-red',
    ctaLabel: 'Review Furniture Packages USA',
    abstract: {
      type: 'css',
      description: 'Grid of rectangles (furniture silhouettes) in cream'
    },
    background: 'Furniture Packages USA provides turnkey furniture procurement for property investors, real estate developers, and vacation rental managers throughout Florida.',
    metaDescription: 'Furniture Packages USA case study: B2B procurement portal. +210% organic traffic, +95% quote requests. Next.js, PostgreSQL, Stripe.',
    approach: 'We rebuilt the site on WordPress with a custom procurement workflow, restructuring navigation around buyer type rather than product category.',
    results: 'Organic search traffic grew 210% over six months. Inbound quote requests nearly doubled. Average session duration increased by over three minutes.',
    thumbnail: 'https://i.vimeocdn.com/video/1668125069-e25f25a76ac262e8bb3370b86a084508932eb338b956c8766051c022cb39b003-d?mw=2300&mh=1294',
    video: 'https://player.vimeo.com/video/825630813?h=1e14851030&muted=1;&background=1',
    seoHighlights: [
      { title: 'Content Clusters for Procurement', description: 'Built topic authority through interlinked content clusters targeting high-value procurement keywords like "bulk furniture packages" and "rental property furnishing."' },
      { title: 'Local SEO for Florida Markets', description: 'Optimized Google Business Profile, built location-specific landing pages, and earned local citations to dominate Florida real estate procurement searches.' },
      { title: 'Buyer-Type Navigation Structure', description: 'Restructured site architecture around buyer personas (investors, property managers, developers) instead of product categories — matching search intent.' },
      { title: 'Technical SEO Overhaul', description: 'Migrated from a broken legacy site with full redirect mapping, crawl error remediation, and clean URL taxonomy that preserved existing rankings.' },
    ]
  }
];
