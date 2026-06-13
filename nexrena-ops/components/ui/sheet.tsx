'use client'

import { useEffect, type ReactNode } from 'react'
import { portalFocusRing } from '@/lib/portal-a11y'

type SheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Sheet({ open, onOpenChange, children }: SheetProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false)
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onOpenChange])

  if (!open) return null

  return <div className="fixed inset-0 z-[70]">{children}</div>
}

type SheetContentProps = {
  title: string
  description?: string
  onClose: () => void
  children: ReactNode
  wide?: boolean
}

export function SheetContent({ title, description, onClose, children, wide }: SheetContentProps) {
  return (
    <>
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className={`absolute top-0 right-0 flex h-full w-full flex-col overflow-hidden border-l border-slate-700/60 bg-[#141820] shadow-[-16px_0_48px_rgba(0,0,0,0.5)] animate-slide-in-right ${
          wide ? 'max-w-xl sm:max-w-2xl' : 'max-w-md'
        }`}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-800/60 px-5 py-5">
          <div className="min-w-0">
            <h2 id="sheet-title" className="font-serif text-xl text-white">
              {title}
            </h2>
            {description && <p className="mt-1 text-base text-slate-400">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-2xl leading-none text-slate-400 transition-colors hover:bg-slate-800/50 hover:text-white ${portalFocusRing}`}
          >
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
      </div>
    </>
  )
}
