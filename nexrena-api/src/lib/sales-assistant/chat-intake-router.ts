import { prisma } from '../prisma'
import { notifyFormSubmission } from '../notify'
import type { SiteConfig } from '../sites'
import { createLead } from '../create-lead'
import type { PublicChatMessage, QualificationProfile } from './types'
import type { LeadIntakeState } from './types'

export type IntakeSubmitResult = {
  id: string
  mode: 'lead' | 'form'
}

function buildFormFields(params: {
  intake: LeadIntakeState
  qualification: QualificationProfile
  messages: PublicChatMessage[]
  pageUrl?: string
  sessionId: string
  customMessage?: string
}): { message: string; extra: Record<string, string> } {
  const userLines = params.messages
    .filter((m) => m.role === 'user')
    .slice(-6)
    .map((m) => m.content)
    .join('\n')

  const qualLines = Object.entries(params.qualification)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n')

  const message = [
    params.customMessage?.trim() || 'Submitted via website AI chat assistant.',
    params.pageUrl ? `Page: ${params.pageUrl}` : null,
    params.intake.company ? `Company: ${params.intake.company}` : null,
    qualLines ? `Qualification:\n${qualLines}` : null,
    userLines ? `Recent chat:\n${userLines}` : null,
    `Session: ${params.sessionId}`,
  ]
    .filter(Boolean)
    .join('\n\n')

  const extra: Record<string, string> = {}
  if (params.qualification.budget) extra.budget = String(params.qualification.budget)
  if (params.qualification.timeline) extra.timeline = String(params.qualification.timeline)

  return { message, extra }
}

export async function submitChatIntake(params: {
  site: SiteConfig
  siteKey: string
  intake: LeadIntakeState
  qualification: QualificationProfile
  messages: PublicChatMessage[]
  pageUrl?: string
  sessionId: string
  customMessage?: string
}): Promise<IntakeSubmitResult> {
  if (!params.intake.name?.trim() || !params.intake.email?.trim()) {
    throw new Error('name and email are required for intake')
  }

  const { message, extra } = buildFormFields(params)

  if (params.site.chat.intakeMode === 'nexrena_lead') {
    const lead = await createLead({
      name: params.intake.name,
      email: params.intake.email,
      company: params.intake.company ?? null,
      message,
      source: 'chat-assistant',
      projectType: params.qualification.goals?.includes('seo') ? 'seo' : 'plan-growth',
      budget: params.qualification.budget ?? '249/mo',
    })
    return { id: lead.id, mode: 'lead' }
  }

  if (!params.site.contactId) {
    throw new Error(`Site ${params.siteKey} is missing contactId for form intake`)
  }

  const fields = { message, ...extra }
  const row = await prisma.formSubmission.create({
    data: {
      contactId: params.site.contactId,
      siteKey: params.siteKey,
      formName: 'ai-chat',
      submitterName: params.intake.name.trim(),
      submitterEmail: params.intake.email.trim().toLowerCase(),
      fields,
      pageUrl: params.pageUrl?.slice(0, 2048) ?? null,
      status: 'new',
    },
  })

  notifyFormSubmission({
    siteLabel: params.site.label,
    siteKey: params.siteKey,
    formName: 'ai-chat',
    name: row.submitterName,
    email: row.submitterEmail,
    message,
    fields: extra,
    pageUrl: row.pageUrl,
  }).catch(() => {})

  return { id: row.id, mode: 'form' }
}
