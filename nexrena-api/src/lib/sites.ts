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
