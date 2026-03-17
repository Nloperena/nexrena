/**
 * Unique hero imagery per page — same branding (obsidian, gold, cream).
 * All images in public/images/
 */
export const heroImages = {
  home: '/images/hero-home.webp',
  services: '/images/hero-services.webp',
  'services/web-design': '/images/hero-services-web-design.webp',
  'services/seo-growth': '/images/hero-services-seo.webp',
  'services/full-service': '/images/hero-services-full.webp',
  work: '/images/hero-work.webp',
  resources: '/images/hero-resources.webp',
  blog: '/images/hero-resources.webp',
  industries: '/images/hero-industries.webp',
  'industries/manufacturing': '/images/hero-industries-manufacturing.webp',
  'industries/ecommerce': '/images/hero-industries-ecommerce.webp',
  'industries/professional-services': '/images/hero-industries-professional.webp',
  about: '/images/hero-about.webp',
  contact: '/images/hero-contact.webp',
  // Project hero objects (singular focus per field)
  'project/forzabuilt': '/images/project-forzabuilt.svg',
  'project/rugged-red': '/images/project-rugged.svg',
  'project/vito-fryfilter': '/images/project-vito.svg',
  'project/furniture-packages-usa': '/images/project-furniture.svg',
} as const;
