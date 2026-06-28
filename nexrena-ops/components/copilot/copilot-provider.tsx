'use client'

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { usePathname, useRouter } from 'next/navigation'
import { getPortalToken } from '@/lib/portal-client'
import {
  COPILOT_INTAKE_KEY,
  type CopilotPersona,
  type ToolExecutionResult,
  isToolPart,
} from '@/lib/copilot-types'

type CopilotContextValue = {
  persona: CopilotPersona
  showIntake: boolean
  setIntakeDone: () => void
  messages: ReturnType<typeof useChat>['messages']
  input: string
  setInput: (value: string) => void
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e?: FormEvent) => void
  sendChip: (text: string) => void
  status: ReturnType<typeof useChat>['status']
  panelCollapsed: boolean
  setPanelCollapsed: (v: boolean) => void
  confirmAction: (token: string) => Promise<ToolExecutionResult>
}

const CopilotContext = createContext<CopilotContextValue | null>(null)

type Props = {
  children: ReactNode
  persona: CopilotPersona
  clientView?: string
}

export function CopilotProvider({ children, persona, clientView }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [showIntake, setShowIntake] = useState(true)
  const [input, setInput] = useState('')
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const processedTools = useRef(new Set<string>())

  const currentPath = useMemo(() => {
    if (persona === 'client' && clientView) {
      return clientView === 'home' ? '/' : `/?view=${clientView}`
    }
    return pathname || '/'
  }, [persona, clientView, pathname])

  useEffect(() => {
    const isDone = sessionStorage.getItem(COPILOT_INTAKE_KEY)
    if (isDone === '1') setShowIntake(false)
  }, [])

  const setIntakeDone = useCallback(() => {
    sessionStorage.setItem(COPILOT_INTAKE_KEY, '1')
    setShowIntake(false)
  }, [])

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: persona === 'team' ? '/api/ops/ai/chat' : '/api/portal/ai/chat',
        headers:
          persona === 'client'
            ? (): Record<string, string> => {
                const token = getPortalToken()
                return token ? { Authorization: `Bearer ${token}` } : {}
              }
            : undefined,
        body: () => ({ currentPath }),
      }),
    [persona, currentPath],
  )

  const { messages, sendMessage, status } = useChat({ transport })

  const applyToolResult = useCallback(
    (result: ToolExecutionResult) => {
      if (!result?.ok) return
      if (result.uiPath && window.location.pathname + window.location.search !== result.uiPath) {
        router.push(result.uiPath)
      } else if (result.invalidatedPaths?.length) {
        router.refresh()
      }
    },
    [router],
  )

  useEffect(() => {
    for (const message of messages) {
      if (message.role !== 'assistant') continue
      for (const part of message.parts) {
        if (!isToolPart(part)) continue
        const toolPart = part as {
          toolCallId?: string
          state?: string
          output?: ToolExecutionResult
        }
        if (toolPart.state !== 'output-available' || !toolPart.toolCallId) continue
        if (processedTools.current.has(toolPart.toolCallId)) continue
        processedTools.current.add(toolPart.toolCallId)
        if (toolPart.output) applyToolResult(toolPart.output)
      }
    }
  }, [messages, applyToolResult])

  const confirmAction = useCallback(
    async (token: string): Promise<ToolExecutionResult> => {
      const res = await fetch('/api/ops/ai/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, currentPath }),
      })
      const result = (await res.json()) as ToolExecutionResult
      if (result.ok) applyToolResult(result)
      return result
    },
    [applyToolResult, currentPath],
  )

  const submitText = useCallback(
    (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || status === 'streaming' || status === 'submitted') return
      sendMessage({ text: trimmed })
      setInput('')
    },
    [sendMessage, status],
  )

  const handleSubmit = useCallback(
    (e?: FormEvent) => {
      e?.preventDefault?.()
      submitText(input)
    },
    [input, submitText],
  )

  const sendChip = useCallback(
    (text: string) => {
      setInput(text)
      submitText(text)
    },
    [submitText],
  )

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }, [])

  const value: CopilotContextValue = {
    persona,
    showIntake,
    setIntakeDone,
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    sendChip,
    status,
    panelCollapsed,
    setPanelCollapsed,
    confirmAction,
  }

  return <CopilotContext.Provider value={value}>{children}</CopilotContext.Provider>
}

export function useCopilot() {
  const ctx = useContext(CopilotContext)
  if (!ctx) throw new Error('useCopilot must be used inside CopilotProvider')
  return ctx
}
