'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageBubble } from '@/components/message-bubble'
import { MessageThreadListItem } from '@/components/message-thread-list-item'
import { groupMessagesByDay, formatThreadTime } from '@/lib/message-chat-utils'
import { inboxAvatarClass, siteRailAccent, siteRailDot } from '@/lib/ai-chat-types'
import { useAiChatsInbox } from './use-ai-chats-inbox'

type Panel = 'sites' | 'list' | 'thread'

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

function siteDomain(siteKey: string): string {
  const map: Record<string, string> = {
    nexrena: 'nexrena.com',
    fpusa: 'furniturepackagesusa.com',
    nicoloperena: 'nicoloperena.com',
    ttag: 'thetwoazaleagroup.com',
  }
  return map[siteKey] ?? siteKey
}

function LiveBadge({ refreshing, lastRefreshedAt }: { refreshing: boolean; lastRefreshedAt: Date | null }) {
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 10_000)
    return () => window.clearInterval(id)
  }, [])

  const ago = useMemo(() => {
    if (!lastRefreshedAt) return null
    void tick
    const sec = Math.max(0, Math.floor((Date.now() - lastRefreshedAt.getTime()) / 1000))
    if (sec < 60) return `${sec}s ago`
    return `${Math.floor(sec / 60)}m ago`
  }, [lastRefreshedAt, tick])

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300">
      <span
        className={`h-1.5 w-1.5 rounded-full bg-emerald-400 ${refreshing ? 'animate-pulse' : ''}`}
        aria-hidden
      />
      Live{ago ? ` · ${ago}` : ''}
    </span>
  )
}

