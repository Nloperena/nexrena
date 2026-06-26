export type ChatKnowledgeProfile = 'nexrena' | 'fpusa' | 'nicoloperena' | 'ttag'

export type ChatIntakeMode = 'nexrena_lead' | 'form_submission'

export type SiteChatLinks = {
  contact?: string
  schedule?: string
  pricing?: string
  work?: string
}

export type SiteChatConfig = {
  enabled: boolean
  knowledgeProfile: ChatKnowledgeProfile
  assistantName: string
  subtitle: string
  welcomeMessage: string
  intakeMode: ChatIntakeMode
  contactLabel: string
  intakeSuccessMessage: string
  links: SiteChatLinks
}

export type SiteConfig = {
  contactId: string
  label: string
  origins: string[]
  formSecretEnv?: string
  /** Managed site category for ops inbox */
  managedCategory: 'portfolio' | 'client' | 'agency'
  chat: SiteChatConfig
}

const NEXRENA_CHAT: SiteChatConfig = {
  enabled: true,
  knowledgeProfile: 'nexrena',
  assistantName: 'Nexrena AI',
  subtitle: 'Sales consultant · plans from $149/mo',
  welcomeMessage:
    'Hi — I can help you pick the right Nexrena plan. Monthly website care starts at $149/mo, and most businesses choose Growth at $249/mo.\n\nWhat are you looking for — a new site, more leads, or SEO?',
  intakeMode: 'nexrena_lead',
  contactLabel: 'Nico',
  intakeSuccessMessage:
    "Done — I sent your details to Nico at Nexrena. You'll hear back within one business day at {email}. Want to book a call now, or keep exploring plans?",
  links: {
    contact: '/contact/',
    schedule: '/schedule/',
    pricing: '/pricing/',
    work: '/work/',
  },
}

/** Registered client websites — forms + AI chat */
export const SITES: Record<string, SiteConfig> = {
  nexrena: {
    contactId: '',
    label: 'Nexrena',
    origins: ['https://nexrena.com', 'https://www.nexrena.com'],
    managedCategory: 'agency',
    chat: NEXRENA_CHAT,
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
    managedCategory: 'client',
    chat: {
      enabled: true,
      knowledgeProfile: 'fpusa',
      assistantName: 'FPUSA Assistant',
      subtitle: 'Turn-key furnishing for investors',
      welcomeMessage:
        'Hi — I help with Furniture Packages USA turn-key furnishing for rental and investment properties in Florida.\n\nAre you furnishing a new property, refreshing a portfolio unit, or looking for a quote?',
      intakeMode: 'form_submission',
      contactLabel: 'the FPUSA team',
  intakeSuccessMessage:
    "Thanks — your details are with the FPUSA team. Expect a reply within one business day at {email}.",
      links: {
        contact: 'https://furniturepackagesusa.com/contact',
        schedule: 'https://calendly.com/nicoloperena/discovery',
      },
    },
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
    managedCategory: 'portfolio',
    chat: {
      enabled: true,
      knowledgeProfile: 'nicoloperena',
      assistantName: 'Portfolio Assistant',
      subtitle: 'Projects & availability',
      welcomeMessage:
        "Hi — I'm Nicholas Loperena's portfolio assistant. Ask about case studies, technical skills, or hiring Nicholas for web, SEO, or product work.\n\nWhat are you building?",
      intakeMode: 'form_submission',
      contactLabel: 'Nicholas',
  intakeSuccessMessage:
    'Got it — I sent your message to Nicholas at {email}. He typically replies within one business day.',
      links: {
        contact: 'https://www.nicoloperena.com/#contact',
        schedule: 'https://calendly.com/nicoloperena/discovery',
        work: 'https://www.nicoloperena.com/#work',
      },
    },
  },
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
    managedCategory: 'client',
    chat: {
      enabled: true,
      knowledgeProfile: 'ttag',
      assistantName: 'TTAG Assistant',
      subtitle: 'The Two Azalea Group',
      welcomeMessage:
        'Hi — welcome to The Two Azalea Group. I can answer questions about our services and connect you with the team.\n\nWhat can we help you with?',
      intakeMode: 'form_submission',
      contactLabel: 'the TTAG team',
      intakeSuccessMessage:
        "Thanks — your details were sent to the TTAG team. Someone will follow up shortly.",
      links: {
        contact: 'https://www.thetwoazaleagroup.com/contact',
      },
    },
  },
}

export function getSiteConfig(siteKey: string): SiteConfig | null {
  return SITES[siteKey] ?? null
}

export function getChatEnabledSites(): Array<{ siteKey: string; config: SiteConfig }> {
  return Object.entries(SITES)
    .filter(([, site]) => site.chat.enabled)
    .map(([siteKey, config]) => ({ siteKey, config }))
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

export function resolveSiteKeyFromOrigin(origin: string | undefined): string | null {
  if (!origin) return null
  const normalized = origin.replace(/\/$/, '')
  for (const [key, site] of Object.entries(SITES)) {
    if (site.origins.some((o) => o.replace(/\/$/, '') === normalized)) return key
  }
  return null
}

export function inboxCategoryForSite(siteKey: string): 'ai' | 'client' | 'portfolio' {
  const site = getSiteConfig(siteKey)
  if (!site) return 'client'
  if (siteKey === 'nexrena') return 'ai'
  if (site.managedCategory === 'portfolio') return 'portfolio'
  return 'client'
}
