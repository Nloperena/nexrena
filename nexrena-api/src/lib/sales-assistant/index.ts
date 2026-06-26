import { randomBytes } from 'crypto'
import { buildActions, suggestedReplies } from './actions'
import { logChatTurn, logKnowledgeGap } from './analytics'
import { formatAssistantMessage } from './format-response'
import { generateGroundedReply } from './grounded-fallback'
import { applyGuardrails, isGenericFallback } from './guardrails'
import { callGemini, isLlmConfigured } from './gemini'
import { classifyIntent } from './intent'
import { getOrCreateSession, saveSession, touchSession } from './memory'
import { appendIntakeGuidance, buildIntakeView, processLeadIntake } from './intake-flow'
import { buildSystemPrompt } from './prompts/system'
import {
  computeLeadScore,
  qualificationSummary,
  updateQualificationFromConversation,
} from './qualification'
import { formatRecommendationsBlock, recommendServices } from './recommendations'
import { formatRetrievalForLog, retrieveKnowledge } from './retrieval'
import type { IntakeSubmitPayload, PublicChatMessage, SalesAssistantInput, SalesAssistantResult } from './types'

export * from './types'
export { isLlmConfigured as isPublicChatConfigured }

function sanitizeMessages(raw: unknown): PublicChatMessage[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (m): m is PublicChatMessage =>
        typeof m === 'object' &&
        m !== null &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string',
    )
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, 500) }))
    .filter((m) => m.content.length >= 2)
    .slice(-12)
}

export function validatePublicChatInput(
  rawMessages: unknown,
  intakeSubmit?: IntakeSubmitPayload,
): PublicChatMessage[] {
  const messages = sanitizeMessages(rawMessages)
  if (messages.length === 0 && intakeSubmit) {
    return [{ role: 'user', content: 'Submitting my contact details through chat.' }]
  }
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  if (!lastUser) throw new Error('messages must include at least one user message')
  return messages
}

export function createSessionId(): string {
  return `sess_${randomBytes(12).toString('hex')}`
}

function buildAugmentedSystemPrompt(
  intent: ReturnType<typeof classifyIntent>,
  contextBlock: string,
  qualificationBlock: string,
  recommendationsBlock: string,
): string {
  return `${buildSystemPrompt(intent)}

## KNOWLEDGE CONTEXT (only source of truth for facts)
${contextBlock}

## VISITOR SIGNALS (from conversation — may be incomplete)
${qualificationBlock}

## RECOMMENDATION HINTS (use if relevant; do not dump all)
${recommendationsBlock}`
}

export async function generateSalesAssistantReply(
  input: SalesAssistantInput,
  meta?: { ip?: string },
): Promise<SalesAssistantResult> {
  const messages = validatePublicChatInput(input.messages, input.intakeSubmit)
  const lastUser = messages.filter((m) => m.role === 'user').at(-1)!
  const sessionId = input.sessionId?.trim() || createSessionId()
  const session = getOrCreateSession(sessionId)

  const historyText = messages.filter((m) => m.role === 'user').map((m) => m.content)
  const intent = classifyIntent(lastUser.content, historyText.slice(0, -1))
  touchSession(session, intent)

  const qualification = updateQualificationFromConversation(messages)
  session.qualification = qualification
  const leadScore = computeLeadScore(qualification, intent)

  const intakeResult = await processLeadIntake({
    intake: session.leadIntake,
    qualification,
    messages,
    sessionId,
    pageUrl: input.pageUrl,
    intakeSubmit: input.intakeSubmit,
    intent,
    leadScore,
  })
  session.leadIntake = intakeResult.intake
  saveSession(session)

  const intakeView = buildIntakeView(session.leadIntake, qualification, messages)

  if (intakeResult.submittedMessage) {
    const actions = buildActions(intent, qualification, leadScore, session.leadIntake)
    void logChatTurn({
      sessionId,
      ip: meta?.ip,
      pageUrl: input.pageUrl,
      role: 'assistant',
      content: intakeResult.submittedMessage,
      intent,
      actions,
      leadScore,
      qualification,
    })
    return {
      message: intakeResult.submittedMessage,
      configured: isLlmConfigured(),
      sessionId,
      intent,
      actions,
      suggestedReplies: ['Book a free call', 'Compare plans', 'Tell me about Growth plan'],
      qualification,
      leadScore,
      grounded: false,
      intake: intakeView,
    }
  }

  const retrieval = retrieveKnowledge(lastUser.content, intent, 5)
  const recs = recommendServices(qualification, intent)
  const systemPrompt = buildAugmentedSystemPrompt(
    intent,
    retrieval.contextBlock,
    qualificationSummary(qualification),
    formatRecommendationsBlock(recs) || '(none yet)',
  )

  const configured = isLlmConfigured()
  let message: string | null = null
  let grounded = false

  if (configured) {
    message = await callGemini(systemPrompt, messages)
  }

  if (!message || isGenericFallback(message)) {
    message = generateGroundedReply(lastUser.content, intent, messages)
    grounded = true
  }

  const guarded = applyGuardrails(message, true)
  message = formatAssistantMessage(guarded.text, intent)
  message = appendIntakeGuidance(message, session.leadIntake)

  if (retrieval.topScore < 3 && !grounded) {
    void logKnowledgeGap(sessionId, lastUser.content, intent)
  }

  const actions = buildActions(intent, qualification, leadScore, session.leadIntake)
  const suggestions = suggestedReplies(intent, qualification, session.leadIntake)

  void logChatTurn({
    sessionId,
    ip: meta?.ip,
    pageUrl: input.pageUrl,
    role: 'user',
    content: lastUser.content,
    intent,
    retrievedIds: formatRetrievalForLog(retrieval.chunks),
    leadScore,
    qualification,
  })

  void logChatTurn({
    sessionId,
    ip: meta?.ip,
    pageUrl: input.pageUrl,
    role: 'assistant',
    content: message,
    intent,
    actions,
    leadScore,
    qualification,
    flagged: guarded.flagged,
    grounded,
  })

  return {
    message,
    configured,
    sessionId,
    intent,
    actions,
    suggestedReplies: suggestions,
    qualification,
    leadScore,
    grounded,
    intake: intakeView,
  }
}

/** Back-compat wrapper */
export async function generatePublicChatReply(
  rawMessages: unknown,
  meta?: { ip?: string; sessionId?: string; pageUrl?: string },
): Promise<SalesAssistantResult> {
  return generateSalesAssistantReply(
    { messages: rawMessages, sessionId: meta?.sessionId, pageUrl: meta?.pageUrl },
    { ip: meta?.ip },
  )
}
