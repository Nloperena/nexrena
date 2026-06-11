'use client'

import type { ReactNode } from 'react'
import {
  IconInvoice,
  IconMessage,
  IconSpark,
} from '@/components/client-portal-visuals'

type ActionId = 'message' | 'request' | 'billing'

type Props = {
  onMessage: () => void
  onStartRequest: () => void
  onViewBilling: () => void
}

const ACTIONS: {
  id: ActionId
  title: string
  subtitle: string
  icon: ReactNode
  illustration: ReactNode
  primary?: boolean
}[] = [
  {
    id: 'message',
    title: 'Message Nico',
    subtitle: 'Questions, updates, or quick help',
    icon: <IconMessage className="w-5 h-5" />,
    illustration: (
      <svg className="w-full h-full opacity-40" viewBox="0 0 80 80" fill="none" aria-hidden>
        <circle cx="40" cy="40" r="32" stroke="#C9A96E" strokeWidth="1.5" strokeDasharray="4 4" />
        <path d="M22 38h36M22 48h24" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
        <path d="M48 22l10 10-10 10" stroke="#C9A96E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    primary: true,
  },
  {
    id: 'request',
    title: 'Start a request',
    subtitle: 'Website, growth, or support',
    icon: <IconSpark className="w-5 h-5" />,
    illustration: (
      <svg className="w-full h-full opacity-50" viewBox="0 0 80 80" fill="none" aria-hidden>
        <rect x="12" y="18" width="22" height="28" rx="6" fill="#0ea5e9" fillOpacity="0.25" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x="29" y="26" width="22" height="28" rx="6" fill="#4ade80" fillOpacity="0.25" stroke="#4ade80" strokeWidth="1.5" />
        <rect x="46" y="34" width="22" height="28" rx="6" fill="#a78bfa" fillOpacity="0.25" stroke="#a78bfa" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'billing',
    title: 'Billing',
    subtitle: 'Invoices and payments',
    icon: <IconInvoice className="w-5 h-5" />,
    illustration: (
      <svg className="w-full h-full opacity-40" viewBox="0 0 80 80" fill="none" aria-hidden>
        <rect x="20" y="16" width="40" height="48" rx="6" stroke="#C9A96E" strokeWidth="1.5" />
        <path d="M28 32h24M28 42h18M28 52h22" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="54" cy="54" r="10" fill="#C9A96E" fillOpacity="0.3" stroke="#C9A96E" strokeWidth="1.5" />
        <path d="M50 54l3 3 6-6" stroke="#E8D5B0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
]

export function ClientActionCards({ onMessage, onStartRequest, onViewBilling }: Props) {
  const handlers: Record<ActionId, () => void> = {
    message: onMessage,
    request: onStartRequest,
    billing: onViewBilling,
  }

  return (
    <section>
      <h2 className="text-sm text-slate-400 mb-4 font-medium">Quick actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ACTIONS.map((action) => (
          <button
            key={action.id}
            type="button"
            onClick={handlers[action.id]}
            className={`group relative overflow-hidden text-left rounded-2xl p-5 transition-all duration-200 active:scale-[0.98] min-h-[140px] ${
              action.primary
                ? 'bg-gradient-to-br from-gold/20 via-gold/10 to-transparent border-2 border-gold/40 hover:border-gold/60 hover:shadow-[0_0_24px_rgba(201,169,110,0.15)]'
                : 'glass-panel border border-slate-800/60 hover:border-slate-700/80 hover:bg-slate-800/20'
            }`}
          >
            <div className="pointer-events-none absolute -right-2 -bottom-2 w-24 h-24 text-slate-600 group-hover:text-gold/30 transition-colors">
              {action.illustration}
            </div>
            <span
              className={`relative inline-flex w-10 h-10 items-center justify-center rounded-xl mb-3 transition-colors ${
                action.primary
                  ? 'bg-gold/20 text-gold'
                  : 'bg-slate-800/60 text-slate-400 group-hover:text-gold group-hover:bg-gold/10'
              }`}
            >
              {action.icon}
            </span>
            <p className="relative font-serif text-lg text-white">{action.title}</p>
            <p className="relative text-sm text-slate-400 mt-1 leading-relaxed">{action.subtitle}</p>
          </button>
        ))}
      </div>
    </section>
  )
}
