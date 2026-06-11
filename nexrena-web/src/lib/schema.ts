const SITE = 'https://nexrena.com';

import { founder } from '../data/founder';

export function absoluteUrl(path: string) {
  const normalized = path === '/' || /\.[a-z0-9]+$/i.test(path)
    ? path
    : path.endsWith('/')
      ? path
      : `${path}/`;
  return new URL(normalized, SITE).toString();
}

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${absoluteUrl('/')}#organization`,
    name: 'Nexrena',
    legalName: 'Nexrena LLC',
    url: absoluteUrl('/'),
    logo: absoluteUrl('/og-default.png'),
    image: absoluteUrl('/og-default.png'),
    description: 'Premium B2B digital agency — web design, SEO, full-service growth for mid-size companies.',
    email: 'NicholasL@Nexrena.com',
    foundingDate: '2025',
    founder: founderPersonSchema(),
    employee: [founderPersonSchema()],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kissimmee',
      addressRegion: 'FL',
      postalCode: '34741',
      addressCountry: 'US',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 28.2919,
      longitude: -81.4076,
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
      email: 'NicholasL@Nexrena.com',
      availableLanguage: 'English',
    },
    priceRange: '$$$',
    openingHours: 'Mo-Fr 09:00-18:00',
    sameAs: ['https://www.linkedin.com/company/nexrena', founder.portfolioUrl],
    knowsAbout: ['Web Design', 'SEO', 'B2B Marketing', 'Headless CMS', 'E-Commerce'],
  };
}

export function founderPersonSchema() {
  return {
    '@type': 'Person',
    '@id': `${founder.portfolioUrl}/#person`,
    name: founder.legalName,
    alternateName: founder.name,
    jobTitle: founder.title,
    url: founder.portfolioUrl,
    image: founder.photoUrl.startsWith('http') ? founder.photoUrl : absoluteUrl(founder.photoUrl),
    email: 'NicholasL@Nexrena.com',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kissimmee',
      addressRegion: 'FL',
      addressCountry: 'US',
    },
    worksFor: {
      '@type': 'Organization',
      name: 'Nexrena',
      url: absoluteUrl('/'),
    },
    sameAs: [founder.linkedInUrl, founder.githubUrl, founder.portfolioUrl],
    knowsAbout: [
      'Full-Stack Engineering',
      'React',
      'Next.js',
      'Astro',
      'Node.js',
      'PostgreSQL',
      'Technical SEO',
      'B2B Web Design',
    ],
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
      url: absoluteUrl('/'),
    },
    url: absoluteUrl(`/services/${service.id}`),
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
      item: item.url,
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
  const personAuthor = founderPersonSchema();
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    description: article.description,
    datePublished: article.datePublished,
    dateModified: article.dateModified ?? article.datePublished,
    url: article.url,
    author: [
      {
        '@type': 'Person',
        '@id': personAuthor['@id'],
        name: founder.legalName,
        url: founder.portfolioUrl,
        image: personAuthor.image,
      },
      {
        '@type': 'Organization',
        name: 'Nexrena',
        url: absoluteUrl('/'),
      },
    ],
    publisher: {
      '@type': 'Organization',
      name: 'Nexrena',
      url: absoluteUrl('/'),
      logo: {
        '@type': 'ImageObject',
        url: absoluteUrl('/og-default.png'),
      },
    },
  };
}

export function caseStudySchema(caseStudy: {
  name: string;
  description: string;
  url: string;
  datePublished?: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: caseStudy.name,
    description: caseStudy.description,
    url: caseStudy.url,
    ...(caseStudy.datePublished ? { datePublished: caseStudy.datePublished } : {}),
    author: {
      '@type': 'Organization',
      name: 'Nexrena',
      url: absoluteUrl('/'),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nexrena',
      url: absoluteUrl('/'),
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
