'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { PortalAiRobotIcon } from '@/components/portal-ai-robot-icon'
import { portalFocusRing, portalInputCls, portalMutedClass } from '@/lib/portal-a11y'
import { sendPortalAiChat } from '@/lib/portal-client'
import type { PortalAiChatMessage, PortalAiAction } from '@/lib/portal-types'
import type { ClientPortalView } from '@/components/client-nav'

const WELCOME_MESSAGE = `Hi! I'm your Nexrena AI assistant. I can help you navigate the portal, understand billing and subscriptions, draft service requests, guide file uploads, and answer questions about your websites and WaaS plan.

What can I help you with today?`

type Props = {
  open: boolean
  onClose: () => void
  onNavigate?: (view: ClientPortalView) => void
  clientName?: string
}

type ChatEntry = PortalAiChatMessage & { id: string }

function newId() {
  return `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function isPortalView(view: string | undefined): view is ClientPortalView {
  if (!view) return false
  const valid: ClientPortalView[] = [
    'home', 'billing', 'messages', 'schedule', 'files',
    'websites', 'forms', 'requests', 'settings',
  ]
  return valid.includes(view as ClientPortalView)
}

export function PortalAiChatPanel({ open, onClose, onNavigate, clientName }: Props) {
  const [messages, setMessages] = useState<ChatEntry[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [configured, setConfigured] = useState<boolean | null>(null)
  const [actions, setActions] = useState<PortalAiAction[]>([])
  const listRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: newId(),
          role: 'assistant',
          content: clientName
            ? WELCOME_MESSAGE.replace('Hi!', `Hi ${clientName.split(' ')[0]}!`)
            : WELCOME_MESSAGE,
        },
      ])
    }
  }, [open, clientName, messages.length])

  useEffect(() => {
    if (open) {
      const t = window.setTimeout(() => inputRef.current?.focus(), 200)
      return () => window.clearTimeout(t)
    }
  }, [open])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, sending])

  const runAction = useCallback(
    (action: PortalAiAction) => {
      if (action.type === 'navigate' && isPortalView(action.view)) {
        onNavigate?.(action.view)
        onClose()
        return
      }
      if (action.type === 'create_service_request') {
        onNavigate?.('requests')
        onClose()
      }
    },
    [onClose, onNavigate],
  )

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return

    const userMsg: ChatEntry = { id: newId(), role: 'user', content: text }
    const history = [...messages, userMsg]
    setMessages(history)
    setInput('')
    setError(null)
    setActions([])
    setSending(true)

    try {
      const apiMessages: PortalAiChatMessage[] = history
        .filter((m) => m.role === 'user' || m.role === 'assistant')
        .map(({ role, content }) => ({ role, content }))

      const result = await sendPortalAiChat(apiMessages)
      setConfigured(result.configured)
      setMessages((prev) => [
        ...prev,
        { id: newId(), role: 'assistant', content: result.message },
      ])
      if (result.actions?.length) setActions(result.actions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach the assistant.')
    } finally {
      setSending(false)
    }
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[48] flex items-end justify-end p-0 sm:p-4 sm:pb-6 pointer-events-none"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto sm:bg-black/25"
        aria-label="Close AI assistant"
        onClick={onClose}
      />

      <section
        className="relative pointer-events-auto w-full sm:w-[400px] md:w-[420px] max-h-[min(85vh,640px)] flex flex-col rounded-t-2xl sm:rounded-2xl border border-slate-700/70 bg-[#141820]/98 backdrop-blur-xl shadow-[0_-12px_48px_rgba(0,0,0,0.55)] sm:shadow-[0_16px_48px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-4 duration-200 mr-0 sm:mr-2"
        role="dialog"
        aria-modal="true"
        aria-label="Nexrena AI assistant"
      >
        <header className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-700/60 shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold/15 border border-gold/30">
            <PortalAiRobotIcon className="w-6 h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-white truncate">Nexrena Assistant</p>
            <p className="text-sm text-slate-400 truncate">
              {configured === false ? 'Guided help mode' : 'AI-powered portal help'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Minimize assistant"
            className={`shrink-0 rounded-xl border-2 border-slate-600 px-3 py-2 text-slate-300 hover:text-white hover:border-slate-500 ${portalFocusRing}`}
          >
            <span aria-hidden className="text-lg leading-none">−</span>
          </button>
        </header>

        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[200px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[88%] rounded-2xl px-4 py-3 text-base leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-gold/25 text-white border border-gold/35 rounded-br-md'
                    : 'bg-slate-800/90 text-slate-100 border border-slate-600/70 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
              </div>
            </div>
          ))}
          {sending && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-md bg-slate-800/90 border border-slate-600/70 px-4 py-3">
                <span className="inline-flex gap-1.5 items-center text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-gold/60 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-gold/60 animate-pulse [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-gold/60 animate-pulse [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}
        </div>

        {actions.length > 0 && (
          <div className="px-4 pb-2 flex flex-wrap gap-2 shrink-0">
            {actions.map((action) => (
              <button
                key={`${action.type}-${action.label}`}
                type="button"
                onClick={() => runAction(action)}
                className={`rounded-xl border border-gold/40 bg-gold/10 px-3 py-2 text-sm text-gold-light hover:bg-gold/20 ${portalFocusRing}`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}

        {error && (
          <p className="px-4 pb-2 text-sm text-red-300 shrink-0" role="alert">
            {error}
          </p>
        )}

        <footer className="shrink-0 border-t border-slate-700/60 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              rows={1}
              placeholder="Ask about billing, requests, files…"
              disabled={sending}
              className={`${portalInputCls} min-h-[48px] max-h-28 py-3 text-base resize-none flex-1`}
              aria-label="Message to AI assistant"
            />
            <button
              type="button"
              onClick={() => void send()}
              disabled={sending || !input.trim()}
              className={`shrink-0 rounded-xl bg-gold px-4 py-3 min-h-[48px] text-[#0c0f12] font-semibold hover:bg-gold-light disabled:opacity-50 disabled:cursor-not-allowed ${portalFocusRing}`}
            >
              Send
            </button>
          </div>
          <p className={`${portalMutedClass} text-sm mt-2 opacity-80`}>
            AI may make mistakes — verify billing details in your portal.
          </p>
        </footer>
      </section>
    </div>
  )
}
