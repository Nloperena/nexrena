'use client'

import { useState } from 'react'
import { PortalAiRobotIcon } from '@/components/portal-ai-robot-icon'
import { PortalAiChatPanel } from '@/components/portal-ai-chat-panel'
import { portalFocusRing } from '@/lib/portal-a11y'
import type { ClientPortalView } from '@/components/client-nav'

type Props = {
  onNavigate?: (view: ClientPortalView) => void
  clientName?: string
}

export function PortalAiAgentButton({ onNavigate, clientName }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open AI assistant"
        aria-expanded={open}
        className={`portal-ai-fab group fixed z-[45] right-4 md:right-6 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] md:bottom-6 flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-gold/45 bg-[#141820]/95 text-gold-light shadow-[0_8px_32px_rgba(0,0,0,0.45)] backdrop-blur-md transition-all duration-300 hover:border-gold hover:bg-gold/15 hover:shadow-[0_8px_32px_rgba(201,169,110,0.25)] hover:scale-105 active:scale-95 ${portalFocusRing}`}
      >
        <PortalAiRobotIcon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/50 opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-gold" />
        </span>
      </button>

      <PortalAiChatPanel
        open={open}
        onClose={() => setOpen(false)}
        onNavigate={onNavigate}
        clientName={clientName}
      />
    </>
  )
}
