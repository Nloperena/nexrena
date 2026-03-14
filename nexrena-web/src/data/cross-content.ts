/**
 * Unique content for each service x industry cross-page.
 * Keys are `${serviceId}/${industryId}`.
 */

export interface CrossContent {
  headline: string;
  intro: string;
  challenges: string[];
  approach: string[];
  outcomes: string[];
}

export const crossContent: Record<string, CrossContent> = {
  'web-design/manufacturing': {
    headline: 'Websites that convert technical buyers into qualified leads.',
    intro: 'Manufacturing buyers research specs, certifications, and capabilities before they ever contact sales. Your website needs to answer those questions faster and more clearly than your competitors.',
    challenges: [
      'Complex product catalogs that are hard to navigate for procurement teams',
      'Technical documentation buried in PDFs instead of indexed, searchable pages',
      'Slow legacy platforms that frustrate mobile users on the factory floor',
      'No clear conversion paths for different buyer types (engineers, procurement, executives)',
    ],
    approach: [
      'Restructure information architecture around buyer intent — specs, applications, certifications',
      'Build fast, accessible pages with structured data for product and service schema',
      'Implement role-based navigation so engineers, procurement, and executives find what they need',
      'Create conversion paths that reduce sales qualification time with pre-qualified form flows',
    ],
    outcomes: [
      'Faster page loads across complex catalog pages (targeting 90+ Lighthouse)',
      'Higher quality inbound leads with clearer buying intent',
      'Reduced sales cycle length as buyers arrive pre-informed',
    ],
  },
  'web-design/ecommerce': {
    headline: 'Headless storefronts built for speed and conversion.',
    intro: 'E-commerce success depends on sub-second loads, seamless checkout, and category pages that rank. We build headless storefronts that decouple your frontend from backend limitations.',
    challenges: [
      'Monolithic platforms that slow down during traffic spikes and seasonal campaigns',
      'High bounce rates on product detail and category pages due to slow load times',
      'Checkout abandonment from friction-heavy flows not optimized for mobile',
      'Limited design flexibility within rigid platform themes',
    ],
    approach: [
      'Migrate to a headless architecture (React + Shopify, or custom) for sub-second page transitions',
      'Rebuild category and PDP templates with conversion-first UX and lazy-loaded media',
      'Streamline checkout with express options, guest checkout, and clear trust signals',
      'Implement A/B testing infrastructure to continuously optimize conversion rates',
    ],
    outcomes: [
      'Faster page loads and stable uptime through peak traffic periods',
      'Higher checkout completion rates through reduced mobile friction',
      'Greater design control and faster merchandising iteration cycles',
    ],
  },
  'web-design/professional-services': {
    headline: 'Websites that establish authority in seconds.',
    intro: 'Professional services buyers — legal, consulting, accounting — judge credibility before they read a word. Your site needs to signal trust, expertise, and clear paths to engagement.',
    challenges: [
      'Generic template sites that fail to differentiate from competitors in the same market',
      'Unclear service offerings that force prospects to guess what you actually do',
      'No structured case study or thought leadership presentation',
      'Lead forms that attract tire-kickers instead of qualified decision-makers',
    ],
    approach: [
      'Design editorial-quality pages that position partners and expertise as the product',
      'Build clear service taxonomy and practice area navigation for complex offerings',
      'Create case study templates with measurable outcomes and client attribution',
      'Implement qualification-driven forms that capture intent and filter by budget or need',
    ],
    outcomes: [
      'Stronger first impressions that convert browsers into booked consultations',
      'Clearer differentiation from competitors through expertise-led content',
      'Higher quality leads filtered by intent before they reach the inbox',
    ],
  },
  'seo-growth/manufacturing': {
    headline: 'Rank for what your technical buyers actually search.',
    intro: 'Manufacturing SEO is not consumer SEO. Your buyers search for specs, applications, certifications, and regional suppliers. We build search strategies around commercial and technical intent.',
    challenges: [
      'Invisible for high-intent queries like "[product] supplier [region]" or "[material] specifications"',
      'Technical documentation that exists but isn\'t crawlable or structured for search',
      'Competitors outranking you for terms your sales team hears every day',
      'No content strategy connecting blog content to commercial pages',
    ],
    approach: [
      'Audit and fix technical foundations — crawl budget, structured data, site speed',
      'Build topic clusters around buyer-intent keywords: specs, applications, comparisons',
      'Optimize product and service pages for commercial search intent',
      'Create an internal linking architecture that funnels authority to high-value pages',
    ],
    outcomes: [
      'Compounding organic visibility for technical and commercial search terms',
      'Lower cost-per-acquisition as organic traffic replaces paid dependency',
      'Sales teams receiving better-informed inbound leads from search',
    ],
  },
  'seo-growth/ecommerce': {
    headline: 'Organic growth that compounds beyond paid ads.',
    intro: 'Paid acquisition gets more expensive every quarter. We build SEO systems for ecommerce that drive category-level traffic, reduce CAC pressure, and compound in value.',
    challenges: [
      'Over-reliance on paid channels with rising cost-per-click eroding margins',
      'Thin category pages that rank poorly against established competitors',
      'Duplicate content issues across product variants, colors, and sizes',
      'No structured approach to commercial intent content beyond product descriptions',
    ],
    approach: [
      'Optimize category pages with unique, intent-rich content and proper internal linking',
      'Fix technical SEO issues: canonicals, faceted navigation, crawl waste',
      'Build content hubs around buyer research queries (comparisons, guides, use cases)',
      'Implement schema markup for products, reviews, and availability across the catalog',
    ],
    outcomes: [
      'Growing organic traffic to category and product pages quarter over quarter',
      'Reduced paid acquisition dependency with sustainable organic pipeline',
      'Better search visibility for commercial intent queries that drive revenue',
    ],
  },
  'seo-growth/professional-services': {
    headline: 'Own your practice area in search results.',
    intro: 'When prospects search for "[specialty] firm [city]" or "[problem] consultant," you need to be there. We build SEO strategies that establish topical authority for professional services.',
    challenges: [
      'Crowded local search results with competitors bidding on the same practice area terms',
      'No content strategy connecting expertise to the questions prospects are searching',
      'Weak local SEO presence despite serving a specific geographic market',
      'Service pages that describe what you do but don\'t rank for how clients search',
    ],
    approach: [
      'Build practice-area content hubs that demonstrate deep expertise to search engines',
      'Optimize Google Business Profile and local citation consistency',
      'Create thought leadership content targeting the exact questions your ideal clients research',
      'Implement service-area and practice-specific schema for enhanced search visibility',
    ],
    outcomes: [
      'Top-of-funnel visibility for practice area and problem-solution queries',
      'Stronger local pack presence in your target geography',
      'Inbound leads who arrive already understanding your expertise and approach',
    ],
  },
  'full-service/manufacturing': {
    headline: 'One partner for your entire digital growth engine.',
    intro: 'Manufacturers need web, search, and conversion to work as one system — not three disconnected vendors. We run the full stack so your team can focus on operations.',
    challenges: [
      'Fragmented vendors for web, SEO, and content creating misaligned priorities',
      'No unified measurement framework connecting website performance to sales pipeline',
      'Slow iteration cycles because design, development, and marketing aren\'t coordinated',
      'Digital presence that doesn\'t reflect the sophistication of your actual capabilities',
    ],
    approach: [
      'Audit and rebuild your digital infrastructure as a single, integrated growth system',
      'Align web design, SEO, and content strategy under one KPI framework tied to revenue',
      'Run weekly execution sprints across design, development, and search optimization',
      'Provide monthly growth reviews connecting digital metrics to business outcomes',
    ],
    outcomes: [
      'Faster time-to-impact with no vendor coordination overhead',
      'Unified analytics connecting website activity to qualified lead flow',
      'Compounding performance as each sprint improves both UX and search visibility',
    ],
  },
  'full-service/ecommerce': {
    headline: 'Design, development, and growth under one roof.',
    intro: 'Ecommerce brands need speed at every level — site speed, iteration speed, and growth velocity. We combine design, engineering, and acquisition into a single team.',
    challenges: [
      'Separate teams for design, development, and marketing creating handoff delays',
      'Inability to quickly test and iterate on conversion hypotheses',
      'Rising acquisition costs with no integrated strategy to compound organic growth',
      'Platform constraints limiting design ambition and merchandising agility',
    ],
    approach: [
      'Rebuild your storefront and growth channels as an integrated system from day one',
      'Run conversion experiments, SEO improvements, and design updates in unified sprints',
      'Build a measurement framework that connects paid, organic, and onsite conversion',
      'Provide a dedicated strategist who coordinates all channels toward revenue targets',
    ],
    outcomes: [
      'Faster experiment velocity — test, learn, and ship in the same sprint',
      'Lower blended acquisition cost through organic + paid coordination',
      'Single accountable team aligned to your quarterly revenue goals',
    ],
  },
  'full-service/professional-services': {
    headline: 'Your fractional digital team — strategy through execution.',
    intro: 'Professional services firms need credibility, visibility, and conversion working together. We provide the full digital function so your partners can focus on client work.',
    challenges: [
      'No dedicated marketing team to manage website, content, and search consistently',
      'Partners spending time on marketing decisions instead of billable client work',
      'Inconsistent brand presence across web, search, and thought leadership channels',
      'Difficulty measuring which digital activities actually drive new business inquiries',
    ],
    approach: [
      'Serve as your fractional digital team: strategy, design, development, and growth',
      'Build and maintain a website that positions your expertise and captures high-intent leads',
      'Manage SEO and content publishing on a monthly cadence tied to practice area priorities',
      'Report monthly on metrics that matter: inquiries, consultation bookings, pipeline influence',
    ],
    outcomes: [
      'A cohesive digital presence that partners are proud to share with prospects',
      'Consistent lead flow without pulling senior team members into marketing',
      'Clear visibility into which digital activities drive real business outcomes',
    ],
  },
};
