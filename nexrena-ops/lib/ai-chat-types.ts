export type AiChatSessionSummary = {
  sessionId: string
  createdAt: string
  updatedAt: string
  pageUrl?: string | null
  leadScore: number
  qualification: Record<string, unknown>
  turnCount: number
  lastPreview?: string | null
  lastRole?: string | null
  lastIntent?: string | null
  visitorLabel: string
}

export type AiChatTurn = {
  id: string
  role: 'user' | 'assistant' | string
  content: string
  intent?: string | null
  grounded: boolean
  flagged: boolean
  actions?: unknown
  createdAt: string
}

export type AiChatSessionDetail = AiChatSessionSummary & {
  turns: AiChatTurn[]
}
