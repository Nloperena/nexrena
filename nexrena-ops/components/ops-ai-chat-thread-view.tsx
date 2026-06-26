'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { MessageBubble } from '@/components/message-bubble'
import { MessageThreadListItem } from '@/components/message-thread-list-item'
import { api } from '@/lib/api'
import { groupMessagesByDay } from '@/lib/message-chat-utils'
import {
  inboxAvatarClass,
  inboxKindLabel,
  type InboxFilter,
  type InboxItemDetail,
  type InboxItemSummary,
  type InboxListResponse,
} from '@/lib/ai-chat-types'
import { teamSelectCls } from '@/lib/team-a11y'

type MobilePanel = 'list' | 'thread'

const FILTERS: { id: InboxFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI chat' },
  { id: 'client', label: 'Client sites' },
  { id: 'portfolio', label: 'Portfolio' },
]

export function OpsAiChatThreadView() {
  const [sessions, setSessions] = useState<InboxItemSummary[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [detail, setDetail] = useState<InboxItemDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('list')
  const [filter, setFilter] = useState<InboxFilter>('all')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeSummaryRef = useRef<InboxItemSummary | null>(null)

  const loadSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const qs = filter === 'all' ? '' : `?category=${filter}`
      const data = await api.get<InboxListResponse>(`/chat-sessions${qs}`)
      setSessions(data.sessions)
      setActiveId((current) => {
        if (current && data.sessions.some((s) => s.id === current)) return current
        const first = data.sessions[0] ?? null
        activeSummaryRef.current = first
        return first?.id ?? null
      })
    } catch {
      setError('Could not load site messages.')
    } finally {
      setLoading(false)
    }
  }, [filter])

  const markFormRead = useCallback(async (item: InboxItemSummary) => {
    if (item.kind !== 'form' || !item.unread) return
    const rawId = item.id.replace(/^form:/, '')
    try {
      await api.patch(`/forms/submissions/${rawId}`, { status: 'read' })
      setSessions((prev) =>
        prev.map((s) => (s.id === item.id ? { ...s, unread: false, status: 'read' } : s)),
      )
    } catch {
      /* non-blocking */
    }
  }, [])

  const loadDetail = useCallback(
    async (inboxId: string, summary?: InboxItemSummary) => {
      setDetailLoading(true)
      try {
        const data = await api.get<InboxItemDetail>(`/chat-sessions/${encodeURIComponent(inboxId)}`)
        setDetail(data)
        if (summary) await markFormRead(summary)
      } catch {
        setError('Could not load message details.')
        setDetail(null)
      } finally {
        setDetailLoading(false)
      }
    },
    [markFormRead],
  )

  useEffect(() => { loadSessions() }, [loadSessions])

  useEffect(() => {
    if (!activeId) {
      setDetail(null)
      return
    }
    void loadDetail(activeId, activeSummaryRef.current ?? undefined)
  }, [activeId, loadDetail])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [detail?.turns.length, mobilePanel])

  const openSession = (item: InboxItemSummary) => {
    activeSummaryRef.current = item
    setActiveId(item.id)
    setMobilePanel('thread')
  }

  const activeSummary = sessions.find((s) => s.id === activeId) ?? detail

  const unreadCount = useMemo(() => sessions.filter((s) => s.unread).length, [sessions])

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[50dvh]">
        <p className="animate-pulse text-sm text-slate-500">Loading site messages…</p>
      </div>
    )
  }

  const listHeader = (
    <div className="shrink-0 border-b border-slate-800/60 px-4 py-3 space-y-3 bg-[#111418]">
      <div>
        <p className="text-base font-semibold text-white lg:hidden">Site messages</p>
        <p className="text-sm font-semibold text-white hidden lg:block">All site inboxes</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {sessions.length} items
          {unreadCount > 0 ? ` · ${unreadCount} unread` : ''}
        </p>
      </div>
      <select
        className={`${teamSelectCls} text-sm`}
        value={filter}
        onChange={(e) => setFilter(e.target.value as InboxFilter)}
        aria-label="Filter messages"
      >
        {FILTERS.map((f) => (
          <option key={f.id} value={f.id}>{f.label}</option>
        ))}
      </select>
    </div>
  )

  return (
    <div className="team-messenger flex flex-1 min-h-0 w-full overflow-hidden bg-[#111418] lg:rounded-xl lg:border lg:border-slate-800/60">
      <aside
        className={`${
          mobilePanel === 'list' ? 'flex' : 'hidden'
        } lg:flex w-full lg:w-[min(100%,340px)] shrink-0 flex-col min-h-0 bg-[#111418] lg:bg-slate-900/30 lg:border-r lg:border-slate-800/60`}
      >
        {listHeader}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 space-y-0.5">
          {sessions.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500">
              No messages yet. AI chats, client site forms, and portfolio contact submissions appear here.
            </p>
          ) : (
            sessions.map((session) => (
              <MessageThreadListItem
                key={session.id}
                active={activeId === session.id}
                title={session.visitorLabel}
                subtitle={`${session.siteLabel} · ${inboxKindLabel(session.kind)}`}
                preview={session.lastPreview}
                updatedAt={session.updatedAt}
                unread={session.unread ? 1 : 0}
                avatarLabel={session.visitorLabel}
                avatarClassName={inboxAvatarClass(session.category, session.kind)}
                onClick={() => openSession(session)}
              />
            ))
          )}
        </div>
      </aside>

      <main
        className={`${
          mobilePanel === 'thread' ? 'flex' : 'hidden'
        } lg:flex min-h-0 min-w-0 flex-1 flex-col bg-[#0e1116]`}
      >
        {!activeSummary ? (
          <div className="hidden lg:flex flex-1 items-center justify-center text-sm text-slate-500">
            Select a message to view details.
          </div>
        ) : (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-slate-800/60 px-3 py-3 bg-[#111418]">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-slate-300 hover:text-white lg:hidden"
                onClick={() => setMobilePanel('list')}
                aria-label="Back to list"
              >
                ←
              </button>
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${inboxAvatarClass(activeSummary.category, activeSummary.kind)}`}
              >
                {activeSummary.visitorLabel.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-white">{activeSummary.visitorLabel}</p>
                <p className="truncate text-xs text-slate-400">
                  {activeSummary.siteLabel} · {inboxKindLabel(activeSummary.kind)}
                  {activeSummary.visitorEmail ? ` · ${activeSummary.visitorEmail}` : ''}
                </p>
                {activeSummary.kind === 'ai' && (
                  <p className="truncate text-xs text-slate-500">
                    {activeSummary.turnCount} messages
                    {activeSummary.leadScore != null ? ` · Lead score ${activeSummary.leadScore}` : ''}
                    {activeSummary.lastIntent ? ` · ${formatIntent(activeSummary.lastIntent)}` : ''}
                  </p>
                )}
              </div>
            </header>

            {activeSummary.kind === 'ai' && qualificationLines(activeSummary.qualification ?? {}).length > 0 && (
              <div className="shrink-0 border-b border-slate-800/40 px-4 py-2.5 bg-slate-900/40">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Qualification</p>
                <div className="flex flex-wrap gap-1.5">
                  {qualificationLines(activeSummary.qualification ?? {}).map((line) => (
                    <span
                      key={line}
                      className="rounded-full border border-slate-700/60 bg-slate-800/50 px-2 py-0.5 text-[11px] text-slate-300"
                    >
                      {line}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(activeSummary.kind === 'form' || activeSummary.kind === 'lead') && (
              <div className="shrink-0 border-b border-slate-800/40 px-4 py-2.5 bg-slate-900/40 flex flex-wrap gap-2 text-xs">
                {activeSummary.status && (
                  <span className="rounded-full border border-slate-700/60 bg-slate-800/50 px-2 py-0.5 text-slate-300 capitalize">
                    {activeSummary.status}
                  </span>
                )}
                {detail?.pageUrl && (
                  <a
                    href={detail.pageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gold-light underline truncate max-w-full"
                  >
                    {detail.pageUrl}
                  </a>
                )}
                {activeSummary.kind === 'form' && (
                  <a href="/form-submissions" className="text-slate-400 hover:text-white ml-auto">
                    Manage in Form leads →
                  </a>
                )}
                {activeSummary.kind === 'lead' && (
                  <a href="/leads" className="text-slate-400 hover:text-white ml-auto">
                    Manage in Leads →
                  </a>
                )}
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-3">
              {detailLoading && !detail ? (
                <p className="text-center text-sm text-slate-500 animate-pulse py-8">Loading…</p>
              ) : detail ? (
                groupMessagesByDay(detail.turns).map((group) => (
                  <div key={group.label}>
                    <p className="mb-3 text-center text-xs font-medium text-slate-500">{group.label}</p>
                    <div className="space-y-2">
                      {group.messages.map((turn) => (
                        <div key={turn.id}>
                          <MessageBubble
                            message={{
                              id: turn.id,
                              message: turn.content,
                              createdAt: turn.createdAt,
                            }}
                            isOutgoing={turn.role === 'assistant'}
                            senderLabel={
                              turn.role === 'assistant'
                                ? activeSummary.kind === 'ai'
                                  ? 'Nexrena AI'
                                  : 'Auto-reply'
                                : activeSummary.visitorLabel
                            }
                            variant="ops"
                            size="ops"
                          />
                          {turn.intent && (
                            <p className="mt-0.5 px-1 text-[10px] text-slate-500">{formatIntent(turn.intent)}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-slate-500 py-8">No content.</p>
              )}
              <div ref={messagesEndRef} />
            </div>
          </>
        )}
        {error && <p className="px-4 py-2 text-sm text-red-400 shrink-0">{error}</p>}
      </main>
    </div>
  )
}

function formatIntent(intent: string): string {
  return intent.replace(/_/g, ' ')
}

function qualificationLines(qualification: Record<string, unknown>): string[] {
  const labels: Record<string, string> = {
    company: 'Company',
    industry: 'Industry',
    goals: 'Goals',
    timeline: 'Timeline',
    budget: 'Budget',
    decisionMaker: 'Decision maker',
    currentWebsite: 'Current site',
    painPoint: 'Pain point',
  }
  return Object.entries(qualification)
    .filter(([, value]) => typeof value === 'string' && value.trim())
    .map(([key, value]) => `${labels[key] ?? key}: ${String(value).slice(0, 60)}`)
}
