'use client'

import { useEffect, useRef, useState } from 'react'
import { portalFocusRing } from '@/lib/portal-a11y'

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

type Props = {
  name: string
  subtitle?: string
  onOpenSettings: () => void
  onSignOut: () => void
}

export function UserMenu({ name, subtitle, onOpenSettings, onSignOut }: Props) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-3 rounded-xl border-2 border-slate-600 bg-slate-800/40 px-3 py-2 min-h-[52px] hover:border-slate-500 hover:bg-slate-800/60 transition-colors ${portalFocusRing}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`Account menu for ${name}`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/15 text-base font-semibold text-gold ring-2 ring-gold/25">
          {initials(name)}
        </span>
        <span className="hidden sm:block text-left min-w-0">
          <span className="block text-base text-white truncate max-w-[160px]">{name}</span>
          {subtitle && <span className="block text-sm text-slate-400 truncate max-w-[160px]">{subtitle}</span>}
        </span>
        <span className="text-slate-400 text-sm hidden sm:block" aria-hidden>▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-60 rounded-xl border-2 border-slate-700/80 bg-obsidian shadow-2xl shadow-black/50 py-2 z-[70] animate-fade-in"
        >
          <div className="px-4 py-3 border-b border-slate-800/60 sm:hidden">
            <p className="text-base text-white truncate">{name}</p>
            {subtitle && <p className="text-sm text-slate-400 truncate">{subtitle}</p>}
          </div>
          <button
            type="button"
            role="menuitem"
            className={`w-full text-left px-4 py-3.5 text-base text-slate-200 hover:bg-slate-800/50 hover:text-white transition-colors min-h-[52px] ${portalFocusRing}`}
            onClick={() => { setOpen(false); onOpenSettings() }}
          >
            Account settings
          </button>
          <button
            type="button"
            role="menuitem"
            className={`w-full text-left px-4 py-3.5 text-base text-red-300 hover:bg-red-950/30 transition-colors min-h-[52px] ${portalFocusRing}`}
            onClick={() => { setOpen(false); onSignOut() }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
