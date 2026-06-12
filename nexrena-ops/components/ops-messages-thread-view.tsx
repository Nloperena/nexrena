'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageBubble } from '@/components/message-bubble'
import { MessageComposer } from '@/components/message-composer'
import { MessageThreadListItem } from '@/components/message-thread-list-item'
import { api } from '@/lib/api'
import { teamSelectCls } from '@/lib/team-a11y'
import {
  attachmentPreviewLabel,
  groupMessagesByDay,
} from '@/lib/message-chat-utils'
import { applyMessageStreamEvent, countUnreadForViewer } from '@/lib/message-realtime-utils'
import { useOpsMessageStream } from '@/lib/use-message-stream'
import type { ClientMessage, Contact, MessageThread } from '@/lib/types'

type Props = {
  initialThreadId?: string | null
  contactFilter?: string
  clients?: Contact[]
  contactFilterValue?: string
  onContactFilterChange?: (id: string) => void
}

type MobilePanel = 'list' | 'thread'

export function OpsMessagesThreadView({
  initialThreadId = null,
  contactFilter,
  clients = [],
  contactFilterValue = '',
  onContactFilterChange,
}: Props) {
  const [threads, setThreads] = useState<MessageThread[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(initialThreadId)
  const [reply, setReply] = useState('')
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobilePanel, setMobilePanel] = useState<MobilePanel>('list')
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

  useOpsMessageStream((event) => {
    setThreads((prev) => {
      const next = applyMessageStreamEvent(prev, event, 'admin')
      setUnreadCount(countUnreadForViewer(next, 'admin'))
      return next
    })
  }, contactFilter)

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
                lastMessagePreview: sent.message.trim() || previewFromAttachments(sent.attachments),
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

  const onPickFiles = (picked: File[]) => {
    setPendingFiles((prev) => [...prev, ...picked].slice(0, 5))
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[50dvh]">
        <p className="animate-pulse text-sm text-slate-500">Loading conversations…</p>
      </div>
    )
  }

  const listHeader = (
    <div className="shrink-0 border-b border-slate-800/60 px-4 py-3 space-y-3 bg-[#111418]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-base font-semibold text-white lg:hidden">Messages</p>
          <p className="text-sm font-semibold text-white hidden lg:block">Chats</p>
          {unreadCount > 0 && <p className="text-xs text-gold">{unreadCount} unread</p>}
        </div>
      </div>
      {onContactFilterChange && clients.length > 0 && (
        <select
          className={`${teamSelectCls} lg:hidden text-sm`}
          value={contactFilterValue}
          onChange={(e) => onContactFilterChange(e.target.value)}
          aria-label="Filter by client"
        >
          <option value="">All clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.company || c.name}</option>
          ))}
        </select>
      )}
    </div>
  )

  return (
    <div className="team-messenger flex flex-1 min-h-0 w-full overflow-hidden bg-[#111418] lg:rounded-xl lg:border lg:border-slate-800/60">
      {/* Thread list */}
      <aside
        className={`${
          mobilePanel === 'list' ? 'flex' : 'hidden'
        } lg:flex w-full lg:w-[min(100%,320px)] shrink-0 flex-col min-h-0 bg-[#111418] lg:bg-slate-900/30 lg:border-r lg:border-slate-800/60`}
      >
        {listHeader}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 space-y-0.5">
          {threads.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-slate-500">No messages yet.</p>
          ) : (
            threads.map((thread) => (
              <MessageThreadListItem
                key={thread.threadId}
                active={activeThreadId === thread.threadId}
                title={thread.clientName || 'Client'}
                subtitle={thread.subject}
                preview={thread.lastMessagePreview ?? thread.messages.at(-1)?.message}
                updatedAt={thread.updatedAt}
                unread={thread.unreadByAdmin}
                avatarLabel={thread.clientName || 'Client'}
                avatarClassName="bg-slate-700/80 text-slate-200"
                onClick={() => openThread(thread.threadId)}
              />
            ))
          )}
        </div>
      </aside>

      {/* Active thread — full viewport on mobile */}
      <main
        className={`${
          mobilePanel === 'thread' ? 'flex' : 'hidden'
        } lg:flex min-h-0 min-w-0 flex-1 flex-col bg-[#0e1116]`}
      >
        {!activeThread ? (
          <div className="hidden lg:flex flex-1 items-center justify-center text-sm text-slate-500">
            Select a conversation to start messaging.
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
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/20 text-sm font-bold text-gold">
                {(activeThread.clientName || 'C').slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-semibold text-white">
                  {activeThread.clientName || 'Client'}
                </p>
                <p className="truncate text-xs text-slate-400">{activeThread.subject}</p>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-3">
              {groupMessagesByDay(activeThread.messages).map((group) => (
                <div key={group.label}>
                  <p className="mb-3 text-center text-xs font-medium text-slate-500">{group.label}</p>
                  <div className="space-y-2">
                    {group.messages.map((msg) => (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOutgoing={msg.direction === 'admin'}
                        senderLabel={msg.direction === 'admin' ? 'You' : activeThread.clientName || 'Client'}
                        variant="ops"
                        size="ops"
                      />
                    ))}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <MessageComposer
              value={reply}
              onChange={setReply}
              onSend={sendReply}
              pendingFiles={pendingFiles}
              onPickFiles={onPickFiles}
              onRemoveFile={(i) => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
              submitting={submitting}
              disabled={!lastClientMessage}
              placeholder="Write a message…"
              size="ops"
            />
          </>
        )}
        {error && <p className="px-4 py-2 text-sm text-red-400 shrink-0">{error}</p>}
      </main>
    </div>
  )
}

function previewFromAttachments(
  attachments?: { filename: string; mimeType: string }[],
) {
  const first = attachments?.[0]
  if (!first) return 'Attachment'
  return attachmentPreviewLabel(first.filename, first.mimeType)
}
