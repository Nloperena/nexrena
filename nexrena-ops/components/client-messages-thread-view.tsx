'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Btn } from '@/components/ui'
import { MessageBubble } from '@/components/message-bubble'
import { MessageComposer } from '@/components/message-composer'
import { MessageThreadListItem } from '@/components/message-thread-list-item'
import { portalFocusRing, portalInputCls, portalSectionTitleClass, portalMutedClass } from '@/lib/portal-a11y'
import {
  fetchPortalMessageThreads,
  markPortalThreadRead,
  sendPortalMessage,
} from '@/lib/portal-client'
import {
  attachmentPreviewLabel,
  groupMessagesByDay,
} from '@/lib/message-chat-utils'
import { applyMessageStreamEvent, countUnreadForViewer } from '@/lib/message-realtime-utils'
import { usePortalMessageStream } from '@/lib/use-message-stream'
import type { PortalMessageThread } from '@/lib/portal-types'

type Props = {
  variant?: 'embedded' | 'full'
  onUnreadChange?: (count: number) => void
}

type MobilePanel = 'list' | 'thread'

const NEXRENA_AVATAR = 'Nico Nexrena'

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

  usePortalMessageStream((event) => {
    setThreads((prev) => {
      const next = applyMessageStreamEvent(prev, event, 'client')
      const unread = countUnreadForViewer(next, 'client')
      setUnreadCount(unread)
      onUnreadChange?.(unread)
      return next
    })
  })

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

  const onPickFiles = (picked: File[]) => {
    setPendingFiles((prev) => [...prev, ...picked].slice(0, 5))
  }

  const showSidebar = isFull ? mobilePanel === 'list' : true
  const showChat = isFull ? mobilePanel === 'thread' || composingNew : true

  const containerClass = isFull
    ? 'flex flex-col h-[calc(100vh-9rem)] md:h-[calc(100vh-7rem)]'
    : 'space-y-4'

  return (
    <section className={containerClass}>
      <div
        className={`flex min-h-0 overflow-hidden rounded-xl border border-slate-800/60 bg-slate-950/50 ${
          isFull ? 'flex-1 flex-row' : 'min-h-[420px] flex-col md:flex-row'
        }`}
      >
        <aside
          className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full shrink-0 flex-col border-r border-slate-800/60 bg-slate-900/40 md:w-80 max-h-[240px] md:max-h-none`}
        >
          <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 px-4 py-3">
            <div>
              <p className={portalSectionTitleClass}>Chats</p>
              {unreadCount > 0 && (
                <p className="text-lg font-medium text-gold-light">{unreadCount} unread</p>
              )}
            </div>
            <Btn
              size="lg"
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
          <div className="flex-1 space-y-0.5 overflow-y-auto p-2">
            {loading ? (
              <p className={`animate-pulse px-2 py-3 ${portalMutedClass}`}>Loading…</p>
            ) : threads.length === 0 ? (
              <p className={`px-2 py-3 ${portalMutedClass}`}>No conversations yet.</p>
            ) : (
              threads.map((thread) => (
                <MessageThreadListItem
                  key={thread.threadId}
                  active={activeThreadId === thread.threadId && !composingNew}
                  title="Nico · Nexrena"
                  subtitle={thread.subject}
                  preview={thread.lastMessagePreview ?? thread.messages.at(-1)?.message}
                  updatedAt={thread.updatedAt}
                  unread={thread.unreadByClient}
                  avatarLabel={NEXRENA_AVATAR}
                  avatarClassName="bg-gold/25 text-gold-light"
                  onClick={() => openThread(thread.threadId)}
                  focusRing
                  size="portal"
                />
              ))
            )}
          </div>
        </aside>

        <main
          className={`${showChat ? 'flex' : 'hidden'} md:flex min-h-0 min-w-0 flex-1 flex-col`}
        >
          {composingNew ? (
            <>
              <header className="flex shrink-0 items-center gap-3 border-b border-slate-800/60 px-4 py-3">
                <button
                  type="button"
                  className={`px-3 text-lg text-slate-200 hover:text-white md:hidden min-h-[52px] ${portalFocusRing}`}
                  onClick={() => {
                    setComposingNew(false)
                    setMobilePanel('list')
                  }}
                >
                  ← Back
                </button>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/25 text-lg font-semibold text-gold-light">
                  N
                </span>
                <div>
                  <p className="text-xl font-semibold text-white">New message</p>
                  <p className="text-lg text-slate-300">Nico · Nexrena</p>
                </div>
              </header>
              <div className="shrink-0 border-b border-slate-800/60 px-4 py-3">
                <input
                  className={portalInputCls}
                  placeholder="Subject (optional)"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                />
              </div>
            </>
          ) : !activeThread ? (
            <div className="flex flex-1 items-center justify-center p-6 text-lg text-slate-300">
              Select a conversation or start a new message.
            </div>
          ) : (
            <>
              <header className="flex shrink-0 items-center gap-3 border-b border-slate-800/60 px-4 py-3">
                <button
                  type="button"
                  className={`px-3 text-lg text-slate-200 hover:text-white md:hidden min-h-[52px] ${portalFocusRing}`}
                  onClick={() => setMobilePanel('list')}
                >
                  ← Back
                </button>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/25 text-lg font-semibold text-gold-light">
                  N
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xl font-semibold text-white">Nico · Nexrena</p>
                  <p className="truncate text-lg text-slate-300">{activeThread.subject}</p>
                </div>
              </header>
              <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {groupMessagesByDay(activeThread.messages).map((group) => (
                  <div key={group.label}>
                    <p className="mb-3 text-center text-lg text-slate-300 font-medium">{group.label}</p>
                    <div className="space-y-1.5">
                      {group.messages.map((msg) => (
                        <MessageBubble
                          key={msg.id}
                          message={msg}
                          isOutgoing={msg.direction === 'client'}
                          variant="portal"
                          size="portal"
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </>
          )}

          {(composingNew || activeThread) && (
            <MessageComposer
              value={reply}
              onChange={setReply}
              onSend={composingNew ? startConversation : sendReply}
              pendingFiles={pendingFiles}
              onPickFiles={onPickFiles}
              onRemoveFile={(i) => setPendingFiles((prev) => prev.filter((_, idx) => idx !== i))}
              submitting={submitting}
              placeholder="Message Nico…"
              size="portal"
            />
          )}

          {error && (
            <p className="px-4 py-2 text-lg text-red-300" role="alert">{error}</p>
          )}
        </main>
      </div>
    </section>
  )
}

function previewFromAttachments(
  attachments?: { filename: string; mimeType: string }[],
) {
  const first = attachments?.[0]
  if (!first) return 'Attachment'
  return attachmentPreviewLabel(first.filename, first.mimeType)
}
