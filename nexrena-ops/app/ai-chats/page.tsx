'use client'

import { OpsAiChatThreadView } from '@/components/ops-ai-chat-thread-view'

export default function AiChatsPage() {
  return (
    <div className="team-messenger-page flex flex-col flex-1 w-full min-w-0 min-h-0 overflow-hidden lg:min-h-[calc(100vh-4rem)]">
      <div className="hidden lg:flex items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <h2 className="font-serif text-2xl text-white">AI chats</h2>
          <p className="text-sm text-slate-400">
            Website sales assistant conversations from nexrena.com
          </p>
        </div>
      </div>

      <OpsAiChatThreadView />
    </div>
  )
}
