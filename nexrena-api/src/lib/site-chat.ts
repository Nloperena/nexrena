import type { Request } from 'express'
import { getSiteConfig, resolveSiteKeyFromOrigin, SITES } from './sites'

export type ResolvedSite = {
  siteKey: string
  config: NonNullable<ReturnType<typeof getSiteConfig>>
}

export function resolveSiteFromRequest(req: Request, bodySiteKey?: unknown): ResolvedSite {
  const fromBody = typeof bodySiteKey === 'string' ? bodySiteKey.trim() : ''
  const fromHeader =
    typeof req.headers['x-site-key'] === 'string' ? req.headers['x-site-key'].trim() : ''
  const fromOrigin = resolveSiteKeyFromOrigin(
    typeof req.headers.origin === 'string' ? req.headers.origin : undefined,
  )

  const siteKey = fromBody || fromHeader || fromOrigin || 'nexrena'
  const config = getSiteConfig(siteKey)

  if (!config?.chat.enabled) {
    const fallback = getSiteConfig('nexrena')!
    return { siteKey: 'nexrena', config: fallback }
  }

  return { siteKey, config }
}

export function publicChatConfig(siteKey: string) {
  const site = getSiteConfig(siteKey)
  if (!site?.chat.enabled) return null
  return {
    siteKey,
    label: site.label,
    assistantName: site.chat.assistantName,
    subtitle: site.chat.subtitle,
    welcomeMessage: site.chat.welcomeMessage,
    links: site.chat.links,
  }
}

export function listManagedSitesForOps() {
  return Object.entries(SITES).map(([siteKey, site]) => ({
    siteKey,
    label: site.label,
    category: site.managedCategory,
    chatEnabled: site.chat.enabled,
    formEnabled: Boolean(site.contactId),
    contactId: site.contactId || null,
    origins: site.origins,
  }))
}

export { SITES }
