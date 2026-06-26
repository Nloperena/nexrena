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
import { buildSystemPrompt } from './prompts/site-prompts'
import {
  computeLeadScore,
  qualificationSummary,
  updateQualificationFromConversation,
} from './qualification'
import { formatRecommendationsBlock, recommendServices } from './recommendations'
import { formatRetrievalForLog, retrieveKnowledge } from './retrieval'
import type {
  IntakeSubmitPayload,
  PublicChatMessage,
  SalesAssistantInput,
  SalesAssistantResult,
  SiteChatRuntime,
} from './types'
import type { SiteConfig } from '../sites'

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
  site: SiteChatRuntime,
): string {
  return `${buildSystemPrompt(intent, site.chat.knowledgeProfile, site.chat)}

## KNOWLEDGE CONTEXT (only source of truth for facts)
${contextBlock}

## VISITOR SIGNALS (from conversation — may be incomplete)
${qualificationBlock}

## RECOMMENDATION HINTS (use if relevant; do not dump all)
${recommendationsBlock}`
}

export async function generateSalesAssistantReply(
  input: SalesAssistantInput,
  meta?: { ip?: string; site: SiteChatRuntime; siteConfig: SiteConfig },
): Promise<SalesAssistantResult> {
  if (!meta?.site || !meta?.siteConfig) throw new Error('site context is required')

  const site = meta.site
  const siteConfig = meta.siteConfig
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
    site,
    siteConfig,
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
    const actions = buildActions(intent, qualification, leadScore, session.leadIntake, site.chat, site.siteKey)
    void logChatTurn({
      sessionId,
      siteKey: site.siteKey,
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
      siteKey: site.siteKey,
      intent,
      actions,
      suggestedReplies: suggestedReplies(intent, qualification, session.leadIntake, site.siteKey),
      qualification,
      leadScore,
      grounded: false,
      intake: intakeView,
    }
  }

  const retrieval = retrieveKnowledge(lastUser.content, intent, 5, site.chat.knowledgeProfile)
  const recs = site.siteKey === 'nexrena' ? recommendServices(qualification, intent) : []
  const systemPrompt = buildAugmentedSystemPrompt(
    intent,
    retrieval.contextBlock,
    qualificationSummary(qualification),
    formatRecommendationsBlock(recs) || '(none yet)',
    site,
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
  message = appendIntakeGuidance(message, session.leadIntake, site.chat.contactLabel)

  if (retrieval.topScore < 3 && !grounded) {
    void logKnowledgeGap(sessionId, lastUser.content, intent)
  }

  const actions = buildActions(intent, qualification, leadScore, session.leadIntake, site.chat, site.siteKey)
  const suggestions = suggestedReplies(intent, qualification, session.leadIntake, site.siteKey)

  void logChatTurn({
    sessionId,
    siteKey: site.siteKey,
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
    siteKey: site.siteKey,
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
    siteKey: site.siteKey,
    intent,
    actions,
    suggestedReplies: suggestions,
    qualification,
    leadScore,
    grounded,
    intake: intakeView,
  }
}

/** Back-compat wrapper — defaults to nexrena site context */
export async function generatePublicChatReply(
  rawMessages: unknown,
  meta?: { ip?: string; sessionId?: string; pageUrl?: string; siteKey?: string },
): Promise<SalesAssistantResult> {
  const { getSiteConfig } = await import('../sites')
  const siteKey = meta?.siteKey?.trim() || 'nexrena'
  const siteConfig = getSiteConfig(siteKey) ?? getSiteConfig('nexrena')!
  return generateSalesAssistantReply(
    { messages: rawMessages, sessionId: meta?.sessionId, pageUrl: meta?.pageUrl, siteKey },
    {
      ip: meta?.ip,
      site: {
        siteKey,
        siteLabel: siteConfig.label,
        contactId: siteConfig.contactId,
        chat: siteConfig.chat,
      },
      siteConfig,
    },
  )
}
