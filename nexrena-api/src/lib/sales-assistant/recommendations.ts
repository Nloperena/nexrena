import type { ChatIntent, QualificationProfile } from './types'

export type ServiceRecommendation = {
  service: string
  tier?: string
  rationale: string
  href: string
}

export function recommendServices(
  profile: QualificationProfile,
  intent: ChatIntent,
): ServiceRecommendation[] {
  const recs: ServiceRecommendation[] = []
  const budget = (profile.budget ?? '').toLowerCase()
  const goals = (profile.goals ?? '').toLowerCase()
  const industry = (profile.industry ?? '').toLowerCase()
  const pain = (profile.painPoint ?? '').toLowerCase()

  const wantsSeo = intent === 'seo' || intent === 'local_seo' || /seo|rank|traffic/.test(goals + pain)
  const wantsRebuild = intent === 'web_design' || /redesign|rebuild|new website|migrate/.test(goals + pain)
  const isLocal = intent === 'local_business' || /contractor|clinic|salon|local|small business/.test(industry)
  const isEnterprise = intent === 'enterprise' || /50k|enterprise|catalog|200\+|multi-site/.test(budget + goals)
  const wantsWaas = intent === 'waas' || /149|249|399|monthly|waas|managed/.test(budget)

  if (isLocal || wantsWaas) {
    const tier = /399|lead engine|pro/.test(budget)
      ? 'Lead Engine Plan ($399/mo+)'
      : /249|growth/.test(budget)
        ? 'Growth Website Plan ($249/mo) — recommended'
        : 'Growth Website Plan ($249/mo) or Launch ($149/mo)'
    recs.push({
      service: 'Website-as-a-Service',
      tier,
      rationale: 'Predictable monthly care — hosting, edits, SEO basics, no huge upfront fee.',
      href: '/pricing/',
    })
  }

  if (wantsRebuild && isEnterprise) {
    recs.push({
      service: 'Web Design & Development',
      tier: 'Enterprise project ($30k–$50k+)',
      rationale: 'Complex catalogs, portals, or integrations need scoped custom delivery.',
      href: '/services/web-design/',
    })
  } else if (wantsRebuild) {
    recs.push({
      service: 'Web Design & Development',
      tier: 'Growth project ($15k–$30k) or Starter ($10k–$15k)',
      rationale: 'Conversion-focused B2B build with measurable launch milestones.',
      href: '/services/web-design/',
    })
  }

  if (wantsSeo) {
    recs.push({
      service: 'SEO & Search Growth',
      rationale: 'Technical fixes shipped to production — not audit shelfware.',
      href: '/services/seo-growth/',
    })
  }

  if (/manufactur|industrial|b2b catalog/.test(industry)) {
    recs.push({
      service: 'Reference: Forzabuilt case study',
      rationale: '200+ SKU migration with 99% SEO health and qualified lead lift.',
      href: '/work/forzabuilt/',
    })
  }

  if (/e-?commerce|shopify|store/.test(industry + goals)) {
    recs.push({
      service: 'Reference: VITO Fryfilter case study',
      rationale: '+38% conversion and +85% international revenue post-rebuild.',
      href: '/work/vito-fryfilter/',
    })
  }

  if (recs.length === 0) {
    recs.push({
      service: 'Full-Service Growth',
      rationale: 'When strategy, build, and SEO need one accountable owner.',
      href: '/services/full-service/',
    })
  }

  return recs.slice(0, 3)
}

export function formatRecommendationsBlock(recs: ServiceRecommendation[]): string {
  if (!recs.length) return ''
  return recs.map((r) => `• ${r.service}${r.tier ? ` (${r.tier})` : ''}: ${r.rationale}`).join('\n')
}
