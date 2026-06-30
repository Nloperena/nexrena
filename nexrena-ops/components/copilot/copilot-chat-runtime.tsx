'use client'

import {
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
import { useChat, type UIMessage } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { useRouter } from 'next/navigation'
import { getPortalToken } from '@/lib/portal-client'
import { syncCopilotThread } from '@/lib/copilot-threads'
import { isToolPart, type CopilotPersona, type ToolExecutionResult } from '@/lib/copilot-types'

type ChatRuntimeContextValue = {
  messages: UIMessage[]
  input: string
  setInput: (value: string) => void
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e?: FormEvent) => void
  sendChip: (text: string) => void
  status: ReturnType<typeof useChat>['status']
  confirmAction: (token: string) => Promise<ToolExecutionResult>
}

const ChatRuntimeContext = createContext<ChatRuntimeContextValue | null>(null)

type Props = {
  threadId: string
  persona: CopilotPersona
  currentPath: string
  initialMessages: UIMessage[]
  onThreadSynced: (threadId: string) => Promise<void>
  children: ReactNode
}

export function CopilotChatRuntime({
  threadId,
  persona,
  currentPath,
  initialMessages,
  onThreadSynced,
  children,
}: Props) {
  const router = useRouter()
  const [input, setInput] = useState('')
  const processedTools = useRef(new Set<string>())
  const syncing = useRef(false)

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
        body: () => ({ currentPath, threadId }),
      }),
    [persona, currentPath, threadId],
  )

  const { messages, sendMessage, status } = useChat({
    id: threadId,
    messages: initialMessages,
    transport,
    onFinish: async ({ messages: finishedMessages }) => {
      if (syncing.current) return
      syncing.current = true
      try {
        await syncCopilotThread(persona, threadId, finishedMessages)
        await onThreadSynced(threadId)
      } catch (err) {
        console.warn('[copilot] thread sync failed:', err)
      } finally {
        syncing.current = false
      }
    },
  })

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
    processedTools.current.clear()
  }, [threadId])

  useEffect(() => {
    if (status === 'streaming' || status === 'submitted') return
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
  }, [messages, applyToolResult, status])

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

  const value: ChatRuntimeContextValue = {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    sendChip,
    status,
    confirmAction,
  }

  return <ChatRuntimeContext.Provider value={value}>{children}</ChatRuntimeContext.Provider>
}

export function useCopilotChatRuntime() {
  const ctx = useContext(ChatRuntimeContext)
  if (!ctx) throw new Error('useCopilotChatRuntime must be used inside CopilotChatRuntime')
  return ctx
}

export function useCopilotChatRuntimeOptional() {
  return useContext(ChatRuntimeContext)
}