export function OpsAiChatsView() {
  const searchParams = useSearchParams()
  const initialSite = searchParams.get('site')
  const {
    sites,
    sessions,
    activeSiteKey,
    activeSite,
    activeId,
    activeSummary,
    detail,
    loading,
    refreshing,
    detailLoading,
    error,
    lastRefreshedAt,
    selectSite,
    openSession,
    refresh,
  } = useAiChatsInbox(initialSite)

  const [panel, setPanel] = useState<Panel>('sites')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [detail?.turns.length, panel])

  const onSelectSite = (siteKey: string) => {
    selectSite(siteKey)
    setPanel('list')
  }

  const onOpenChat = (id: string) => {
    const item = sessions.find((s) => s.id === id)
    if (item) openSession(item)
    setPanel('thread')
  }

  if (loading && !activeSiteKey) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[50dvh]">
        <p className="animate-pulse text-sm text-slate-500">Loading AI chats…</p>
      </div>
    )
  }

  const siteRail = (
    <aside
      className={`${
        panel === 'sites' ? 'flex' : 'hidden'
      } lg:flex w-full lg:w-[min(100%,280px)] shrink-0 flex-col min-h-0 bg-[#0c0e12] lg:border-r lg:border-slate-800/60`}
    >
      <div className="shrink-0 border-b border-slate-800/60 px-4 py-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-semibold text-white">Websites</p>
          <LiveBadge refreshing={refreshing} lastRefreshedAt={lastRefreshedAt} />
        </div>
        <p className="text-xs text-slate-500">Pick a site to view its AI conversations</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
        {sites.map((site) => {
          const active = site.siteKey === activeSiteKey
          return (
            <button
              key={site.siteKey}
              type="button"
              onClick={() => onSelectSite(site.siteKey)}
              className={`w-full text-left rounded-xl border bg-gradient-to-br px-3.5 py-3 transition-all ${
                siteRailAccent(site.category)
              } ${active ? 'ring-2 ring-gold/40 shadow-lg shadow-black/20' : 'opacity-90 hover:opacity-100'}`}
            >
              <div className="flex items-start gap-2.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${siteRailDot(site.category)}`} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-white">{site.label}</p>
                  <p className="truncate text-[11px] text-slate-400 mt-0.5">{siteDomain(site.siteKey)}</p>
                  <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                    <span className="rounded-md bg-black/25 px-1.5 py-0.5 tabular-nums">
                      {site.chatCount} chat{site.chatCount === 1 ? '' : 's'}
                    </span>
                    {site.lastActivityAt && (
                      <span className="truncate">{formatThreadTime(site.lastActivityAt)}</span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </aside>
  )

  const sessionList = (
    <aside
      className={`${
        panel === 'list' ? 'flex' : 'hidden'
      } lg:flex w-full lg:w-[min(100%,320px)] shrink-0 flex-col min-h-0 bg-[#111418] lg:border-r lg:border-slate-800/60`}
    >
      <div className="shrink-0 border-b border-slate-800/60 px-4 py-3 bg-[#111418]">
        <button
          type="button"
          className="mb-2 text-xs text-slate-400 hover:text-white lg:hidden"
          onClick={() => setPanel('sites')}
        >
          ← All sites
        </button>
        <p className="text-base font-semibold text-white truncate">{activeSite?.label ?? 'AI chats'}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {sessions.length} conversation{sessions.length === 1 ? '' : 's'}
          {loading ? ' · loading…' : ''}
        </p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 space-y-0.5">
        {sessions.length === 0 ? (
          <p className="px-3 py-10 text-center text-sm text-slate-500">
            No AI chats for this site yet. Conversations appear here when visitors use the assistant.
          </p>
        ) : (
          sessions.map((session) => (
            <MessageThreadListItem
              key={session.id}
              active={activeId === session.id}
              title={session.visitorLabel}
              subtitle={
                session.leadScore != null
                  ? `Lead score ${session.leadScore}${session.lastIntent ? ` · ${formatIntent(session.lastIntent)}` : ''}`
                  : session.lastIntent
                    ? formatIntent(session.lastIntent)
                    : `${session.turnCount} messages`
              }
              preview={session.lastPreview}
              updatedAt={session.updatedAt}
              avatarLabel={session.visitorLabel}
              avatarClassName={inboxAvatarClass(session.category, 'ai')}
              onClick={() => onOpenChat(session.id)}
            />
          ))
        )}
      </div>
    </aside>
  )

  return (
    <div className="team-messenger flex flex-1 min-h-0 w-full overflow-hidden bg-[#0e1116] lg:rounded-xl lg:border lg:border-slate-800/60">
      {siteRail}
      {sessionList}

      <main
        className={`${
          panel === 'thread' ? 'flex' : 'hidden'
        } lg:flex min-h-0 min-w-0 flex-1 flex-col bg-[#0a0c10]`}
      >
        {!activeSummary ? (
          <div className="hidden lg:flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm text-slate-400">Select a website, then pick a conversation.</p>
            {activeSite && (
              <p className="text-xs text-slate-500">
                Viewing AI chats only for <span className="text-slate-300">{activeSite.label}</span>
              </p>
            )}
          </div>
        ) : (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-slate-800/60 px-3 py-3 bg-[#111418]">
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full text-lg text-slate-300 hover:text-white lg:hidden"
                onClick={() => setPanel('list')}
                aria-label="Back to chats"
              >
                ←
              </button>
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold ${inboxAvatarClass(activeSummary.category, 'ai')}`}
              >
                {activeSummary.visitorLabel.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-white">{activeSummary.visitorLabel}</p>
                <p className="truncate text-xs text-slate-400">
                  {activeSummary.turnCount} messages
                  {activeSummary.leadScore != null ? ` · Lead score ${activeSummary.leadScore}` : ''}
                  {activeSummary.lastIntent ? ` · ${formatIntent(activeSummary.lastIntent)}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void refresh()}
                className="hidden sm:inline-flex shrink-0 rounded-lg border border-slate-700/60 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:border-slate-600"
              >
                Refresh
              </button>
            </header>

            {qualificationLines(activeSummary.qualification ?? {}).length > 0 && (
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

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-3">
              {detailLoading && !detail ? (
                <p className="text-center text-sm text-slate-500 animate-pulse py-8">Loading conversation…</p>
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
                                ? `${activeSite?.label ?? 'Site'} AI`
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
                <p className="text-center text-sm text-slate-500 py-8">No messages in this chat.</p>
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
