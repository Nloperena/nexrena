'use client'

import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  className?: string
}

/** Horizontally scrollable filter chips — safe on mobile. */
export function MobileFilterRow({ children, className = '' }: Props) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none ${className}`}
      role="tablist"
    >
      {children}
    </div>
  )
}

export function MobileFilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`shrink-0 rounded-xl px-3.5 py-2.5 text-xs font-semibold capitalize min-h-[44px] transition-colors ${
        active
          ? 'bg-gold/15 text-gold ring-1 ring-gold/30'
          : 'text-slate-400 bg-slate-800/40 hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
