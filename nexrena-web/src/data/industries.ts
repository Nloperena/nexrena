export interface Industry {
  id: string;
  name: string;
  headline: string;
  subhead: string;
  painPoints: string[];
  solutions: string[];
  ctaLabel: string;
  metaDescription?: string;
}

export const industries: Industry[] = [
  {
    id: 'manufacturing',
    name: 'Manufacturing',
    headline: 'Digital growth for manufacturers.',
    subhead: 'Technical buyers research online. We build the sites and search strategies that capture their attention before they ever talk to a rep.',
    painPoints: [
      'Complex catalogs and technical spec requests',
      'Long sales cycles with repetitive qualification',
      'Weak organic visibility for technical terms',
    ],
    solutions: [
      'Conversion-focused architecture for technical buyers',
      'SEO for technical and commercial intent',
      'Lead qualification paths that reduce sales drag',
    ],
    ctaLabel: 'Plan your manufacturing site',
    metaDescription: 'SEO for manufacturers. Technical buyers research online. We build sites and search strategies that capture their attention before they talk to a rep.',
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce',
    headline: 'Ecommerce that converts beyond the cart.',
    subhead: 'Product pages are table stakes. We focus on category pages, search, and post-purchase flows that drive repeat and B2B volume.',
    painPoints: [
      'Thin margins and paid acquisition dependency',
      'Category page performance and discovery',
      'Mobile checkout friction',
    ],
    solutions: [
      'SEO for category and commercial intent',
      'Headless performance and conversion architecture',
      'Checkout and post-purchase optimization',
    ],
    ctaLabel: 'Talk ecommerce growth',
    metaDescription: 'Ecommerce SEO and growth. Category pages, headless performance, checkout optimization. We focus on what drives repeat and B2B volume.',
  },
  {
    id: 'professional-services',
    name: 'Professional Services',
    headline: 'Websites for firms that sell expertise.',
    subhead: 'Law, consulting, accounting. Your buyers judge credibility in seconds. We build sites that establish authority and capture high-intent leads.',
    painPoints: [
      'Credibility and trust in seconds',
      'Lead quality over quantity',
      'Differentiation in crowded markets',
    ],
    solutions: [
      'Editorial UX and case study presentation',
      'Clear service and expertise paths',
      'Conversion architecture for high-intent leads',
    ],
    ctaLabel: 'Start a project',
    metaDescription: 'Web design for professional services. Law, consulting, accounting. Sites that establish authority and capture high-intent leads.',
  },
];
