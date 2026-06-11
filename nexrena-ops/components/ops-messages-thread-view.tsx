'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Btn } from '@/components/ui'
import { MessageAttachments } from '@/components/message-attachments'
import { api } from '@/lib/api'
import {
  formatMessageTime,
  formatThreadTime,
  groupMessagesByDay,
  MESSAGE_ATTACHMENT_ACCEPT,
} from '@/lib/message-chat-utils'
import type { ClientMessage, MessageThread } from '@/lib/types'

type Props = {
  initialThreadId?: string | null
  contactFilter?: string
}

type MobilePanel = 'list' | 'thread'

export function OpsMessagesThreadView({ initialThreadId = null, contactFilter }: Props) {
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(initialThreadId)
  const [reply, setReply] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('list')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const path = contactFilter
        ? `/messages/threads?contactId=${encodeURIComponent(contactFilter)}`
        : '/messages/threads'
      const data = await api.get<{ threads: MessageThread[]; unreadCount: number }>(path)
      setThreads(data.threads)
      setUnreadCount(data.unreadCount)
      setActiveThreadId((current) => {
        if (current && data.threads.some((t) => t.threadId === current)) return current
        return data.threads[0]?.threadId ?? null
      })
    } catch {
      setError('Could not load message threads.')
    } finally {
      setLoading(false)
    }
  }, [contactFilter])

  useEffect(() => { load() }, [load])

  const activeThread = threads.find((t) => t.threadId === activeThreadId) ?? null
  const lastClientMessage = activeThread?.messages.filter((m) => m.direction === 'client').at(-1)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeThread?.messages.length, mobilePanel])

  const openThread = async (threadId: string) => {
    setActiveThreadId(threadId)
    setMobilePanel('thread')
    const thread = threads.find((t) => t.threadId === threadId)
    if (thread?.unreadByAdmin) {
      await api.patch(`/messages/threads/${threadId}/read`, {}).catch(() => {})
      setThreads((prev) =>
        prev.map((t) =>
          t.threadId === threadId
            ? {
                ...t,
                unreadByAdmin: 0,
                messages: t.messages.map((m) => ({ ...m, readByAdmin: true, status: 'read' as const })),
              }
            : t,
        ),
      )
      setUnreadCount((c) => Math.max(0, c - (thread.unreadByAdmin ?? 0)))
    }
  }

  const sendReply = async () => {
    if (!lastClientMessage || (!reply.trim() && pendingFiles.length === 0)) return
    setSubmitting(true)
    setError(null)
    try {
      let sent: ClientMessage
      if (pendingFiles.length) {
        const form = new FormData()
        if (reply.trim()) form.append('message', reply.trim())
        for (const file of pendingFiles) form.append('files', file)
        sent = await api.postMultipart<ClientMessage>(`/messages/${lastClientMessage.id}/reply`, form)
      } else {
        sent = await api.post<ClientMessage>(`/messages/${lastClientMessage.id}/reply`, {
          message: reply.trim(),
        })
      }

      setThreads((prev) =>
        prev.map((t) =>
          t.threadId === activeThread?.threadId
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

  const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendReply()
    }
  }

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    setPendingFiles((prev) => [...prev, ...picked].slice(0, 5))
    e.target.value = ''
  }

  if (loading) {
    return <p className="text-sm text-slate-500 animate-pulse">Loading conversations…</p>
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[480px] rounded-xl border border-slate-800/60 overflow-hidden bg-slate-950/40">
      <aside
        className={`${mobilePanel === 'list' ? 'flex' : 'hidden'} lg:flex w-full lg:w-80 shrink-0 flex-col border-r border-slate-800/60 bg-slate-900/30`}
      >
        <div className="px-4 py-3 border-b border-slate-800/60">
          <p className="text-sm font-medium text-white">Threads</p>
          {unreadCount > 0 && (
            <p className="text-xs text-gold">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {threads.length === 0 ? (
            <p className="text-sm text-slate-500 px-2 py-3">No messages yet.</p>
          ) : (
            threads.map((thread) => (
              <button
                key={thread.threadId}
                type="button"
                onClick={() => openThread(thread.threadId)}
                className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${
                  activeThreadId === thread.threadId
                    ? 'bg-gold/15 text-white'
                    : 'hover:bg-slate-800/40 text-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium truncate">{thread.clientName || 'Client'}</p>
                  <span className="text-[10px] text-slate-500 shrink-0">
                    {formatThreadTime(thread.updatedAt)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{thread.subject}</p>
                <p className="text-xs text-slate-600 truncate mt-1">
                  {thread.lastMessagePreview ?? thread.messages.at(-1)?.message ?? ''}
                </p>
                {thread.unreadByAdmin > 0 && (
                  <span className="mt-2 inline-block h-2 w-2 rounded-full bg-blue-400" />
                )}
              </button>
            ))
          )}
        </div>
      </aside>

      <main
        className={`${mobilePanel === 'thread' ? 'flex' : 'hidden'} lg:flex flex-1 flex-col min-w-0 min-h-0`}
      >
        {!activeThread ? (
          <div className="flex-1 flex items-center justify-center text-sm text-slate-500">
            Select a conversation.
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 px-4 py-3 border-b border-slate-800/60 shrink-0">
              <button
                type="button"
                className="lg:hidden text-slate-400 hover:text-white text-sm"
                onClick={() => setMobilePanel('list')}
              >
                ← Back
              </button>
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{activeThread.subject}</p>
                <p className="text-xs text-slate-500 truncate">
                  {activeThread.clientName}
                  {activeThread.clientEmail && (
                    <>
                      {' · '}
                      <a href={`mailto:${activeThread.clientEmail}`} className="text-gold hover:underline">
                        {activeThread.clientEmail}
                      </a>
                    </>
                  )}
                </p>
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
                      <OpsMessageBubble
                        key={msg.id}
                        message={msg}
                        clientName={activeThread.clientName}
                      />
                    ))}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

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
                  placeholder="Reply to client…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  rows={1}
                />
                <Btn
                  size="sm"
                  disabled={submitting || (!reply.trim() && pendingFiles.length === 0) || !lastClientMessage}
                  onClick={sendReply}
                >
                  {submitting ? '…' : 'Send'}
                </Btn>
              </div>
              <p className="text-[10px] text-slate-600 mt-2 px-1">
                Enter to send · Shift+Enter for newline · Images up to 10MB · Videos up to 50MB
              </p>
            </div>
          </>
        )}
        {error && <p className="text-sm text-red-400 px-4 py-2">{error}</p>}
      </main>
    </div>
  )
}

function OpsMessageBubble({
  message,
  clientName,
}: {
  message: ClientMessage
  clientName?: string | null
}) {
  const isAdmin = message.direction === 'admin'
  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${
          isAdmin
            ? 'bg-gold/20 text-white rounded-br-md'
            : 'bg-slate-800/70 text-slate-100 rounded-bl-md'
        }`}
      >
        {message.message && (
          <p className="text-sm whitespace-pre-wrap">{message.message}</p>
        )}
        <MessageAttachments
          attachments={message.attachments ?? []}
          variant="ops"
        />
        <p className={`text-[10px] mt-1 ${isAdmin ? 'text-gold/70' : 'text-slate-500'}`}>
          {isAdmin ? 'You' : clientName || 'Client'} · {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}
