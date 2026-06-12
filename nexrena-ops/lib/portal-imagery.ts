/** Decorative imagery for the client portal — modern app surfaces, not business data. */

export const PORTAL_IMAGES = {
  networkBg: '/images/portal/work-heading-network-bg.svg',
  growthBar: '/images/portal/hero-growth-bar.svg',
  infrastructure: '/images/portal/showreel-infrastructure-overlay.svg',
  projectFurniture: '/images/portal/project-furniture.svg',
  projectForza: '/images/portal/project-forzabuilt.svg',
} as const

/** Curated Unsplash photos — clean workspace / product aesthetic */
export const PORTAL_PHOTOS = {
  hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=80',
  messages: 'https://images.unsplash.com/photo-1577563908411-5077b6dc7624?auto=format&fit=crop&w=800&q=80',
  request: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
  billing: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
  schedule: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80',
  websites: 'https://images.unsplash.com/photo-1547658719-da2b51169166?auto=format&fit=crop&w=1200&q=80',
  files: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
  auth: 'https://images.unsplash.com/photo-1497215728101-856f4fd903c8?auto=format&fit=crop&w=1200&q=80',
} as const

export type PortalPhotoKey = keyof typeof PORTAL_PHOTOS
