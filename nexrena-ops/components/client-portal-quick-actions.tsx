'use client'

import { Btn } from '@/components/ui'

type Props = {
  onStartRequest: () => void
  onUpload: () => void
  onMessage: () => void
}

export function ClientPortalQuickActions({ onStartRequest, onUpload, onMessage }: Props) {
  return (
    <div className="sticky top-0 z-30 -mx-6 px-6 py-3 mb-6 bg-[#111418]/90 backdrop-blur-md border-b border-slate-800/40">
      <div className="max-w-5xl mx-auto flex flex-wrap gap-2">
        <Btn size="sm" onClick={onMessage}>Message Nico</Btn>
        <Btn size="sm" onClick={onUpload}>Upload files</Btn>
        <Btn size="sm" variant="ghost" onClick={onStartRequest}>Start request</Btn>
      </div>
    </div>
  )
}
