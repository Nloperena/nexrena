import type { ChatAction, ChatIntent, QualificationProfile } from './types'
import { recommendServices } from './recommendations'

const SALES_INTENTS: ChatIntent[] = [
  'pricing',
  'waas',
  'local_business',
  'greeting',
  'general',
  'services_overview',
  'web_design',
  'seo',
  'conversions',
]

export function buildActions(
  intent: ChatIntent,
  profile: QualificationProfile,
  leadScore: number,
): ChatAction[] {
  if (intent === 'existing_customer') {
    return [{ type: 'link', label: 'Client portal', href: '/portal/' }]
  }

  const actions: ChatAction[] = []
  const isSales = SALES_INTENTS.includes(intent)

  if (isSales || intent === 'pricing' || intent === 'waas') {
    actions.push({ type: 'link', label: 'Compare plans', href: '/pricing/' })
    actions.push({ type: 'contact', label: 'Get started', href: '/contact/' })
  }

  if (intent === 'discovery' || leadScore >= 35 || isSales) {
    actions.push({ type: 'schedule', label: 'Book a free call', href: '/schedule/' })
  }

  if (intent === 'portfolio' || intent === 'conversions') {
    actions.unshift({ type: 'link', label: 'See results', href: '/work/' })
  }

  if (intent === 'services_overview' && actions.length < 3) {
    actions.push({ type: 'link', label: 'Our services', href: '/services/' })
  }

  const recs = recommendServices(profile, intent)
  const rec = recs[0]
  if (rec && actions.length < 3 && !actions.some((a) => a.href === rec.href)) {
    actions.push({
      type: 'link',
      label: rec.href === '/pricing/' ? 'View pricing' : 'Learn more',
      href: rec.href,
    })
  }

  const seen = new Set<string>()
  return actions
    .filter((a) => {
      if (seen.has(a.href)) return false
      seen.add(a.href)
      return true
    })
    .slice(0, 3)
}

export function suggestedReplies(intent: ChatIntent, profile: QualificationProfile): string[] {
  const byIntent: Partial<Record<ChatIntent, string[]>> = {
    greeting: [
      'I need a new website',
      'What does the $249 plan include?',
      'We need more leads',
    ],
    pricing: [
      'Why is Growth recommended?',
      'Compare all three plans',
      'I am ready to get started',
    ],
    waas: ['Tell me about the Growth plan', 'Is there a setup fee?', 'Get started today'],
    local_business: ['We are a local service business', 'Compare monthly plans', 'Book a call'],
    web_design: ['How long does a build take?', 'We need a redesign', 'What would you recommend?'],
    seo: ['What does SEO include?', 'Can SEO be added to a plan?', 'Schedule a call'],
    general: [
      profile.goals ? 'What plan fits us best?' : 'We need more leads from our site',
      'Compare WaaS plans',
      'I want to get started',
    ],
  }

  return byIntent[intent] ?? byIntent.greeting ?? []
}
