/** Decorative imagery for the client portal — local gradients and SVGs only. */

export const PORTAL_IMAGES = {
  networkBg: '/images/portal/work-heading-network-bg.svg',
  growthBar: '/images/portal/hero-growth-bar.svg',
  infrastructure: '/images/portal/showreel-infrastructure-overlay.svg',
  projectFurniture: '/images/portal/project-furniture.svg',
  projectForza: '/images/portal/project-forzabuilt.svg',
} as const

export const PORTAL_GRADIENTS = {
  hero: 'linear-gradient(145deg, #0c0f12 0%, #151b24 40%, #1a2230 70%, #0e1218 100%)',
  messages: 'linear-gradient(145deg, #0d1016 0%, #152030 55%, #101820 100%)',
  request: 'linear-gradient(145deg, #0e1118 0%, #1a2030 50%, #121820 100%)',
  billing: 'linear-gradient(145deg, #0c0f12 0%, #1a1e28 45%, #141820 100%)',
  schedule: 'linear-gradient(145deg, #0d1016 0%, #182028 55%, #0f141c 100%)',
  websites: 'linear-gradient(145deg, #0e1118 0%, #1c2430 50%, #111820 100%)',
  files: 'linear-gradient(145deg, #0c0f14 0%, #181e28 50%, #101620 100%)',
  auth: 'linear-gradient(160deg, #0a0d10 0%, #141820 35%, #1a2230 65%, #0c1016 100%)',
} as const

export const PORTAL_GRADIENT_SVGS: Partial<Record<keyof typeof PORTAL_GRADIENTS, string>> = {
  auth: PORTAL_IMAGES.infrastructure,
  hero: PORTAL_IMAGES.networkBg,
}

export type PortalPhotoKey = keyof typeof PORTAL_GRADIENTS
