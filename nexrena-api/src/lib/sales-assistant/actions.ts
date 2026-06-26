import type { ChatAction, ChatIntent, LeadIntakeState, QualificationProfile } from './types'
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
  'discovery',
]

export function buildActions(
  intent: ChatIntent,
  profile: QualificationProfile,
  leadScore: number,
  intake?: LeadIntakeState,
): ChatAction[] {
  if (intent === 'existing_customer') {
    return [{ type: 'link', label: 'Client portal', href: '/portal/' }]
  }

  const actions: ChatAction[] = []
  const isSales = SALES_INTENTS.includes(intent)
  const intakeActive = intake && intake.stage !== 'submitted' && intake.stage !== 'none'

  if (intakeActive) {
    actions.push({ type: 'intake', label: 'Send my details', href: '#chat-intake' })
  }

  if (isSales || intent === 'pricing' || intent === 'waas') {
    actions.push({ type: 'link', label: 'Compare plans', href: '/pricing/' })
    if (!intakeActive) {
      actions.push({ type: 'intake', label: 'Get started', href: '#chat-intake' })
    }
  }

  if (intent === 'discovery' || leadScore >= 35 || isSales) {
    actions.push({ type: 'schedule', label: 'Book a free call', href: '/schedule/' })
  }

  if (intent === 'portfolio' || intent === 'conversions') {
    actions.unshift({ type: 'link', label: 'See results', href: '/work/' })
  }

  const recs = recommendServices(profile, intent)
  const rec = recs[0]
  if (rec && actions.length < 4 && !actions.some((a) => a.href === rec.href)) {
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

export function suggestedReplies(
  intent: ChatIntent,
  profile: QualificationProfile,
  intake?: LeadIntakeState,
): string[] {
  if (intake?.stage === 'collecting') {
    return ['I am ready to get started', 'Use the form below', 'Book a call instead']
  }
  if (intake?.stage === 'ready') {
    return ['Send it', 'Book a free call', 'Compare plans']
  }

  const byIntent: Partial<Record<ChatIntent, string[]>> = {
    greeting: ['I need a new website', 'What does the $249 plan include?', 'Get started'],
    pricing: ['Why is Growth recommended?', 'Compare all three plans', 'Send my details to Nexrena'],
    waas: ['Tell me about the Growth plan', 'Get started today', 'Send my info'],
    discovery: ['Send my contact info', 'Book a discovery call', 'Compare WaaS plans'],
    general: [
      profile.goals ? 'What plan fits us best?' : 'We need more leads from our site',
      'Get started',
      'Send my details',
    ],
  }

  return byIntent[intent] ?? byIntent.greeting ?? []
}
