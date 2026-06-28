'use client'

import ReactMarkdown from 'react-markdown'
import { useCopilot } from './copilot-provider'
import { MessageToolParts } from './tool-card-renderer'
import { messageText } from '@/lib/copilot-types'

export function CopilotPanel({ className = '' }: { className?: string }) {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    status,
    persona,
    panelCollapsed,
    setPanelCollapsed,
  } = useCopilot()

  if (panelCollapsed) {
    return (
      <aside className={`copilot-panel copilot-panel--collapsed ${className}`}>
        <button
          type="button"
          onClick={() => setPanelCollapsed(false)}
          className="copilot-panel__expand"
          aria-label="Open copilot"
        >
          ✦
        </button>
      </aside>
    )
  }

  return (
    <aside className={`copilot-panel ${className}`}>
      <header className="copilot-panel__header">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500">Copilot</p>
          <p className="text-sm text-slate-300">
            {persona === 'team' ? 'Team workspace' : 'Client workspace'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setPanelCollapsed(true)}
          className="text-slate-500 hover:text-slate-300 text-xs"
          aria-label="Collapse copilot"
        >
          Hide
        </button>
      </header>

      <div className="copilot-panel__messages">
        {messages.length === 0 && (
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
                  {isUser ? (
                    <p>{text}</p>
                  ) : (
                    <ReactMarkdown>{text}</ReactMarkdown>
                  )}
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || status === 'streaming' || status === 'submitted'}
          className="copilot-panel__send"
        >
          Send
        </button>
      </form>
    </aside>
  )
}
