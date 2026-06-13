'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Btn } from '@/components/ui'
import { MessageBubble } from '@/components/message-bubble'
import { MessageComposer } from '@/components/message-composer'
import { MessageThreadListItem } from '@/components/message-thread-list-item'
import { portalFocusRing, portalInputCls, portalMutedClass } from '@/lib/portal-a11y'
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

const NEXRENA_AVATAR = 'Nico · Nexrena'

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

  const showList = isFull ? mobilePanel === 'list' && !composingNew : true
  const showThread = isFull ? mobilePanel === 'thread' || composingNew : true

  if (loading && threads.length === 0) {
    return (
      <div className={`flex items-center justify-center ${isFull ? 'flex-1 min-h-[50dvh]' : 'py-12'}`}>
        <p className={`animate-pulse ${portalMutedClass}`}>Loading messages…</p>
      </div>
    )
  }

  const listHeader = (
    <div className="shrink-0 flex items-center justify-between gap-2 border-b border-slate-800/60 px-4 py-3 bg-[#111418]">
      <div>
        <p className="text-base font-semibold text-white">Messages</p>
        {unreadCount > 0 && (
          <p className="text-sm text-gold-light">{unreadCount} unread</p>
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
  )

  return (
    <div
      className={`team-messenger flex w-full overflow-hidden bg-[#111418] ${
        isFull ? 'flex-1 min-h-0' : 'min-h-[420px] rounded-xl border border-slate-800/60'
      }`}
    >
      <aside
        className={`${
          showList ? 'flex' : 'hidden'
        } ${isFull ? 'md:flex' : 'md:flex'} w-full md:w-[min(100%,320px)] shrink-0 flex-col min-h-0 bg-[#111418] md:border-r md:border-slate-800/60`}
      >
        {listHeader}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 space-y-0.5">
          {threads.length === 0 ? (
            <p className={`px-3 py-8 text-center ${portalMutedClass}`}>No conversations yet.</p>
          ) : (
            threads.map((thread) => (
              <MessageThreadListItem
                key={thread.threadId}
                active={activeThreadId === thread.threadId && !composingNew}
                title={NEXRENA_AVATAR}
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
        className={`${
          showThread ? 'flex' : 'hidden'
        } ${isFull ? 'md:flex' : 'md:flex'} min-h-0 min-w-0 flex-1 flex-col bg-[#0e1116]`}
      >
        {composingNew ? (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-slate-800/60 px-3 py-3 bg-[#111418]">
              <button
                type="button"
                className={`flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-200 hover:text-white md:hidden ${portalFocusRing}`}
                onClick={() => {
                  setComposingNew(false)
                  setMobilePanel('list')
                }}
                aria-label="Back to conversations"
              >
                ←
              </button>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/25 text-lg font-semibold text-gold-light">
                N
              </span>
              <div>
                <p className="text-lg font-semibold text-white">New message</p>
                <p className="text-base text-slate-300">{NEXRENA_AVATAR}</p>
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
          <div className="hidden md:flex flex-1 items-center justify-center p-6 text-lg text-slate-300">
            Select a conversation or start a new message.
          </div>
        ) : (
          <>
            <header className="flex shrink-0 items-center gap-3 border-b border-slate-800/60 px-3 py-3 bg-[#111418]">
              <button
                type="button"
                className={`flex h-11 w-11 items-center justify-center rounded-full text-xl text-slate-200 hover:text-white md:hidden ${portalFocusRing}`}
                onClick={() => setMobilePanel('list')}
                aria-label="Back to conversations"
              >
                ←
              </button>
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gold/25 text-lg font-semibold text-gold-light">
                N
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-lg font-semibold text-white">{NEXRENA_AVATAR}</p>
                <p className="truncate text-base text-slate-300">{activeThread.subject}</p>
              </div>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 space-y-3">
              {groupMessagesByDay(activeThread.messages).map((group) => (
                <div key={group.label}>
                  <p className="mb-3 text-center text-base text-slate-400 font-medium">{group.label}</p>
                  <div className="space-y-2">
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
            placeholder="Write a message…"
            size="portal"
          />
        )}

        {error && (
          <p className="px-4 py-2 text-base text-red-300 shrink-0" role="alert">{error}</p>
        )}
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
