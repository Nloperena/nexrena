'use client'

import { useMessages } from '@/lib/store'
import { PageHeader, StatCard } from '@/components/ui'
import { OpsMessagesThreadView } from '@/components/ops-messages-thread-view'

export default function MessagesPage() {
  const { threads, unreadCount } = useMessages()

  const weekCount = threads.filter((t) => {
    const d = new Date(t.updatedAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return d >= weekAgo
  }).length

  return (
    <div>
      <PageHeader title="Client Messages" sub={`${threads.length} conversations`} />

      <div className="grid grid-cols-3 gap-4 mb-10 stagger">
        <StatCard label="Threads" value={String(threads.length)} />
        <StatCard label="Unread" value={String(unreadCount)} gold />
        <StatCard label="This week" value={String(weekCount)} />
      </div>

      <OpsMessagesThreadView />
    </div>
  )
}
