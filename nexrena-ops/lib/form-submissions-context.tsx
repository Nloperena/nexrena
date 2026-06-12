'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import Link from 'next/link'
import type { FormSubmission, FormSubmissionStatus } from '@/lib/types'
import { api } from '@/lib/api'
import { playNewFormSound, unlockNotificationSound } from '@/lib/notification-sound'

const POLL_MS = 15000

const SITE_LABELS: Record<string, string> = {
  ttag: 'TTAG',
  nexrena: 'Nexrena',
  fpusa: 'Furniture Packages USA',
  nicoloperena: 'NicoLoperena.com',
}

type FormSubmissionsContextValue = {
  submissions: FormSubmission[]
  loading: boolean
  refresh: () => Promise<void>
  updateStatus: (id: string, status: FormSubmissionStatus) => Promise<void>
  archive: (id: string) => Promise<void>
  remove: (id: string) => Promise<void>
  newCount: number
}

const FormSubmissionsContext = createContext<FormSubmissionsContextValue | null>(null)

function showBrowserNotification(sub: FormSubmission) {
  if (typeof window === 'undefined' || typeof Notification === 'undefined') return
  if (Notification.permission !== 'granted') return

  const site = SITE_LABELS[sub.siteKey] ?? sub.siteKey
  new Notification('New form lead', {
    body: `${sub.submitterName} · ${site}`,
    tag: `form-${sub.id}`,
  })
}

function alertForNewSubmission(sub: FormSubmission) {
  const tabVisible = typeof document !== 'undefined' && document.visibilityState === 'visible'

  if (tabVisible) {
    playNewFormSound()
  } else {
    showBrowserNotification(sub)
  }

  if (tabVisible && typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    showBrowserNotification(sub)
  }
}

function FormArrivalToast({
  sub,
  onDismiss,
}: {
  sub: FormSubmission
  onDismiss: () => void
}) {
  const site = SITE_LABELS[sub.siteKey] ?? sub.siteKey

  useEffect(() => {
    const id = window.setTimeout(onDismiss, 8000)
    return () => window.clearTimeout(id)
  }, [onDismiss, sub.id])

  return (
    <div
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-[120] mx-auto max-w-md lg:bottom-6 lg:left-auto lg:right-8"
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3 rounded-2xl border border-gold/40 bg-[#1a1f27] px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
        <span className="mt-0.5 text-lg" aria-hidden>
          ▣
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white">New form lead</p>
          <p className="truncate text-sm text-gold">{sub.submitterName}</p>
          <p className="truncate text-xs text-slate-400">{site}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-1">
          <Link
            href="/form-submissions"
            onClick={onDismiss}
            className="rounded-lg bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold hover:bg-gold/25"
          >
            View
          </Link>
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:text-slate-300"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}

export function FormSubmissionsProvider({
  children,
  enabled,
}: {
  children: ReactNode
  enabled: boolean
}) {
  const [submissions, setSubmissions] = useState<FormSubmission[]>([])
  const [loading, setLoading] = useState(true)
  const [toastSub, setToastSub] = useState<FormSubmission | null>(null)
  const seenIdsRef = useRef<Set<string>>(new Set())
  const primedRef = useRef(false)

  const notifyNew = useCallback((incoming: FormSubmission[]) => {
    if (incoming.length === 0) return
    for (const sub of incoming) alertForNewSubmission(sub)
    setToastSub(incoming[0])
  }, [])

  const refresh = useCallback(async () => {
    try {
      const rows = await api.get<FormSubmission[]>('/forms/submissions')

      if (!primedRef.current) {
        for (const row of rows) seenIdsRef.current.add(row.id)
        primedRef.current = true
        setSubmissions(rows)
        return
      }

      const newOnes = rows.filter((row) => !seenIdsRef.current.has(row.id))
      for (const row of newOnes) seenIdsRef.current.add(row.id)

      setSubmissions(rows)

      if (newOnes.length > 0 && enabled) {
        notifyNew(newOnes)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [enabled, notifyNew])

  useEffect(() => {
    if (!enabled) {
      setSubmissions([])
      setLoading(false)
      primedRef.current = false
      seenIdsRef.current = new Set()
      return
    }

    const unlock = () => {
      unlockNotificationSound()
      if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
        void Notification.requestPermission()
      }
    }
    document.addEventListener('pointerdown', unlock, { once: true })
    document.addEventListener('keydown', unlock, { once: true })

    void refresh()
    const intervalId = window.setInterval(refresh, POLL_MS)

    const onVisible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', onVisible)
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('keydown', unlock)
    }
  }, [enabled, refresh])

  const updateStatus = useCallback(
    async (id: string, status: FormSubmissionStatus) => {
      setSubmissions((prev) => prev.map((x) => (x.id === id ? { ...x, status } : x)))
      try {
        await api.patch(`/forms/submissions/${id}`, { status })
      } catch (e) {
        console.error(e)
        await refresh()
      }
    },
    [refresh],
  )

  const archive = useCallback(async (id: string) => {
    await updateStatus(id, 'archived')
  }, [updateStatus])

  const remove = useCallback(
    async (id: string) => {
      setSubmissions((prev) => prev.filter((x) => x.id !== id))
      seenIdsRef.current.delete(id)
      try {
        await api.del(`/forms/submissions/${id}`)
      } catch (e) {
        console.error(e)
        await refresh()
      }
    },
    [refresh],
  )

  const newCount = submissions.filter((s) => s.status === 'new').length

  return (
    <FormSubmissionsContext.Provider
      value={{ submissions, loading, refresh, updateStatus, archive, remove, newCount }}
    >
      {children}
      {toastSub && (
        <FormArrivalToast sub={toastSub} onDismiss={() => setToastSub(null)} />
      )}
    </FormSubmissionsContext.Provider>
  )
}

export function useFormSubmissions() {
  const ctx = useContext(FormSubmissionsContext)
  if (!ctx) {
    throw new Error('useFormSubmissions must be used within FormSubmissionsProvider')
  }
  return ctx
}
