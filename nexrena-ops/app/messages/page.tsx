'use client'

import { useMemo, useState } from 'react'
import { useMessages, useContacts } from '@/lib/store'
import { PageHeader, StatCard } from '@/components/ui'
import { OpsMessagesThreadView } from '@/components/ops-messages-thread-view'
import { teamLabelClass, teamSelectCls } from '@/lib/team-a11y'

export default function MessagesPage() {
  const [contactFilter, setContactFilter] = useState('')
  const { contacts } = useContacts()
  const { threads, unreadCount } = useMessages(contactFilter || undefined)

  const sortedContacts = useMemo(
    () => [...contacts].sort((a, b) => (a.company || a.name).localeCompare(b.company || b.name)),
    [contacts],
  )

  const weekCount = threads.filter((t) => {
    const d = new Date(t.updatedAt)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return d >= weekAgo
  }).length

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <PageHeader title="Client Messages" sub={`${threads.length} conversations`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 stagger">
        <StatCard label="Threads" value={String(threads.length)} />
        <StatCard label="Unread" value={String(unreadCount)} gold />
        <StatCard label="This week" value={String(weekCount)} />
      </div>

      <div className="mb-6 max-w-md">
        <label className={teamLabelClass} htmlFor="messages-client-filter">
          Show messages for
        </label>
        <select
          id="messages-client-filter"
          className={teamSelectCls}
          value={contactFilter}
          onChange={(e) => setContactFilter(e.target.value)}
        >
          <option value="">All clients</option>
          {sortedContacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company || c.name}
            </option>
          ))}
        </select>
      </div>

      <OpsMessagesThreadView contactFilter={contactFilter || undefined} />
    </div>
  )
}
