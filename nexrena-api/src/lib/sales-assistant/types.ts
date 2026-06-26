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
  type: 'link' | 'schedule' | 'contact'
  label: string
  href: string
}

export type SessionState = {
  sessionId: string
  qualification: QualificationProfile
  intentsSeen: ChatIntent[]
  turnCount: number
  lastIntent?: ChatIntent
  updatedAt: number
}

export type SalesAssistantInput = {
  messages: unknown
  sessionId?: string
  pageUrl?: string
}

export type SalesAssistantResult = {
  message: string
  configured: boolean
  sessionId: string
  intent: ChatIntent
  actions: ChatAction[]
  suggestedReplies: string[]
  qualification: QualificationProfile
  leadScore: number
  grounded: boolean
}

export const MESSAGE_MAX = 500
export const HISTORY_MAX = 12
export const MIN_MESSAGE_LEN = 2
