'use client'

import { useCallback, useEffect, useId, useState } from 'react'

const STORAGE_PREFIX = 'portal-section-'

type Props = {
  id: string
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
  summary?: React.ReactNode
}

function readStored(id: string, fallback: boolean): boolean {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = sessionStorage.getItem(`${STORAGE_PREFIX}${id}`)
    if (raw === 'open') return true
    if (raw === 'closed') return false
  } catch {
    /* ignore */
  }
  return fallback
}

export function ClientCollapsibleSection({
  id,
  title,
  defaultOpen = false,
  children,
  summary,
}: Props) {
  const headingId = useId()
  const [open, setOpen] = useState(defaultOpen)

  useEffect(() => {
    setOpen(readStored(id, defaultOpen))
  }, [id, defaultOpen])

  const toggle = useCallback(() => {
    setOpen((prev) => {
      const next = !prev
      try {
        sessionStorage.setItem(`${STORAGE_PREFIX}${id}`, next ? 'open' : 'closed')
      } catch {
        /* ignore */
      }
      return next
    })
  }, [id])

  return (
    <section className="border border-slate-800/50 rounded-xl overflow-hidden glass-panel">
      <button
        type="button"
        id={headingId}
        aria-expanded={open}
        onClick={toggle}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-slate-800/20 transition-colors"
      >
        <span className="font-serif text-lg text-white">{title}</span>
        <span
          className={`text-slate-400 text-sm shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ▾
        </span>
      </button>

      {!open && summary && (
        <div className="px-5 pb-4 -mt-1 text-sm text-slate-500">{summary}</div>
      )}

      {open && (
        <div className="px-5 pb-5 pt-0 border-t border-slate-800/40">
          {children}
        </div>
      )}
    </section>
  )
}
