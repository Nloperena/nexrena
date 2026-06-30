'use client'

import type { CopilotThread } from '@/lib/copilot-types'
import { useCopilot } from './copilot-provider'

type Props = {
  open: boolean
  onClose: () => void
  threads: CopilotThread[]
  activeThreadId: string | null
  loading: boolean
  onSelect: (threadId: string) => void
  onNewChat: () => void
  onDelete: (threadId: string) => void
}

export function CopilotThreadHistory({
  open,
  onClose,
  threads,
  activeThreadId,
  loading,
  onSelect,
  onNewChat,
  onDelete,
}: Props) {
  if (!open) return null

  return (
    <div className="copilot-thread-history">
      <div className="copilot-thread-history__header">
        <p className="text-sm font-medium text-slate-200">Chat history</p>
        <button type="button" onClick={onClose} className="text-xs text-slate-500 hover:text-slate-300">
          Close
        </button>
      </div>

      <button type="button" onClick={onNewChat} className="copilot-thread-history__new">
        + New chat
      </button>

      <div className="copilot-thread-history__list">
        {loading && <p className="text-xs text-slate-500 px-2 py-3">Loading…</p>}
        {!loading && threads.length === 0 && (
          <p className="text-xs text-slate-500 px-2 py-3">No previous chats yet.</p>
        )}
        {!loading &&
          threads.map((thread) => {
            const active = thread.id === activeThreadId
            return (
              <div
                key={thread.id}
                className={`copilot-thread-history__item ${active ? 'is-active' : ''}`}
              >
                <button
                  type="button"
                  className="copilot-thread-history__select"
                  onClick={() => {
                    onSelect(thread.id)
                    onClose()
                  }}
                >
                  <span className="copilot-thread-history__title">{thread.title}</span>
                  {thread.preview && (
                    <span className="copilot-thread-history__preview">{thread.preview}</span>
                  )}
                </button>
                <button
                  type="button"
                  className="copilot-thread-history__delete"
                  aria-label={`Delete ${thread.title}`}
                  onClick={() => onDelete(thread.id)}
                >
                  ×
                </button>
              </div>
            )
          })}
      </div>
    </div>
  )
}
