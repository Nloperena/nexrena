export type SiteConfig = {
  contactId: string
  label: string
  origins: string[]
  /** Env var name holding optional shared secret (e.g. TTAG_FORM_SECRET) */
  formSecretEnv?: string
}

/** Registered client websites that POST to /api/forms/submit */
export const SITES: Record<string, SiteConfig> = {
  ttag: {
    contactId: 'warren-daughtridge-ttag',
    label: 'TTAG',
    origins: [
      'https://ttag-fawn.vercel.app',
      'https://ttag-astro.vercel.app',
      'https://www.thetwoazaleagroup.com',
      'https://thetwoazaleagroup.com',
      'https://www.twoazaleagroup.com',
      'https://twoazaleagroup.com',
    ],
    formSecretEnv: 'TTAG_FORM_SECRET',
  },
  nexrena: {
    contactId: '',
    label: 'Nexrena',
    origins: ['https://nexrena.com', 'https://www.nexrena.com'],
  },
  fpusa: {
    contactId: 'joe-loperena-furniture-packages',
    label: 'Furniture Packages USA',
    origins: [
      'https://furniturepackagesusa.com',
      'https://www.furniturepackagesusa.com',
      'http://localhost:4321',
      'http://127.0.0.1:4321',
    ],
    formSecretEnv: 'FPUSA_FORM_SECRET',
  },
  nicoloperena: {
    contactId: 'nicholas-loperena-portfolio',
    label: 'NicoLoperena.com',
    origins: [
      'https://www.nicoloperena.com',
      'https://nicoloperena.com',
      'http://localhost:4321',
      'http://127.0.0.1:4321',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ],
    formSecretEnv: 'NICOLOPERENA_FORM_SECRET',
  },
}

export function getSiteConfig(siteKey: string): SiteConfig | null {
  return SITES[siteKey] ?? null
}

export function allSiteOrigins(): string[] {
  const set = new Set<string>()
  for (const site of Object.values(SITES)) {
    for (const origin of site.origins) set.add(origin)
  }
  return [...set]
}

export function verifySiteSecret(siteKey: string, secret: string | undefined): boolean {
  const site = getSiteConfig(siteKey)
  if (!site?.formSecretEnv) return true
  const expected = process.env[site.formSecretEnv]
  if (!expected) return true
  return Boolean(secret && secret === expected)
}
