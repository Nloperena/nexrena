'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { MessageBubble } from '@/components/message-bubble'
import { MessageComposer } from '@/components/message-composer'
import { MessageThreadListItem } from '@/components/message-thread-list-item'
import { api } from '@/lib/api'
import {
  attachmentPreviewLabel,
  groupMessagesByDay,
} from '@/lib/message-chat-utils'
import { applyMessageStreamEvent, countUnreadForViewer } from '@/lib/message-realtime-utils'
import { useOpsMessageStream } from '@/lib/use-message-stream'
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
    return <p className="animate-pulse text-sm text-slate-500">Loading conversations…</p>
  }

  return (
    <div className="flex min-h-[min(72dvh,640px)] lg:h-[calc(100vh-12rem)] w-full min-w-0 overflow-hidden rounded-xl border border-slate-800/60 bg-slate-950/50">
      <aside
        className={`${mobilePanel === 'list' ? 'flex' : 'hidden'} lg:flex w-full shrink-0 flex-col border-r border-slate-800/60 bg-slate-900/40 lg:w-80`}
      >
        <div className="border-b border-slate-800/60 px-4 py-3">
          <p className="text-sm font-semibold text-white">Chats</p>
          {unreadCount > 0 && (
            <p className="text-xs text-gold">{unreadCount} unread</p>
          )}
        </div>
        <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
          {threads.length === 0 ? (
            <p className="px-2 py-3 text-sm text-slate-500">No messages yet.</p>
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

      <main
        className={`${mobilePanel === 'thread' ? 'flex' : 'hidden'} lg:flex min-h-0 min-w-0 flex-1 flex-col`}
      >
        {!activeThread ? (
          <div className="flex flex-1 items-center justify-center text-sm text-slate-500">
            Select a conversation.
          </div>
        ) : (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-slate-800/60 px-4 py-3">
              <button
                type="button"
                className="text-sm text-slate-400 hover:text-white lg:hidden"
                onClick={() => setMobilePanel('list')}
              >
                ← Back
              </button>
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700/80 text-sm font-semibold text-slate-200">
                {(activeThread.clientName || 'C').slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {activeThread.clientName || 'Client'}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {activeThread.subject}
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

            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {groupMessagesByDay(activeThread.messages).map((group) => (
                <div key={group.label}>
                  <p className="mb-3 text-center text-xs text-slate-500">{group.label}</p>
                  <div className="space-y-1.5">
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
              placeholder="Message client…"
              size="ops"
            />
          </>
        )}
        {error && <p className="px-4 py-2 text-sm text-red-400">{error}</p>}
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
