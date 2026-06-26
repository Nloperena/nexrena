export type InboxKind = 'ai' | 'form' | 'lead'
export type InboxCategory = 'ai' | 'client' | 'portfolio'

export type InboxItemSummary = {
  id: string
  kind: InboxKind
  category: InboxCategory
  siteKey?: string
  siteLabel: string
  visitorLabel: string
  visitorEmail?: string
  subject?: string
  createdAt: string
  updatedAt: string
  turnCount: number
  lastPreview?: string | null
  unread: boolean
  leadScore?: number
  lastIntent?: string | null
  qualification?: Record<string, unknown>
  status?: string
  pageUrl?: string | null
}

export type InboxTurn = {
  id: string
  role: 'user' | 'assistant' | string
  content: string
  intent?: string | null
  grounded?: boolean
  flagged?: boolean
  actions?: unknown
  createdAt: string
}

export type InboxItemDetail = InboxItemSummary & {
  turns: InboxTurn[]
}

export type InboxFilter = 'all' | InboxCategory

export type InboxListResponse = {
  sessions: InboxItemSummary[]
  limit: number
  siteOptions: Array<{ siteKey: string; label: string; category: InboxCategory }>
  counts: { ai: number; clientForms: number; portfolio: number }
}

/** @deprecated use InboxItemSummary */
export type AiChatSessionSummary = InboxItemSummary
/** @deprecated use InboxItemDetail */
export type AiChatSessionDetail = InboxItemDetail
/** @deprecated use InboxTurn */
export type AiChatTurn = InboxTurn

export function inboxAvatarClass(category: InboxCategory, kind: InboxKind): string {
  if (kind === 'ai') return 'bg-violet-500/20 text-violet-200'
  if (category === 'portfolio') return 'bg-gold/20 text-gold-light'
  return 'bg-sky-500/20 text-sky-200'
}

export function inboxKindLabel(kind: InboxKind): string {
  if (kind === 'ai') return 'AI chat'
  if (kind === 'form') return 'Form'
  return 'Lead'
}
