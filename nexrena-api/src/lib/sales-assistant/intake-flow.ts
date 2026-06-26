import type {
  ChatIntakeView,
  IntakeSubmitPayload,
  LeadIntakeState,
  PublicChatMessage,
  QualificationProfile,
} from './types'
import {
  intakePromptForMissing,
  mergeIntakeFromMessages,
  mergeIntakeSubmit,
  missingIntakeFields,
  shouldStartIntake,
  submitChatLead,
  wantsImmediateSubmit,
} from './lead-intake'

export function buildIntakeView(
  intake: LeadIntakeState,
  qualification: QualificationProfile,
  messages: PublicChatMessage[],
): ChatIntakeView {
  const missing = missingIntakeFields(intake)
  const showForm = intake.stage === 'collecting' || intake.stage === 'ready'

  const summary = messages
    .filter((m) => m.role === 'user')
    .slice(-3)
    .map((m) => m.content)
    .join(' | ')

  return {
    stage: intake.stage,
    showForm: intake.stage !== 'submitted' && showForm,
    missingFields: missing,
    submitted: intake.stage === 'submitted',
    leadId: intake.leadId,
    prefilled: {
      name: intake.name,
      email: intake.email,
      company: intake.company,
      message: summary || qualification.goals || undefined,
    },
  }
}

export async function processLeadIntake(params: {
  intake: LeadIntakeState
  qualification: QualificationProfile
  messages: PublicChatMessage[]
  sessionId: string
  pageUrl?: string
  intakeSubmit?: IntakeSubmitPayload
  intent: import('./types').ChatIntent
  leadScore: number
}): Promise<{ intake: LeadIntakeState; submittedMessage?: string }> {
  let intake = { ...params.intake }

  if (params.intakeSubmit) {
    intake = mergeIntakeSubmit(intake, params.intakeSubmit)
    intake.stage = 'ready'
  } else {
    intake = mergeIntakeFromMessages(intake, params.messages)
  }

  if (intake.stage !== 'submitted' && shouldStartIntake(params.intent, params.messages, params.leadScore)) {
    if (intake.stage === 'none') intake.stage = 'collecting'
  }

  const lastUser = params.messages.filter((m) => m.role === 'user').at(-1)?.content ?? ''
  const shouldSubmit =
    params.intakeSubmit ||
    (intake.stage === 'ready' && (wantsImmediateSubmit(lastUser) || params.intakeSubmit))

  if (shouldSubmit && intake.stage !== 'submitted' && intake.name && intake.email) {
    const lead = await submitChatLead({
      intake,
      qualification: params.qualification,
      messages: params.messages,
      pageUrl: params.pageUrl,
      sessionId: params.sessionId,
      customMessage: params.intakeSubmit?.message,
    })
    intake = { ...intake, stage: 'submitted', leadId: lead.id }
    return {
      intake,
      submittedMessage: `Done — I sent your details to Nico at Nexrena. You'll hear back within one business day at ${intake.email}. Want to book a call now, or keep exploring plans?`,
    }
  }

  return { intake }
}

export function appendIntakeGuidance(message: string, intake: LeadIntakeState): string {
  if (intake.stage === 'submitted') return message
  const prompt = intakePromptForMissing(intake)
  if (!prompt) {
    if (intake.stage === 'ready') {
      return `${message}\n\nI have your contact info ready to send. Say "send it" or tap Submit below.`
    }
    return message
  }
  if (message.toLowerCase().includes('email') || message.toLowerCase().includes('name')) return message
  return `${message}\n\n${prompt}`
}
