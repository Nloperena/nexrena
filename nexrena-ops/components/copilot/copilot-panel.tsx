'use client'

import { useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import { useCopilot } from './copilot-provider'
import { useCopilotChatRuntime } from './copilot-chat-runtime'
import { CopilotThreadHistory } from './copilot-thread-history'
import { MessageToolParts } from './tool-card-renderer'
import { messageText } from '@/lib/copilot-types'

export function CopilotPanel({ className = '' }: { className?: string }) {
  const {
    persona,
    threads,
    threadsLoading,
    activeThreadId,
    historyOpen,
    setHistoryOpen,
    startNewChat,
    selectThread,
    deleteThread,
    chatReady,
  } = useCopilot()
  const { messages, input, handleInputChange, handleSubmit, status } = useCopilotChatRuntime()
  const messagesRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = messagesRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, status])

  return (
    <aside className={`copilot-panel ${className}`}>
      <header className="copilot-panel__header">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-slate-500">Copilot</p>
          <p className="text-sm text-slate-300 truncate">
            {persona === 'team' ? 'Team workspace' : 'Client workspace'}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => void startNewChat()}
            className="copilot-panel__header-btn"
            title="New chat"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => setHistoryOpen(!historyOpen)}
            className={`copilot-panel__header-btn ${historyOpen ? 'is-active' : ''}`}
            title="Chat history"
          >
            ☰
          </button>
        </div>
      </header>

      <CopilotThreadHistory
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        threads={threads}
        activeThreadId={activeThreadId}
        loading={threadsLoading}
        onSelect={selectThread}
        onNewChat={() => void startNewChat()}
        onDelete={(id) => void deleteThread(id)}
      />

      <div ref={messagesRef} className="copilot-panel__messages">
        {!chatReady && (
          <p className="text-sm text-slate-500 px-1">Loading conversation…</p>
        )}
        {chatReady && messages.length === 0 && (
          <p className="text-sm text-slate-500 px-1">
            Ask for reports, triage leads, check billing, or request workspace updates.
          </p>
        )}
        {messages.map((message) => {
          const isUser = message.role === 'user'
          const text = messageText(message.parts as Array<{ type: string; text?: string }>)
          const toolParts = message.parts.filter(
            (p) => p.type === 'dynamic-tool' || p.type.startsWith('tool-'),
          )

          return (
            <div
              key={message.id}
              className={`copilot-message ${isUser ? 'copilot-message--user' : 'copilot-message--assistant'}`}
            >
              {text && (
                <div className="copilot-message__body prose-copilot">
                  {isUser ? <p>{text}</p> : <ReactMarkdown>{text}</ReactMarkdown>}
                </div>
              )}
              {!isUser && toolParts.length > 0 && (
                <MessageToolParts parts={toolParts as Parameters<typeof MessageToolParts>[0]['parts']} />
              )}
            </div>
          )
        })}
        {(status === 'streaming' || status === 'submitted') && (
          <div className="copilot-message copilot-message--assistant">
            <span className="copilot-tool-card__spinner" aria-hidden />
            <span className="text-sm text-slate-400 ml-2">Thinking…</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="copilot-panel__composer">
        <textarea
          value={input}
          onChange={handleInputChange}
          placeholder="Ask anything or request workspace updates…"
          rows={3}
          className="copilot-panel__input"
          disabled={!chatReady}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || !chatReady || status === 'streaming' || status === 'submitted'}
          className="copilot-panel__send"
        >
          Send
        </button>
      </form>
    </aside>
  )
}

function CopilotPanelLoading({ className = '' }: { className?: string }) {
  return (
    <aside className={`copilot-panel ${className}`}>
      <header className="copilot-panel__header">
        <div className="min-w-0 flex-1">
          <p className="text-xs uppercase tracking-wider text-slate-500">Copilot</p>
          <p className="text-sm text-slate-300">Loading…</p>
        </div>
      </header>
      <div className="copilot-panel__messages">
        <p className="text-sm text-slate-500 px-1">Loading conversation…</p>
      </div>
    </aside>
  )
}

export function CopilotPanelWhenReady(props: { className?: string }) {
  const { chatReady, activeThreadId } = useCopilot()
  if (!chatReady || !activeThreadId) {
    return <CopilotPanelLoading className={props.className} />
  }
  return <CopilotPanel className={props.className} />
}
