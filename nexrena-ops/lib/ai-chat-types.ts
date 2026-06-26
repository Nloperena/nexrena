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

export type SiteChatOption = {
  siteKey: string
  label: string
  category: InboxCategory
  chatEnabled: boolean
  chatCount: number
  lastActivityAt: string | null
}

export type InboxListResponse = {
  sessions: InboxItemSummary[]
  limit: number
  siteOptions: SiteChatOption[]
  counts: { ai: number; clientForms: number; portfolio: number }
  refreshedAt?: string
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

export function siteRailAccent(category: InboxCategory): string {
  if (category === 'ai') return 'from-violet-500/20 to-violet-600/5 border-violet-500/30'
  if (category === 'portfolio') return 'from-gold/20 to-amber-600/5 border-gold/35'
  return 'from-sky-500/20 to-cyan-600/5 border-sky-500/30'
}

export function siteRailDot(category: InboxCategory): string {
  if (category === 'ai') return 'bg-violet-400'
  if (category === 'portfolio') return 'bg-gold'
  return 'bg-sky-400'
}

export function inboxKindLabel(kind: InboxKind): string {
  if (kind === 'ai') return 'AI chat'
  if (kind === 'form') return 'Form'
  return 'Lead'
}
