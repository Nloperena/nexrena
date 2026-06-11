'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Btn } from '@/components/ui'
import { MessageAttachments } from '@/components/message-attachments'
import {
  fetchPortalMessageThreads,
  markPortalThreadRead,
  sendPortalMessage,
} from '@/lib/portal-client'
import {
  formatMessageTime,
  formatThreadTime,
  groupMessagesByDay,
  MESSAGE_ATTACHMENT_ACCEPT,
} from '@/lib/message-chat-utils'
import type { PortalMessage, PortalMessageThread } from '@/lib/portal-types'

type Props = {
  variant?: 'embedded' | 'full'
  onUnreadChange?: (count: number) => void
}

type MobilePanel = 'list' | 'thread'

export function ClientMessagesThreadView({ variant = 'embedded', onUnreadChange }: Props) {
  const isFull = variant === 'full'
  const [threads, setThreads] = useState<PortalMessageThread[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [reply, setReply] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [newSubject, setNewSubject] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('list')
  const [composingNew, setComposingNew] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await fetchPortalMessageThreads()
      setThreads(data.threads)
      setUnreadCount(data.unreadCount)
      onUnreadChange?.(data.unreadCount)
      setActiveThreadId((current) => current ?? data.threads[0]?.threadId ?? null)
    } catch {
      setError('Could not load messages.')
    } finally {
      setLoading(false)
    }
  }, [onUnreadChange])

  useEffect(() => { load() }, [load])

  const activeThread = threads.find((t) => t.threadId === activeThreadId) ?? null

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeThread?.messages.length, mobilePanel, composingNew])

  const openThread = async (threadId: string) => {
    setActiveThreadId(threadId)
    setComposingNew(false)
    setMobilePanel('thread')
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
      setUnreadCount((c) => {
        const next = Math.max(0, c - (thread.unreadByClient ?? 0))
        onUnreadChange?.(next)
        return next
      })
    }
  }

  const sendReply = async () => {
    if (!activeThread || (!reply.trim() && pendingFiles.length === 0)) return
    setSubmitting(true)
    setError(null)
    try {
      const sent = await sendPortalMessage({
        message: reply.trim(),
        threadId: activeThread.threadId,
        files: pendingFiles.length ? pendingFiles : undefined,
      })
      setThreads((prev) =>
        prev.map((t) =>
          t.threadId === activeThread.threadId
            ? {
                ...t,
                messages: [...t.messages, sent],
                updatedAt: sent.createdAt,
                lastMessagePreview: sent.message.trim() || 'Attachment',
              }
            : t,
        ),
      )
      setReply('')
      setPendingFiles([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send reply.')
    } finally {
      setSubmitting(false)
    }
  }

  const startConversation = async () => {
    if (!reply.trim() && pendingFiles.length === 0) {
      setError('Type a message or attach a file.')
      return
    }
    setSubmitting(true)
    setError(null)
    try {
      const sent = await sendPortalMessage({
        subject: newSubject.trim() || undefined,
        message: reply.trim(),
        files: pendingFiles.length ? pendingFiles : undefined,
      })
      await load()
      setActiveThreadId(sent.threadId)
      setReply('')
      setNewSubject('')
      setPendingFiles([])
      setComposingNew(false)
      setMobilePanel('thread')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (composingNew) startConversation()
      else sendReply()
    }
  }

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    setPendingFiles((prev) => [...prev, ...picked].slice(0, 5))
    e.target.value = ''
  }

  const showSidebar = isFull ? mobilePanel === 'list' : true
  const showChat = isFull ? mobilePanel === 'thread' || composingNew : true

  const containerClass = isFull
    ? 'flex flex-col h-[calc(100vh-9rem)] md:h-[calc(100vh-7rem)]'
    : 'space-y-4'

  return (
    <section className={containerClass}>
      <div
        className={`flex min-h-0 rounded-xl border border-slate-800/60 bg-slate-950/40 overflow-hidden ${
          isFull ? 'flex-1 flex-row' : 'flex-col md:flex-row min-h-[420px]'
        }`}
      >
        {/* Thread sidebar */}
        <aside
          className={`${showSidebar ? 'flex' : 'hidden'} ${isFull ? 'md:flex' : 'md:flex'} w-full md:w-72 shrink-0 flex-col border-r border-slate-800/60 bg-slate-900/30 max-h-[220px] md:max-h-none`}
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-slate-800/60">
            <div>
              <p className="text-sm font-medium text-white">Messages</p>
              {unreadCount > 0 && (
                <p className="text-xs text-gold">{unreadCount} unread</p>
              )}
            </div>
            <Btn
              size="sm"
              variant="ghost"
              onClick={() => {
                setComposingNew(true)
                setActiveThreadId(null)
                setMobilePanel('thread')
              }}
            >
              New
            </Btn>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {loading ? (
              <p className="text-sm text-slate-500 px-2 py-3 animate-pulse">Loading…</p>
            ) : threads.length === 0 ? (
              <p className="text-sm text-slate-500 px-2 py-3">No conversations yet.</p>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.threadId}
                  type="button"
                  onClick={() => openThread(thread.threadId)}
                  className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${
                    activeThreadId === thread.threadId && !composingNew
                      ? 'bg-gold/15 text-white'
                      : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium truncate">{thread.subject}</p>
                    <span className="text-[10px] text-slate-500 shrink-0">
                      {formatThreadTime(thread.updatedAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-1">
                    {thread.lastMessagePreview ?? thread.messages.at(-1)?.message ?? ''}
                  </p>
                  {thread.unreadByClient > 0 && (
                    <span className="mt-2 inline-block h-2 w-2 rounded-full bg-gold" />
                  )}
                </button>
              ))
            )}
          </div>
        </aside>

        {/* Chat panel */}
        <main
          className={`${showChat ? 'flex' : 'hidden'} ${isFull ? 'md:flex' : 'md:flex'} flex-1 flex-col min-w-0 min-h-0`}
        >
          {composingNew ? (
            <>
              <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 shrink-0">
                <button
                  type="button"
                  className="md:hidden text-slate-400 hover:text-white text-sm"
                  onClick={() => {
                    setComposingNew(false)
                    setMobilePanel('list')
                  }}
                >
                  ← Back
                </button>
                <div>
                  <p className="text-sm font-medium text-white">New message</p>
                  <p className="text-xs text-slate-500">Chat with Nico</p>
                </div>
              </header>
              <div className="px-4 py-3 border-b border-slate-800/60 shrink-0">
                <input
                  className="w-full rounded-lg bg-slate-900/60 border border-slate-700/60 px-3 py-2 text-sm text-white"
                  placeholder="Subject (optional)"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>
            </>
          ) : !activeThread ? (
            <div className="flex-1 flex items-center justify-center p-6 text-sm text-slate-500">
              Select a conversation or start a new message.
            </div>
          ) : (
            <>
              <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 shrink-0">
                <button
                  type="button"
                  className="md:hidden text-slate-400 hover:text-white text-sm"
                  onClick={() => setMobilePanel('list')}
                >
                  ← Back
                </button>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{activeThread.subject}</p>
                  <p className="text-xs text-slate-500">Nico · Nexrena</p>
                </div>
              </header>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
                {groupMessagesByDay(activeThread.messages).map((group) => (
                  <div key={group.label}>
                    <p className="text-center text-[11px] uppercase tracking-wider text-slate-500 mb-3">
                      {group.label}
                    </p>
                    <div className="space-y-2">
                      {group.messages.map((msg) => (
                        <ClientMessageBubble key={msg.id} message={msg} />
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}

          {(composingNew || activeThread) && (
            <div className="shrink-0 border-t border-slate-800/60 px-3 py-3 bg-slate-900/40">
              {pendingFiles.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {pendingFiles.map((file, i) => (
                    <span
                      key={`${file.name}-${i}`}
                      className="inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 text-xs text-slate-300"
                    >
                      {file.name}
                      <button
                        type="button"
                        className="text-slate-500 hover:text-white"
                        onClick={() => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <div className="flex items-end gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept={MESSAGE_ATTACHMENT_ACCEPT}
                  multiple
                  onChange={onPickFiles}
                />
                <button
                  type="button"
                  className="shrink-0 rounded-lg border border-slate-700/60 px-3 py-2 text-slate-400 hover:text-white hover:border-slate-600"
                  onClick={() => fileInputRef.current?.click()}
                  aria-label="Attach file"
                >
                  📎
                </button>
                <textarea
                  className="flex-1 rounded-xl bg-slate-900/80 border border-slate-700/60 px-3 py-2 text-sm text-white min-h-[44px] max-h-32 resize-y"
                  placeholder="Message Nico…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  rows={1}
                />
                <Btn
                  size="sm"
                  disabled={submitting || (!reply.trim() && pendingFiles.length === 0)}
                  onClick={composingNew ? startConversation : sendReply}
                >
                  {submitting ? '…' : 'Send'}
                </Btn>
              </div>
              <p className="text-[10px] text-slate-600 mt-2 px-1">
                Enter to send · Shift+Enter for newline · Images up to 10MB · Videos up to 50MB
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-400 px-4 py-2">{error}</p>}
        </main>
      </div>
    </section>
  )
}

function ClientMessageBubble({ message }: { message: PortalMessage }) {
  const isClient = message.direction === 'client'
  return (
    <div className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
          isClient
            ? 'bg-gold/20 text-white rounded-br-md'
            : 'bg-slate-800/70 text-slate-100 rounded-bl-md'
        }`}
      >
        {message.message && (
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
        )}
        <MessageAttachments
          attachments={message.attachments ?? []}
          variant="portal"
        />
        <p className={`text-[10px] mt-1 ${isClient ? 'text-gold/70' : 'text-slate-500'}`}>
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}
