export interface ResourceLink {
  title: string;
  href: string;
  description?: string;
}

const serviceByBlogCategory: Record<string, ResourceLink> = {
  seo: {
    title: 'SEO Growth Services',
    href: '/services/seo-growth/',
    description: 'Turn technical SEO and content into qualified pipeline.',
  },
  'web-design': {
    title: 'Web Design and Development',
    href: '/services/web-design/',
    description: 'Build fast, conversion-focused B2B websites.',
  },
  ecommerce: {
    title: 'Full-Service Growth for Ecommerce',
    href: '/services/full-service/ecommerce/',
    description: 'Unify design, development, and growth for ecommerce.',
  },
  strategy: {
    title: 'Full-Service Growth',
    href: '/services/full-service/',
    description: 'One team for strategy, design, development, and SEO.',
  },
  manufacturing: {
    title: 'SEO for Manufacturing',
    href: '/services/seo-growth/manufacturing/',
    description: 'Improve visibility for technical buyer-intent searches.',
  },
  'professional-services': {
    title: 'SEO for Professional Services',
    href: '/services/seo-growth/professional-services/',
    description: 'Capture high-intent service and local searches.',
  },
};

const faqByBlogCategory: Record<string, ResourceLink> = {
  seo: {
    title: 'FAQ: What does SEO growth include?',
    href: '/resources/faq/#seo-growth-include',
  },
  'web-design': {
    title: 'FAQ: B2B redesign timeline',
    href: '/resources/faq/#website-redesign-timeline',
  },
  ecommerce: {
    title: 'FAQ: Ongoing support after launch',
    href: '/resources/faq/#ongoing-support-after-launch',
  },
  strategy: {
    title: 'FAQ: What is full-service growth?',
    href: '/resources/faq/#full-service-digital-growth',
  },
  manufacturing: {
    title: 'FAQ: Do you work with manufacturers?',
    href: '/resources/faq/#work-with-manufacturers',
  },
  'professional-services': {
    title: 'FAQ: What makes a B2B website effective?',
    href: '/resources/faq/#effective-b2b-website',
  },
};

const blogCategoriesByService: Record<string, string[]> = {
  'web-design': ['web-design', 'strategy'],
  'seo-growth': ['seo', 'manufacturing', 'professional-services', 'ecommerce'],
  'full-service': ['strategy', 'seo', 'web-design'],
};

const blogCategoriesByIndustry: Record<string, string[]> = {
  manufacturing: ['manufacturing', 'seo', 'strategy'],
  ecommerce: ['ecommerce', 'seo', 'web-design'],
  'professional-services': ['professional-services', 'strategy', 'seo'],
};

const faqByIndustry: Record<string, ResourceLink> = {
  manufacturing: {
    title: 'FAQ: Do you work with manufacturers?',
    href: '/resources/faq/#work-with-manufacturers',
  },
  ecommerce: {
    title: 'FAQ: Ongoing support after launch',
    href: '/resources/faq/#ongoing-support-after-launch',
  },
  'professional-services': {
    title: 'FAQ: What makes a B2B website effective?',
    href: '/resources/faq/#effective-b2b-website',
  },
};

export function getBlogSupportLinks(category: string) {
  return {
    service: serviceByBlogCategory[category] ?? serviceByBlogCategory.strategy,
    faq: faqByBlogCategory[category] ?? faqByBlogCategory.strategy,
  };
}

export function getPreferredBlogCategoriesForService(serviceId: string) {
  return blogCategoriesByService[serviceId] ?? ['strategy', 'seo'];
}

export function getPreferredBlogCategoriesForServiceIndustry(serviceId: string, industryId: string) {
  const serviceCats = blogCategoriesByService[serviceId] ?? ['strategy', 'seo'];
  const industryCats = blogCategoriesByIndustry[industryId] ?? ['strategy'];
  return [...new Set([...serviceCats, ...industryCats])];
}

export function getFaqLinkForIndustry(industryId: string) {
  return faqByIndustry[industryId] ?? faqByBlogCategory.strategy;
}
