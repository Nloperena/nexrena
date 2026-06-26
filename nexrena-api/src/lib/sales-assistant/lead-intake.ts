import { createLead } from '../create-lead'
import type {
  ChatIntent,
  IntakeSubmitPayload,
  LeadIntakeField,
  LeadIntakeState,
  PublicChatMessage,
  QualificationProfile,
} from './types'

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/

export function extractEmail(text: string): string | undefined {
  const match = text.match(EMAIL_RE)
  return match?.[0]?.toLowerCase()
}

export function extractName(text: string): string | undefined {
  const patterns = [
    /(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})/i,
    /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2})\s*[,—-]\s*[a-z0-9._%+-]+@/,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1].trim().slice(0, 80)
  }
  return undefined
}

export function extractCompany(text: string): string | undefined {
  const patterns = [
    /(?:company is|work at|from|business is|we're|we are)\s+([A-Z][\w\s&'.-]{2,60})/i,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return match[1].trim().replace(/\s+(and|with|looking|interested).*$/i, '').slice(0, 80)
  }
  return undefined
}

export function mergeIntakeFromMessages(
  intake: LeadIntakeState,
  messages: PublicChatMessage[],
): LeadIntakeState {
  const next = { ...intake }
  for (const msg of messages) {
    if (msg.role !== 'user') continue
    const email = extractEmail(msg.content)
    const name = extractName(msg.content)
    const company = extractCompany(msg.content)
    if (email) next.email = email
    if (name) next.name = name
    if (company) next.company = company
  }
  return refreshIntakeStage(next)
}

export function mergeIntakeSubmit(
  intake: LeadIntakeState,
  payload: IntakeSubmitPayload,
): LeadIntakeState {
  return refreshIntakeStage({
    ...intake,
    name: payload.name.trim(),
    email: payload.email.trim().toLowerCase(),
    company: payload.company?.trim() || intake.company,
    stage: intake.stage,
  })
}

export function refreshIntakeStage(intake: LeadIntakeState): LeadIntakeState {
  if (intake.stage === 'submitted') return intake
  const hasRequired = Boolean(intake.name?.trim() && intake.email?.trim())
  return {
    ...intake,
    stage: hasRequired ? 'ready' : intake.stage === 'none' ? 'none' : 'collecting',
  }
}

export function missingIntakeFields(intake: LeadIntakeState): LeadIntakeField[] {
  const missing: LeadIntakeField[] = []
  if (!intake.name?.trim()) missing.push('name')
  if (!intake.email?.trim()) missing.push('email')
  return missing
}

export function shouldStartIntake(
  intent: ChatIntent,
  messages: PublicChatMessage[],
  leadScore: number,
): boolean {
  const last = messages.filter((m) => m.role === 'user').at(-1)?.content.toLowerCase() ?? ''
  if (/get started|sign me up|contact me|send (?:this|my info)|start intake|ready to (?:start|begin)|book (?:a )?project/i.test(last)) {
    return true
  }
  if (extractEmail(last)) return true
  if (leadScore >= 45 || intent === 'discovery') return true
  return false
}

export function wantsImmediateSubmit(text: string): boolean {
  return /^(yes|yep|yeah|submit|send it|that's correct|looks good|go ahead|please send)/i.test(text.trim())
}

function mapPlanFromQualification(q: QualificationProfile): { projectType?: string; budget?: string } {
  const blob = `${q.budget ?? ''} ${q.goals ?? ''}`.toLowerCase()
  if (/399|lead engine|lead-engine/.test(blob)) return { projectType: 'plan-lead-engine', budget: '399/mo' }
  if (/249|growth/.test(blob)) return { projectType: 'plan-growth', budget: '249/mo' }
  if (/149|launch/.test(blob)) return { projectType: 'plan-launch', budget: '149/mo' }
  if (/50k|enterprise/.test(blob)) return { projectType: 'web-design', budget: '50k+' }
  if (/25k|30k/.test(blob)) return { projectType: 'web-design', budget: '25k-50k' }
  if (/10k|15k/.test(blob)) return { projectType: 'web-design', budget: '10k-25k' }
  if (/seo/.test(blob)) return { projectType: 'seo' }
  return { projectType: 'plan-growth', budget: '249/mo' }
}

export function buildLeadMessage(params: {
  intake: LeadIntakeState
  qualification: QualificationProfile
  messages: PublicChatMessage[]
  pageUrl?: string
  sessionId: string
  customMessage?: string
}): string {
  const { projectType, budget } = mapPlanFromQualification(params.qualification)
  const userLines = params.messages
    .filter((m) => m.role === 'user')
    .slice(-6)
    .map((m) => `• ${m.content}`)
    .join('\n')

  const qualLines = Object.entries(params.qualification)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  return [
    'Submitted via Nexrena website chat assistant.',
    '',
    params.customMessage?.trim() || 'Visitor requested follow-up from chat.',
    '',
    `Session: ${params.sessionId}`,
    params.pageUrl ? `Page: ${params.pageUrl}` : null,
    params.intake.company ? `Company: ${params.intake.company}` : null,
    qualLines ? `\nQualification:\n${qualLines}` : null,
    `\nRecommended fit: ${projectType ?? 'plan-growth'} (${budget ?? '249/mo'})`,
    userLines ? `\nRecent chat:\n${userLines}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

export async function submitChatLead(params: {
  intake: LeadIntakeState
  qualification: QualificationProfile
  messages: PublicChatMessage[]
  pageUrl?: string
  sessionId: string
  customMessage?: string
}) {
  if (!params.intake.name?.trim() || !params.intake.email?.trim()) {
    throw new Error('name and email are required for intake')
  }

  const { projectType, budget } = mapPlanFromQualification(params.qualification)
  const lead = await createLead({
    name: params.intake.name,
    email: params.intake.email,
    company: params.intake.company ?? null,
    budget,
    projectType,
    source: 'chat-assistant',
    message: buildLeadMessage(params),
  })

  return lead
}

export function intakePromptForMissing(intake: LeadIntakeState, contactLabel = 'Nico'): string | null {
  const missing = missingIntakeFields(intake)
  if (!missing.length) return null
  if (missing.includes('name') && missing.includes('email')) {
    return `To send your details to ${contactLabel}, I just need your name and email — or use the quick form below.`
  }
  if (missing.includes('name')) return 'What name should I put on the request?'
  if (missing.includes('email')) return `What email should ${contactLabel} reply to?`
  return null
}
