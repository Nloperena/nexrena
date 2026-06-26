'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageBubble } from '@/components/message-bubble'
import { MessageThreadListItem } from '@/components/message-thread-list-item'
import { api } from '@/lib/api'
import { groupMessagesByDay } from '@/lib/message-chat-utils'
import type { AiChatSessionDetail, AiChatSessionSummary } from '@/lib/ai-chat-types'

type MobilePanel = 'list' | 'thread'

export function OpsAiChatThreadView() {
  const [sessions, setSessions] = useState<AiChatSessionSummary[]>([])
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [detail, setDetail] = useState<AiChatSessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('list')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const loadSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await api.get<{ sessions: AiChatSessionSummary[] }>('/chat-sessions?limit=100')
      setSessions(data.sessions)
      setActiveSessionId((current) => {
        if (current && data.sessions.some((s) => s.sessionId === current)) return current
        return data.sessions[0]?.sessionId ?? null
      })
    } catch {
      setError('Could not load AI chat sessions.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDetail = useCallback(async (sessionId: string) => {
    setDetailLoading(true)
    try {
      const data = await api.get<AiChatSessionDetail>(`/chat-sessions/${encodeURIComponent(sessionId)}`)
      setDetail(data)
    } catch {
      setError('Could not load conversation transcript.')
      setDetail(null)
    } finally {
      setDetailLoading(false)
    }
  }, [])

  useEffect(() => { loadSessions() }, [loadSessions])

  useEffect(() => {
    if (activeSessionId) loadDetail(activeSessionId)
    else setDetail(null)
  }, [activeSessionId, loadDetail])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [detail?.turns.length, mobilePanel])

  const openSession = (sessionId: string) => {
    setActiveSessionId(sessionId)
    setMobilePanel('thread')
  }

  const activeSummary = sessions.find((s) => s.sessionId === activeSessionId) ?? null

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[50dvh]">
        <p className="animate-pulse text-sm text-slate-500">Loading AI conversations…</p>
      </div>
    )
  }

  const listHeader = (
    <div className="shrink-0 border-b border-slate-800/60 px-4 py-3 bg-[#111418]">
      <p className="text-base font-semibold text-white lg:hidden">AI chats</p>
      <p className="text-sm font-semibold text-white hidden lg:block">Website visitors</p>
      <p className="text-xs text-slate-400 mt-0.5">{sessions.length} conversations</p>
    </div>
  )

  return (
    <div className="team-messenger flex flex-1 min-h-0 w-full overflow-hidden bg-[#111418] lg:rounded-xl lg:border lg:border-slate-800/60">
      <aside
        className={`${
          mobilePanel === 'list' ? 'flex' : 'hidden'
        } lg:flex w-full lg:w-[min(100%,320px)] shrink-0 flex-col min-h-0 bg-[#111418] lg:bg-slate-900/30 lg:border-r lg:border-slate-800/60`}
      >
        {listHeader}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 space-y-0.5">
          {sessions.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500">
              No AI chat conversations yet. They appear here when visitors use the assistant on nexrena.com.
            </p>
          ) : (
            sessions.map((session) => (
              <MessageThreadListItem
                key={session.sessionId}
                active={activeSessionId === session.sessionId}
                title={session.visitorLabel}
                subtitle={session.pageUrl ? `Started on ${session.pageUrl}` : 'Website chat'}
                preview={session.lastPreview}
                updatedAt={session.updatedAt}
                avatarLabel={session.visitorLabel}
                avatarClassName="bg-violet-500/20 text-violet-200"
                onClick={() => openSession(session.sessionId)}
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
            Select a conversation to view the transcript.
          </div>
        ) : (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-slate-800/60 px-3 py-3 bg-[#111418]">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-slate-300 hover:text-white lg:hidden"
                onClick={() => setMobilePanel('list')}
                aria-label="Back to conversations"
              >
                ←
              </button>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-violet-500/20 text-sm font-bold text-violet-200">
                {activeSummary.visitorLabel.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-white">{activeSummary.visitorLabel}</p>
                <p className="truncate text-xs text-slate-400">
                  {activeSummary.turnCount} messages · Lead score {activeSummary.leadScore}
                  {activeSummary.lastIntent ? ` · ${formatIntent(activeSummary.lastIntent)}` : ''}
                </p>
              </div>
            </header>

            {qualificationLines(activeSummary.qualification).length > 0 && (
              <div className="shrink-0 border-b border-slate-800/40 px-4 py-2.5 bg-slate-900/40">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">Qualification</p>
                <div className="flex flex-wrap gap-1.5">
                  {qualificationLines(activeSummary.qualification).map((line) => (
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

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-3">
              {detailLoading && !detail ? (
                <p className="text-center text-sm text-slate-500 animate-pulse py-8">Loading transcript…</p>
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
                            senderLabel={turn.role === 'assistant' ? 'Nexrena AI' : 'Visitor'}
                            variant="ops"
                            size="ops"
                          />
                          {(turn.intent || turn.grounded || turn.flagged) && (
                            <p className="mt-0.5 px-1 text-[10px] text-slate-500">
                              {turn.intent ? formatIntent(turn.intent) : ''}
                              {turn.grounded ? ' · grounded' : ''}
                              {turn.flagged ? ' · flagged' : ''}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-slate-500 py-8">No messages in this session.</p>
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
