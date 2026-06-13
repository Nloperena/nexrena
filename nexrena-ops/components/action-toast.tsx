'use client'

import { useEffect } from 'react'

type Props = {
  message: string
  variant?: 'success' | 'error'
  onDismiss: () => void
  undoLabel?: string
  onUndo?: () => void
  durationMs?: number
}

export function ActionToast({
  message,
  variant = 'success',
  onDismiss,
  undoLabel = 'Undo',
  onUndo,
  durationMs = 6000,
}: Props) {
  useEffect(() => {
    const id = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(id)
  }, [durationMs, onDismiss, message])

  const border =
    variant === 'error' ? 'border-red-500/40' : 'border-gold/40'
  const accent = variant === 'error' ? 'text-red-300' : 'text-gold'

  return (
    <div
      className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-[120] mx-auto max-w-md lg:bottom-6 lg:left-auto lg:right-8"
      role="status"
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-3 rounded-2xl border ${border} bg-[#1a1f27] px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)]`}
      >
        <p className={`min-w-0 flex-1 text-sm ${accent}`}>{message}</p>
        <div className="flex shrink-0 items-center gap-2">
          {onUndo && (
            <button
              type="button"
              onClick={() => {
                onUndo()
                onDismiss()
              }}
              className="rounded-lg bg-gold/15 px-2.5 py-1.5 text-xs font-medium text-gold hover:bg-gold/25 min-h-[36px]"
            >
              {undoLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onDismiss}
            className="rounded-lg px-2 py-1.5 text-xs text-slate-500 hover:text-slate-300 min-h-[36px]"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  )
}
