'use client'

import { Suspense } from 'react'
import { OpsAiChatsView } from '@/components/ops-ai-chats/ops-ai-chats-view'

function AiChatsFallback() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[50dvh]">
      <p className="animate-pulse text-sm text-slate-500">Loading AI chats…</p>
    </div>
  )
}

export default function AiChatsPage() {
  return (
    <div className="team-messenger-page flex flex-col flex-1 w-full min-w-0 min-h-0 overflow-hidden lg:min-h-[calc(100vh-4rem)]">
      <div className="hidden lg:flex items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <h2 className="font-serif text-2xl text-white">AI chats</h2>
          <p className="text-sm text-slate-400">
            Live conversations by website — auto-refreshes every 15 seconds
          </p>
        </div>
      </div>

      <Suspense fallback={<AiChatsFallback />}>
        <OpsAiChatsView />
      </Suspense>
    </div>
  )
}
