const SITE = 'https://nexrena.com';

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE}/#organization`,
    name: 'Nexrena',
    legalName: 'Nexrena LLC',
    url: SITE,
    logo: `${SITE}/favicon.svg`,
    image: `${SITE}/og-default.png`,
    description: 'Premium B2B digital agency — web design, SEO, full-service growth for mid-size companies.',
    email: 'hello@nexrena.com',
    foundingDate: '2025',
    founder: {
      '@type': 'Person',
      name: 'Nico Loperena',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kissimmee',
      addressRegion: 'FL',
      addressCountry: 'US',
    },
    areaServed: [
      { '@type': 'City', name: 'Orlando' },
      { '@type': 'City', name: 'Kissimmee' },
      { '@type': 'State', name: 'Florida' },
      { '@type': 'Country', name: 'United States' },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: 'hello@nexrena.com',
      availableLanguage: 'English',
    },
    priceRange: '$$$',
    openingHours: 'Mo-Fr 09:00-18:00',
    sameAs: ['https://www.linkedin.com/company/nexrena'],
    knowsAbout: ['Web Design', 'SEO', 'B2B Marketing', 'Headless CMS', 'E-Commerce'],
  };
}

export function serviceSchema(service: { id: string; title: string; body: string }) {
  const title = service.title.replace(/\n/g, ' ');
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: title,
    description: service.body,
    provider: {
      '@type': 'Organization',
      name: 'Nexrena',
      url: SITE,
    },
    url: `${SITE}/services/${service.id}`,
  };
}

export function webPageSchema(page: { name: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.name,
    description: page.description,
    url: page.url,
  };
}

export function breadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function itemListSchema(items: Array<{ name: string; url: string }>, listName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: listName,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: item.url,
    })),
  };
}

export function articleSchema(article: {
  headline: string;
  description: string;
  datePublished?: string;
  dateModified?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified ?? article.datePublished,
    url: article.url,
    author: {
      '@type': 'Organization',
      name: 'Nexrena',
      url: SITE,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nexrena',
      url: SITE,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE}/favicon.svg`,
      },
    },
  };
}

export function faqPageSchema(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}
