'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/lib/api'
import type { InboxItemDetail, InboxItemSummary, InboxListResponse, SiteChatOption } from '@/lib/ai-chat-types'

const POLL_MS = 15_000

export function useAiChatsInbox(initialSiteKey?: string | null) {
  const [sites, setSites] = useState<SiteChatOption[]>([])
  const [sessions, setSessions] = useState<InboxItemSummary[]>([])
  const [activeSiteKey, setActiveSiteKey] = useState<string | null>(initialSiteKey ?? null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [detail, setDetail] = useState<InboxItemDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null)
  const activeSummaryRef = useRef<InboxItemSummary | null>(null)
  const activeSiteRef = useRef<string | null>(null)
  const activeIdRef = useRef<string | null>(null)

  useEffect(() => {
    activeIdRef.current = activeId
  }, [activeId])

  const loadDetail = useCallback(
    async (inboxId: string, summary?: InboxItemSummary, opts?: { silent?: boolean }) => {
      if (!opts?.silent) setDetailLoading(true)
      try {
        const data = await api.get<InboxItemDetail>(`/chat-sessions/${encodeURIComponent(inboxId)}`)
        setDetail(data)
        if (summary) activeSummaryRef.current = summary
      } catch {
        if (!opts?.silent) {
          setError('Could not load conversation.')
          setDetail(null)
        }
      } finally {
        if (!opts?.silent) setDetailLoading(false)
      }
    },
    [],
  )

  const loadSessions = useCallback(
    async (opts?: { silent?: boolean; siteKey?: string | null; preserveActive?: boolean }) => {
      const siteKey = opts?.siteKey !== undefined ? opts.siteKey : activeSiteRef.current
      if (!siteKey) return null

      if (opts?.silent) setRefreshing(true)
      else setLoading(true)
      setError(null)

      try {
        const qs = new URLSearchParams({ kind: 'ai', siteKey, limit: '80' })
        const data = await api.get<InboxListResponse>(`/chat-sessions?${qs}`)
        setSites(data.siteOptions)
        setSessions(data.sessions.filter((s) => s.kind === 'ai'))
        setLastRefreshedAt(data.refreshedAt ? new Date(data.refreshedAt) : new Date())

        if (!opts?.preserveActive) {
          setActiveId((current) => {
            if (current && data.sessions.some((s) => s.id === current)) return current
            const first = data.sessions[0] ?? null
            activeSummaryRef.current = first
            return first?.id ?? null
          })
        }

        return data
      } catch {
        setError('Could not load AI chats.')
        return null
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [],
  )

  const selectSite = useCallback(
    (siteKey: string) => {
      activeSiteRef.current = siteKey
      setActiveSiteKey(siteKey)
      setActiveId(null)
      setDetail(null)
      activeSummaryRef.current = null
      void loadSessions({ siteKey })
    },
    [loadSessions],
  )

  useEffect(() => {
    let cancelled = false

    void (async () => {
      setLoading(true)
      setError(null)
      try {
        const bootstrap = await api.get<InboxListResponse>('/chat-sessions?kind=ai&limit=1')
        if (cancelled) return

        setSites(bootstrap.siteOptions)
        setLastRefreshedAt(bootstrap.refreshedAt ? new Date(bootstrap.refreshedAt) : new Date())

        const pick =
          initialSiteKey && bootstrap.siteOptions.some((s) => s.siteKey === initialSiteKey)
            ? initialSiteKey
            : bootstrap.siteOptions[0]?.siteKey ?? null

        if (pick) {
          activeSiteRef.current = pick
          setActiveSiteKey(pick)
          await loadSessions({ siteKey: pick })
        }
      } catch {
        if (!cancelled) setError('Could not load AI chats.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [initialSiteKey, loadSessions])

  useEffect(() => {
    if (!activeId) {
      setDetail(null)
      return
    }
    void loadDetail(activeId, activeSummaryRef.current ?? undefined)
  }, [activeId, loadDetail])

  useEffect(() => {
    if (!activeSiteKey) return

    const tick = () => {
      if (document.visibilityState !== 'visible') return
      void loadSessions({ silent: true, siteKey: activeSiteKey, preserveActive: true }).then(() => {
        const id = activeIdRef.current
        if (id) {
          void loadDetail(id, activeSummaryRef.current ?? undefined, { silent: true })
        }
      })
    }

    const id = window.setInterval(tick, POLL_MS)
    return () => window.clearInterval(id)
  }, [activeSiteKey, loadDetail, loadSessions])

  const openSession = (item: InboxItemSummary) => {
    activeSummaryRef.current = item
    setActiveId(item.id)
  }

  const refresh = useCallback(async () => {
    if (!activeSiteKey) return
    await loadSessions({ silent: true, siteKey: activeSiteKey, preserveActive: true })
    const id = activeIdRef.current
    if (id) {
      await loadDetail(id, activeSummaryRef.current ?? undefined, { silent: true })
    }
  }, [activeSiteKey, loadDetail, loadSessions])

  const activeSite = sites.find((s) => s.siteKey === activeSiteKey) ?? null
  const activeSummary = sessions.find((s) => s.id === activeId) ?? detail

  return {
    sites,
    sessions,
    activeSiteKey,
    activeSite,
    activeId,
    activeSummary,
    detail,
    loading,
    refreshing,
    detailLoading,
    error,
    lastRefreshedAt,
    selectSite,
    openSession,
    refresh,
  }
}
