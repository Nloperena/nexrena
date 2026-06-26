export type ChatKnowledgeProfile = 'nexrena' | 'fpusa' | 'nicoloperena' | 'ttag'

export type PublicChatRole = 'user' | 'assistant'

export type PublicChatMessage = {
  role: PublicChatRole
  content: string
}

export type KnowledgeCategory =
  | 'company'
  | 'services'
  | 'pricing'
  | 'portfolio'
  | 'faq'
  | 'process'
  | 'objections'
  | 'policies'

export type KnowledgeChunk = {
  id: string
  category: KnowledgeCategory
  title: string
  content: string
  keywords: string[]
  source: string
}

export type ChatIntent =
  | 'greeting'
  | 'pricing'
  | 'services_overview'
  | 'web_design'
  | 'seo'
  | 'full_service'
  | 'waas'
  | 'portfolio'
  | 'objection'
  | 'comparison'
  | 'timeline'
  | 'maintenance'
  | 'hosting'
  | 'wordpress'
  | 'shopify'
  | 'local_seo'
  | 'gbp'
  | 'analytics'
  | 'conversions'
  | 'branding'
  | 'ai_topic'
  | 'existing_customer'
  | 'enterprise'
  | 'local_business'
  | 'discovery'
  | 'off_topic'
  | 'general'

export type QualificationField =
  | 'company'
  | 'industry'
  | 'goals'
  | 'timeline'
  | 'budget'
  | 'decisionMaker'
  | 'currentWebsite'
  | 'painPoint'

export type QualificationProfile = Partial<Record<QualificationField, string>>

export type ChatAction = {
  type: 'link' | 'schedule' | 'contact' | 'intake'
  label: string
  href: string
}

export type LeadIntakeField = 'name' | 'email' | 'company'

export type LeadIntakeState = {
  name?: string
  email?: string
  company?: string
  stage: 'none' | 'collecting' | 'ready' | 'submitted'
  leadId?: string
}

export type ChatIntakeView = {
  stage: 'none' | 'collecting' | 'ready' | 'submitted'
  showForm: boolean
  missingFields: LeadIntakeField[]
  submitted: boolean
  leadId?: string
  prefilled: {
    name?: string
    email?: string
    company?: string
    message?: string
  }
}

export type IntakeSubmitPayload = {
  name: string
  email: string
  company?: string
  message?: string
}

export type SessionState = {
  sessionId: string
  qualification: QualificationProfile
  leadIntake: LeadIntakeState
  intentsSeen: ChatIntent[]
  turnCount: number
  lastIntent?: ChatIntent
  updatedAt: number
}

export type SalesAssistantInput = {
  messages: unknown
  sessionId?: string
  pageUrl?: string
  siteKey?: string
  intakeSubmit?: IntakeSubmitPayload
}

export type SiteChatRuntime = {
  siteKey: string
  siteLabel: string
  contactId: string
  chat: import('../sites').SiteChatConfig
}

export type SalesAssistantResult = {
  message: string
  configured: boolean
  sessionId: string
  siteKey: string
  intent: ChatIntent
  actions: ChatAction[]
  suggestedReplies: string[]
  qualification: QualificationProfile
  leadScore: number
  grounded: boolean
  intake: ChatIntakeView
}

export const MESSAGE_MAX = 500
export const HISTORY_MAX = 12
export const MIN_MESSAGE_LEN = 2
