import type { ChatAction, ChatIntent, QualificationProfile } from './types'
import { recommendServices } from './recommendations'

export function buildActions(
  intent: ChatIntent,
  profile: QualificationProfile,
  leadScore: number,
): ChatAction[] {
  const actions: ChatAction[] = []

  if (intent === 'discovery' || leadScore >= 40) {
    actions.push({ type: 'schedule', label: 'Book discovery call', href: '/schedule/' })
  }

  if (intent === 'pricing' || intent === 'waas') {
    actions.push({ type: 'link', label: 'View pricing', href: '/pricing/' })
  }

  if (intent === 'portfolio' || intent === 'web_design' || intent === 'conversions') {
    actions.push({ type: 'link', label: 'See our work', href: '/work/' })
  }

  if (intent === 'services_overview' || intent === 'general') {
    actions.push({ type: 'link', label: 'Explore services', href: '/services/' })
  }

  if (leadScore >= 25 || intent === 'discovery' || intent === 'pricing') {
    actions.push({ type: 'contact', label: 'Start project intake', href: '/contact/' })
  }

  if (intent === 'existing_customer') {
    return [{ type: 'link', label: 'Client portal', href: '/portal/' }]
  }

  const recs = recommendServices(profile, intent)
  for (const rec of recs.slice(0, 1)) {
    if (!actions.some((a) => a.href === rec.href)) {
      actions.push({ type: 'link', label: rec.service.split(':')[0].slice(0, 32), href: rec.href })
    }
  }

  const seen = new Set<string>()
  return actions.filter((a) => {
    if (seen.has(a.href)) return false
    seen.add(a.href)
    return true
  }).slice(0, 3)
}

export function suggestedReplies(intent: ChatIntent, profile: QualificationProfile): string[] {
  const hasBudget = Boolean(profile.budget)
  const hasGoals = Boolean(profile.goals)

  const byIntent: Partial<Record<ChatIntent, string[]>> = {
    greeting: [
      'What services does Nexrena offer?',
      'How much does a website cost?',
      'Can you share case study results?',
    ],
    pricing: hasBudget
      ? ['What is included in the Growth plan?', 'How does WaaS compare to a custom build?']
      : ['What are your WaaS monthly plans?', 'What do custom projects typically cost?'],
    web_design: ['How long does a redesign take?', 'Can you migrate without losing SEO?'],
    seo: ['What does your SEO service include?', 'How soon might we see results?'],
    portfolio: ['Do you work with manufacturers?', 'Show me an e-commerce example'],
    discovery: ['What happens on a discovery call?', 'How do I get started?'],
    general: hasGoals
      ? ['What would you recommend for us?', 'Can we schedule a call?']
      : ['We need more leads from our website', 'We are planning a redesign'],
  }

  return byIntent[intent] ?? byIntent.greeting ?? []
}
