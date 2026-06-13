'use client'

import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  highlighted?: boolean
  featured?: boolean
  className?: string
}

/** Shared card chrome — gradient edge, glass panel, optional gold highlight. */
export function ShopCardShell({ children, highlighted, featured, className = '' }: Props) {
  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-[#161b22]/95 shadow-[0_10px_40px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] transition-all duration-300 ${
        highlighted
          ? 'border-gold/50 ring-2 ring-gold/30 shadow-[0_12px_48px_rgba(201,169,110,0.15)]'
          : featured
            ? 'border-gold/35 hover:border-gold/50'
            : 'border-slate-600/45 hover:border-slate-500/70'
      } ${className}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" aria-hidden />
      <div className="pointer-events-none absolute top-0 right-0 h-20 w-20 bg-gradient-to-bl from-gold/[0.12] to-transparent" aria-hidden />
      {children}
    </article>
  )
}
