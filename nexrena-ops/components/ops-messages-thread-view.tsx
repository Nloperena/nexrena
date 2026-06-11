'use client'

import { useCallback, useEffect, useState } from 'react'
import { Btn } from '@/components/ui'
import { formatDate } from '@/lib/store'
import { api } from '@/lib/api'
import type { ClientMessage, MessageThread } from '@/lib/types'

type Props = {
  initialThreadId?: string | null
}

export function OpsMessagesThreadView({ initialThreadId = null }: Props) {
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(initialThreadId)
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<{ threads: MessageThread[]; unreadCount: number }>('/messages/threads')
      setThreads(data.threads)
      setUnreadCount(data.unreadCount)
      setActiveThreadId((current) => current ?? data.threads[0]?.threadId ?? null)
    } catch {
      setError('Could not load message threads.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const activeThread = threads.find((t) => t.threadId === activeThreadId) ?? null
  const lastClientMessage = activeThread?.messages.filter((m) => m.direction === 'client').at(-1)

  const openThread = async (threadId: string) => {
    setActiveThreadId(threadId)
    const thread = threads.find((t) => t.threadId === threadId)
    if (thread?.unreadByAdmin) {
      await api.patch(`/messages/threads/${threadId}/read`, {}).catch(() => {})
      setThreads((prev) =>
        prev.map((t) =>
          t.threadId === threadId
            ? { ...t, unreadByAdmin: 0, messages: t.messages.map((m) => ({ ...m, readByAdmin: true, status: 'read' as const })) }
            : t,
        ),
      )
      setUnreadCount((c) => Math.max(0, c - (thread.unreadByAdmin ?? 0)))
    }
  }

  const sendReply = async () => {
    if (!lastClientMessage || !reply.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const sent = await api.post<ClientMessage>(`/messages/${lastClientMessage.id}/reply`, {
        message: reply.trim(),
      })
      setThreads((prev) =>
        prev.map((t) =>
          t.threadId === activeThread?.threadId
            ? { ...t, messages: [...t.messages, sent], updatedAt: sent.createdAt }
            : t,
        ),
      )
      setReply('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reply.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500 animate-pulse">Loading conversations…</p>
  }

  return (
    <div className="grid lg:grid-cols-[280px_1fr] gap-4 min-h-[480px]">
      <div className="glass-panel rounded-xl border border-slate-800/60 p-3 space-y-1 max-h-[560px] overflow-y-auto">
        <p className="text-[10px] uppercase tracking-widest text-slate-500 px-2 py-1">
          Threads {unreadCount > 0 && <span className="text-gold">({unreadCount} unread)</span>}
        </p>
        {threads.length === 0 ? (
          <p className="text-sm text-slate-500 px-2">No messages yet.</p>
        ) : (
          threads.map((thread) => (
            <button
              key={thread.threadId}
              type="button"
              onClick={() => openThread(thread.threadId)}
              className={`w-full text-left rounded-lg px-3 py-2 ${
                activeThreadId === thread.threadId ? 'bg-gold/15 text-white' : 'hover:bg-slate-800/40 text-slate-400'
              }`}
            >
              <p className="text-sm font-medium truncate">{thread.clientName || 'Client'}</p>
              <p className="text-xs text-slate-500 truncate">{thread.subject}</p>
              <p className="text-[10px] text-slate-600 mt-1">{formatDate(thread.updatedAt)}</p>
              {thread.unreadByAdmin > 0 && (
                <span className="text-[10px] text-blue-400">{thread.unreadByAdmin} unread</span>
              )}
            </button>
          ))
        )}
      </div>

      <div className="glass-panel rounded-xl border border-slate-800/60 p-5 flex flex-col">
        {!activeThread ? (
          <p className="text-sm text-slate-500">Select a conversation.</p>
        ) : (
          <>
            <div className="mb-4">
              <h3 className="text-white font-medium">{activeThread.subject}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {activeThread.clientName}
                {activeThread.clientEmail && (
                  <> · <a href={`mailto:${activeThread.clientEmail}`} className="text-gold hover:underline">{activeThread.clientEmail}</a></>
                )}
              </p>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto max-h-[360px] pr-1">
              {activeThread.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.direction === 'admin' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 ${
                    msg.direction === 'admin' ? 'bg-gold/15 text-white' : 'bg-slate-800/60 text-slate-200'
                  }`}>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
                      {msg.direction === 'admin' ? 'You (Nico)' : activeThread.clientName || 'Client'}
                      {' · '}{formatDate(msg.createdAt)}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/60 flex gap-2">
              <textarea
                className="flex-1 rounded-lg bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-sm text-white min-h-[72px]"
                placeholder="Reply to client…"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <Btn size="sm" disabled={submitting || !reply.trim() || !lastClientMessage} onClick={sendReply}>
                Reply
              </Btn>
            </div>
          </>
        )}
        {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
      </div>
    </div>
  )
}
