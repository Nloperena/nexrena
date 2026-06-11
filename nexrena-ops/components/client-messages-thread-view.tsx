'use client'

import { useCallback, useEffect, useState } from 'react'
import { Btn } from '@/components/ui'
import { portalSectionTitleClass } from '@/lib/portal-dashboard-utils'
import {
  fetchPortalMessageThreads,
  markPortalThreadRead,
  sendPortalMessage,
} from '@/lib/portal-client'
import type { PortalMessage, PortalMessageThread } from '@/lib/portal-types'
import { formatDate } from '@/lib/store'

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

export function ClientMessagesThreadView() {
  const [threads, setThreads] = useState<PortalMessageThread[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newBody, setNewBody] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mode, setMode] = useState<'list' | 'new'>('list')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPortalMessageThreads()
      setThreads(data.threads)
      setUnreadCount(data.unreadCount)
      setActiveThreadId((current) => current ?? data.threads[0]?.threadId ?? null)
    } catch {
      setError('Could not load messages.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const activeThread = threads.find((t) => t.threadId === activeThreadId) ?? null

  const openThread = async (threadId: string) => {
    setActiveThreadId(threadId)
    setMode('list')
    const thread = threads.find((t) => t.threadId === threadId)
    if (thread?.unreadByClient) {
      await markPortalThreadRead(threadId).catch(() => {})
      setThreads((prev) =>
        prev.map((t) =>
          t.threadId === threadId
            ? {
                ...t,
                unreadByClient: 0,
                messages: t.messages.map((m) =>
                  m.direction === 'admin' ? { ...m, readByClient: true } : m,
                ),
              }
            : t,
        ),
      )
      setUnreadCount((c) => Math.max(0, c - (thread.unreadByClient ?? 0)))
    }
  }

  const sendReply = async () => {
    if (!activeThread || !reply.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      const sent = await sendPortalMessage({ message: reply.trim(), threadId: activeThread.threadId })
      setThreads((prev) =>
        prev.map((t) =>
          t.threadId === activeThread.threadId
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

  const startConversation = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBody.trim()) {
      setError('Please enter a message.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const sent = await sendPortalMessage({
        subject: newSubject.trim() || undefined,
        message: newBody.trim(),
      })
      await load()
      setActiveThreadId(sent.threadId)
      setNewSubject('')
      setNewBody('')
      setMode('list')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={portalSectionTitleClass}>Messages</h2>
          <p className="text-sm text-slate-400 mt-1">
            Conversation with Nico — replies appear here.
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center rounded-full bg-gold/20 text-gold px-2 py-0.5 text-xs">
                {unreadCount} new
              </span>
            )}
          </p>
        </div>
        <Btn size="sm" variant="ghost" onClick={() => setMode(mode === 'new' ? 'list' : 'new')}>
          {mode === 'new' ? 'Back to threads' : 'New message'}
        </Btn>
      </div>

      {mode === 'new' ? (
        <form onSubmit={startConversation} className={`${card} space-y-4`}>
          <input
            className="w-full rounded-lg bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-sm text-white"
            placeholder="Subject (optional)"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
          />
          <textarea
            className="w-full rounded-lg bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-sm text-white min-h-[120px] resize-y"
            placeholder="Your message…"
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            required
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Btn type="submit" size="sm" disabled={submitting}>
            {submitting ? 'Sending…' : 'Start conversation'}
          </Btn>
        </form>
      ) : (
        <div className="grid md:grid-cols-[220px_1fr] gap-4">
          <div className={`${card} p-3 space-y-1 max-h-[420px] overflow-y-auto`}>
            {loading ? (
              <p className="text-sm text-slate-500 animate-pulse">Loading…</p>
            ) : threads.length === 0 ? (
              <p className="text-sm text-slate-500">No conversations yet.</p>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.threadId}
                  type="button"
                  onClick={() => openThread(thread.threadId)}
                  className={`w-full text-left rounded-lg px-3 py-2 transition-colors ${
                    activeThreadId === thread.threadId ? 'bg-gold/15 text-white' : 'hover:bg-slate-800/40 text-slate-400'
                  }`}
                >
                  <p className="text-sm font-medium truncate">{thread.subject}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{formatDate(thread.updatedAt)}</p>
                  {thread.unreadByClient > 0 && (
                    <span className="text-[10px] text-gold">{thread.unreadByClient} new</span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className={`${card} flex flex-col min-h-[320px]`}>
            {!activeThread ? (
              <p className="text-sm text-slate-500">Select a conversation.</p>
            ) : (
              <>
                <h3 className="text-white font-medium mb-4">{activeThread.subject}</h3>
                <div className="flex-1 space-y-3 overflow-y-auto max-h-[280px] pr-1">
                  {activeThread.messages.map((msg) => (
                    <MessageBubble key={msg.id} message={msg} />
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800/60 flex gap-2">
                  <textarea
                    className="flex-1 rounded-lg bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-sm text-white min-h-[72px] resize-y"
                    placeholder="Reply to Nico…"
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <Btn size="sm" disabled={submitting || !reply.trim()} onClick={sendReply}>
                    Send
                  </Btn>
                </div>
              </>
            )}
            {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
          </div>
        </div>
      )}
    </section>
  )
}

function MessageBubble({ message }: { message: PortalMessage }) {
  const isClient = message.direction === 'client'
  return (
    <div className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-xl px-3 py-2 ${
          isClient ? 'bg-gold/15 text-white' : 'bg-slate-800/60 text-slate-200'
        }`}
      >
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">
          {isClient ? 'You' : 'Nico'} · {formatDate(message.createdAt)}
        </p>
        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
      </div>
    </div>
  )
}
