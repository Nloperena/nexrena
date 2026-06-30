'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { UIMessage } from '@ai-sdk/react'
import {
  COPILOT_INTAKE_KEY,
  COPILOT_VIEW_MODE_KEY,
  parseCopilotViewMode,
  type CopilotPersona,
  type CopilotThread,
  type CopilotViewMode,
} from '@/lib/copilot-types'
import {
  activeThreadStorageKey,
  createCopilotThread,
  deleteCopilotThread,
  listCopilotThreads,
  loadCopilotThread,
} from '@/lib/copilot-threads'
import { CopilotChatRuntime } from './copilot-chat-runtime'

type CopilotContextValue = {
  persona: CopilotPersona
  viewMode: CopilotViewMode
  setViewMode: (mode: CopilotViewMode) => void
  showIntake: boolean
  setIntakeDone: () => void
  panelCollapsed: boolean
  setPanelCollapsed: (v: boolean) => void
  threads: CopilotThread[]
  threadsLoading: boolean
  activeThreadId: string | null
  historyOpen: boolean
  setHistoryOpen: (v: boolean) => void
  startNewChat: () => Promise<void>
  selectThread: (threadId: string) => Promise<void>
  deleteThread: (threadId: string) => Promise<void>
  refreshThreads: () => Promise<void>
  chatReady: boolean
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
  const [viewMode, setViewModeState] = useState<CopilotViewMode>('workspace')
  const [hydrated, setHydrated] = useState(false)
  const [showIntake, setShowIntake] = useState(false)
  const [panelCollapsed, setPanelCollapsed] = useState(false)
  const [threads, setThreads] = useState<CopilotThread[]>([])
  const [threadsLoading, setThreadsLoading] = useState(true)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [initialMessages, setInitialMessages] = useState<UIMessage[]>([])
  const [chatReady, setChatReady] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)

  const refreshThreads = useCallback(async () => {
    try {
      const list = await listCopilotThreads(persona)
      setThreads(list)
    } catch (err) {
      console.warn('[copilot] could not load threads:', err)
    }
  }, [persona])

  const activateThread = useCallback(
    async (threadId: string) => {
      const { messages, thread } = await loadCopilotThread(persona, threadId)
      setActiveThreadId(threadId)
      setInitialMessages(messages as UIMessage[])
      sessionStorage.setItem(activeThreadStorageKey(persona), threadId)
      setThreads((prev) => {
        const rest = prev.filter((t) => t.id !== thread.id)
        return [{ ...thread, preview: thread.preview ?? null }, ...rest]
      })
      setChatReady(true)
    },
    [persona],
  )

  useEffect(() => {
    setViewModeState(parseCopilotViewMode(sessionStorage.getItem(COPILOT_VIEW_MODE_KEY)))
    setHydrated(true)
    if (
      sessionStorage.getItem(COPILOT_INTAKE_KEY) !== '1' &&
      parseCopilotViewMode(sessionStorage.getItem(COPILOT_VIEW_MODE_KEY)) === 'copilot'
    ) {
      setShowIntake(true)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function initThreads() {
      setThreadsLoading(true)
      setChatReady(false)
      try {
        const list = await listCopilotThreads(persona)
        if (cancelled) return
        setThreads(list)

        const storedId = sessionStorage.getItem(activeThreadStorageKey(persona))
        const existingId =
          storedId && list.some((t) => t.id === storedId) ? storedId : list[0]?.id

        if (existingId) {
          await activateThread(existingId)
        } else {
          const thread = await createCopilotThread(persona)
          if (cancelled) return
          setThreads([thread])
          setActiveThreadId(thread.id)
          setInitialMessages([])
          sessionStorage.setItem(activeThreadStorageKey(persona), thread.id)
          setChatReady(true)
        }
      } catch (err) {
        console.warn('[copilot] thread init failed:', err)
        if (!cancelled) setChatReady(true)
      } finally {
        if (!cancelled) setThreadsLoading(false)
      }
    }

    void initThreads()
    return () => {
      cancelled = true
    }
  }, [persona, activateThread])

  const setViewMode = useCallback(
    (mode: CopilotViewMode) => {
      sessionStorage.setItem(COPILOT_VIEW_MODE_KEY, mode)
      setViewModeState(mode)

      if (mode === 'workspace') {
        sessionStorage.setItem(COPILOT_INTAKE_KEY, '1')
        setShowIntake(false)
        setPanelCollapsed(false)
        setHistoryOpen(false)
        if (persona === 'team' && pathname === '/copilot') router.push('/')
      }

      if (mode === 'hybrid') {
        sessionStorage.setItem(COPILOT_INTAKE_KEY, '1')
        setShowIntake(false)
        setPanelCollapsed(false)
        if (persona === 'team' && pathname === '/copilot') router.push('/')
      }

      if (mode === 'copilot' && sessionStorage.getItem(COPILOT_INTAKE_KEY) !== '1') {
        setShowIntake(true)
      }
    },
    [pathname, persona, router],
  )

  useEffect(() => {
    if (hydrated && persona === 'team' && pathname === '/copilot') {
      setViewMode('copilot')
    }
  }, [hydrated, pathname, persona, setViewMode])

  useEffect(() => {
    if (hydrated && persona === 'client' && clientView === 'copilot') {
      setViewMode('copilot')
    }
  }, [hydrated, clientView, persona, setViewMode])

  const setIntakeDone = useCallback(() => {
    sessionStorage.setItem(COPILOT_INTAKE_KEY, '1')
    setShowIntake(false)
  }, [])

  const currentPath = useMemo(() => {
    if (persona === 'client' && clientView) {
      return clientView === 'home' ? '/' : `/?view=${clientView}`
    }
    return pathname || '/'
  }, [persona, clientView, pathname])

  const startNewChat = useCallback(async () => {
    setChatReady(false)
    setHistoryOpen(false)
    const thread = await createCopilotThread(persona)
    setThreads((prev) => [thread, ...prev.filter((t) => t.id !== thread.id)])
    setActiveThreadId(thread.id)
    setInitialMessages([])
    sessionStorage.setItem(activeThreadStorageKey(persona), thread.id)
    setChatReady(true)
  }, [persona])

  const selectThread = useCallback(
    async (threadId: string) => {
      if (threadId === activeThreadId) return
      setChatReady(false)
      await activateThread(threadId)
    },
    [activeThreadId, activateThread],
  )

  const deleteThread = useCallback(
    async (threadId: string) => {
      await deleteCopilotThread(persona, threadId)
      const remaining = threads.filter((t) => t.id !== threadId)
      setThreads(remaining)
      if (activeThreadId === threadId) {
        if (remaining[0]) await activateThread(remaining[0].id)
        else await startNewChat()
      }
    },
    [persona, threads, activeThreadId, activateThread, startNewChat],
  )

  const handleThreadSynced = useCallback(
    async (threadId: string) => {
      await refreshThreads()
      if (threadId !== activeThreadId) return
      try {
        const { thread } = await loadCopilotThread(persona, threadId)
        setThreads((prev) => {
          const rest = prev.filter((t) => t.id !== thread.id)
          return [{ ...thread, preview: thread.preview ?? null }, ...rest]
        })
      } catch {
        // preview refresh is best-effort
      }
    },
    [refreshThreads, activeThreadId, persona],
  )

  const value: CopilotContextValue = {
    persona,
    viewMode,
    setViewMode,
    showIntake: showIntake && viewMode === 'copilot',
    setIntakeDone,
    panelCollapsed,
    setPanelCollapsed,
    threads,
    threadsLoading,
    activeThreadId,
    historyOpen,
    setHistoryOpen,
    startNewChat,
    selectThread,
    deleteThread,
    refreshThreads,
    chatReady,
  }

  const content =
    activeThreadId && chatReady ? (
      <CopilotChatRuntime
        key={activeThreadId}
        threadId={activeThreadId}
        persona={persona}
        currentPath={currentPath}
        initialMessages={initialMessages}
        onThreadSynced={handleThreadSynced}
      >
        {children}
      </CopilotChatRuntime>
    ) : (
      children
    )

  return <CopilotContext.Provider value={value}>{content}</CopilotContext.Provider>
}

export function useCopilot() {
  const ctx = useContext(CopilotContext)
  if (!ctx) throw new Error('useCopilot must be used inside CopilotProvider')
  return ctx
}

export function useCopilotOptional() {
  return useContext(CopilotContext)
}
