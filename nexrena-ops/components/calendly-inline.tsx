'use client'

import { useEffect, useRef } from 'react'
import { buildCalendlyUrl } from '@/lib/calendly'
import { loadCalendlyAssets } from '@/lib/calendly-widget'

type Props = {
  prefill?: { name?: string; email?: string }
}

export function CalendlyInline({ prefill }: Props) {
  const hostRef = useRef<HTMLDivElement>(null)
  const url = buildCalendlyUrl(prefill)

  useEffect(() => {
    if (!url || !hostRef.current) return

    let cancelled = false
    loadCalendlyAssets()
      .then(() => {
        if (cancelled || !hostRef.current || !window.Calendly) return
        hostRef.current.innerHTML = ''
        window.Calendly.initInlineWidget({
          url,
          parentElement: hostRef.current,
          prefill,
        })
      })
      .catch(() => {
        /* widget script blocked — iframe fallback below still works if user opens URL */
      })

    return () => {
      cancelled = true
    }
  }, [url, prefill])

  if (!url) return null

  return (
    <div
      ref={hostRef}
      className="calendly-inline-widget w-full rounded-xl overflow-hidden border border-slate-800/60 bg-obsidian/30"
      style={{ minWidth: '320px', height: 'min(900px, 85vh)' }}
    />
  )
}
