import type { SiteChatConfig } from '../sites'
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

function pushLink(actions: ChatAction[], label: string, href: string | undefined) {
  if (!href || actions.some((a) => a.href === href)) return
  actions.push({ type: 'link', label, href })
}

export function buildActions(
  intent: ChatIntent,
  profile: QualificationProfile,
  leadScore: number,
  intake: LeadIntakeState | undefined,
  chat: SiteChatConfig,
  siteKey: string,
): ChatAction[] {
  if (intent === 'existing_customer' && siteKey === 'nexrena') {
    return [{ type: 'link', label: 'Client portal', href: '/portal/' }]
  }

  const actions: ChatAction[] = []
  const isSales = SALES_INTENTS.includes(intent)
  const intakeActive = intake && intake.stage !== 'submitted' && intake.stage !== 'none'

  if (intakeActive) {
    actions.push({ type: 'intake', label: 'Send my details', href: '#chat-intake' })
  }

  if (siteKey === 'nexrena') {
    if (isSales || intent === 'pricing' || intent === 'waas') {
      pushLink(actions, 'Compare plans', chat.links.pricing)
      if (!intakeActive) {
        actions.push({ type: 'intake', label: 'Get started', href: '#chat-intake' })
      }
    }
    if (intent === 'portfolio' || intent === 'conversions') {
      pushLink(actions, 'See results', chat.links.work)
    }
    const recs = recommendServices(profile, intent)
    if (recs[0]) pushLink(actions, 'Learn more', recs[0].href)
  } else {
    if (!intakeActive) {
      actions.push({ type: 'intake', label: 'Get started', href: '#chat-intake' })
    }
    pushLink(actions, 'Contact page', chat.links.contact)
    pushLink(actions, 'View work', chat.links.work)
  }

  if (chat.links.schedule && (intent === 'discovery' || leadScore >= 35 || isSales)) {
    actions.push({ type: 'schedule', label: 'Book a call', href: chat.links.schedule })
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
  intake: LeadIntakeState | undefined,
  siteKey: string,
): string[] {
  if (intake?.stage === 'collecting') {
    return ['I am ready to get started', 'Use the form below', 'Book a call instead']
  }
  if (intake?.stage === 'ready') {
    return ['Send it', 'Book a call', siteKey === 'nexrena' ? 'Compare plans' : 'Contact page']
  }

  if (siteKey === 'fpusa') {
    return ['Request a quote', 'What packages do you offer?', 'Get started']
  }
  if (siteKey === 'nicoloperena') {
    return ['See case studies', 'Are you available for hire?', 'Send my project details']
  }

  const byIntent: Partial<Record<ChatIntent, string[]>> = {
    greeting: ['I need a new website', 'What does the $249 plan include?', 'Get started'],
    pricing: ['Why is Growth recommended?', 'Compare all three plans', 'Send my details'],
    discovery: ['Send my contact info', 'Book a discovery call', 'Compare WaaS plans'],
    general: [profile.goals ? 'What plan fits us best?' : 'We need more leads', 'Get started'],
  }

  return byIntent[intent] ?? byIntent.greeting ?? ['Get started']
}
