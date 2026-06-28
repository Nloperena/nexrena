'use client'

import { Suspense } from 'react'
import { OpsAiChatsView } from '@/components/ops-ai-chats/ops-ai-chats-view'

function AiChatsFallback() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[40dvh]">
      <p className="animate-pulse text-sm text-slate-500">Loading AI chats…</p>
    </div>
  )
}

export default function AiChatsPage() {
  return (
    <div className="team-messenger-page flex flex-col flex-1 w-full min-w-0 min-h-0 overflow-hidden">
      <Suspense fallback={<AiChatsFallback />}>
        <OpsAiChatsView />
      </Suspense>
    </div>
  )
}
