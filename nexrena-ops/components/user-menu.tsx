'use client'

import { useEffect, useRef, useState } from 'react'

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
        className="flex items-center gap-2.5 rounded-lg border border-slate-700/60 bg-slate-800/40 px-2.5 py-1.5 hover:border-slate-600 hover:bg-slate-800/60 transition-colors"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-semibold text-gold ring-1 ring-gold/25">
          {initials(name)}
        </span>
        <span className="hidden sm:block text-left min-w-0">
          <span className="block text-sm text-white truncate max-w-[140px]">{name}</span>
          {subtitle && <span className="block text-[10px] text-slate-500 truncate max-w-[140px]">{subtitle}</span>}
        </span>
        <span className="text-slate-500 text-[10px] hidden sm:block">▾</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-slate-700/60 bg-obsidian shadow-2xl shadow-black/50 py-1.5 z-[70] animate-fade-in"
        >
          <div className="px-3 py-2 border-b border-slate-800/60 sm:hidden">
            <p className="text-sm text-white truncate">{name}</p>
            {subtitle && <p className="text-[10px] text-slate-500 truncate">{subtitle}</p>}
          </div>
          <button
            type="button"
            role="menuitem"
            className="w-full text-left px-3 py-2.5 text-sm text-slate-300 hover:bg-slate-800/50 hover:text-white transition-colors"
            onClick={() => { setOpen(false); onOpenSettings() }}
          >
            Account settings
          </button>
          <button
            type="button"
            role="menuitem"
            className="w-full text-left px-3 py-2.5 text-sm text-red-400 hover:bg-red-950/30 transition-colors"
            onClick={() => { setOpen(false); onSignOut() }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
