/** Decorative imagery for the client portal — local gradients and SVGs only. */

export const PORTAL_IMAGES = {
  networkBg: '/images/portal/work-heading-network-bg.svg',
  growthBar: '/images/portal/hero-growth-bar.svg',
  infrastructure: '/images/portal/showreel-infrastructure-overlay.svg',
  projectFurniture: '/images/portal/project-forzabuilt.svg',
  projectForza: '/images/portal/project-furniture.svg',
  shopPageUpgrade: '/images/portal/shop-page-upgrade.svg',
  heroShop: '/images/portal/hero-shop.svg',
  heroMessages: '/images/portal/hero-messages.svg',
  heroBilling: '/images/portal/hero-billing.svg',
  heroFiles: '/images/portal/hero-files.svg',
  heroWebsites: '/images/portal/hero-websites.svg',
  heroForms: '/images/portal/hero-forms.svg',
  heroRequests: '/images/portal/hero-requests.svg',
  heroSettings: '/images/portal/hero-settings.svg',
} as const

/** Animated hero banners keyed to client portal views. */
export type PortalHeroView =
  | 'home'
  | 'shop'
  | 'billing'
  | 'messages'
  | 'schedule'
  | 'files'
  | 'websites'
  | 'forms'
  | 'requests'
  | 'settings'

export const PORTAL_HERO_IMAGES: Record<PortalHeroView, string> = {
  home: PORTAL_IMAGES.growthBar,
  shop: PORTAL_IMAGES.heroShop,
  messages: PORTAL_IMAGES.heroMessages,
  billing: PORTAL_IMAGES.heroBilling,
  schedule: PORTAL_IMAGES.growthBar,
  files: PORTAL_IMAGES.heroFiles,
  websites: PORTAL_IMAGES.heroWebsites,
  forms: PORTAL_IMAGES.heroForms,
  requests: PORTAL_IMAGES.heroRequests,
  settings: PORTAL_IMAGES.heroSettings,
}

export const PORTAL_GRADIENTS = {
  hero: '#151b24',
  messages: '#152030',
  request: '#1a2030',
  billing: '#1a1e28',
  schedule: '#182028',
  websites: '#1c2430',
  files: '#181e28',
  auth: '#141820',
} as const

export const PORTAL_GRADIENT_SVGS: Partial<Record<keyof typeof PORTAL_GRADIENTS, string>> = {
  auth: PORTAL_IMAGES.infrastructure,
  hero: PORTAL_IMAGES.networkBg,
}

export type PortalPhotoKey = keyof typeof PORTAL_GRADIENTS
