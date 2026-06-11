'use client'

import type { ReactNode } from 'react'
import { buildCalendlyUrl, isCalendlyEnabled, mailtoFallback } from '@/lib/calendly'
import { loadCalendlyAssets } from '@/lib/calendly-widget'

type Props = {
  prefill?: { name?: string; email?: string }
  children: ReactNode
  className?: string
  variant?: 'primary' | 'ghost'
  size?: 'sm' | 'md'
}

export function CalendlyBookButton({
  prefill,
  children,
  className = '',
  variant = 'primary',
  size = 'md',
}: Props) {
  const url = buildCalendlyUrl(prefill)

  if (!isCalendlyEnabled()) {
    return (
      <a
        href={mailtoFallback()}
        className={className || buttonClass(variant, size)}
      >
        {children}
      </a>
    )
  }

  const openPopup = async () => {
    try {
      await loadCalendlyAssets()
      if (window.Calendly && url) {
        window.Calendly.initPopupWidget({ url, prefill })
      }
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <button
      type="button"
      onClick={openPopup}
      className={className || buttonClass(variant, size)}
    >
      {children}
    </button>
  )
}

function buttonClass(variant: 'primary' | 'ghost', size: 'sm' | 'md') {
  const base =
    'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 active:scale-[0.97]'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm' }
  const variants = {
    primary: 'bg-gold text-obsidian hover:bg-gold-light btn-glow font-semibold',
    ghost:
      'border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800/30',
  }
  return `${base} ${sizes[size]} ${variants[variant]}`
}
