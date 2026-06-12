'use client'

import { useEffect, useMemo, useState } from 'react'
import { useMessages, useContacts } from '@/lib/store'
import { OpsMessagesThreadView } from '@/components/ops-messages-thread-view'
import { teamSelectCls } from '@/lib/team-a11y'

export default function MessagesPage() {
  const [contactFilter, setContactFilter] = useState('')
  const { contacts } = useContacts()
  const { threads, unreadCount } = useMessages(contactFilter || undefined)

  const sortedContacts = useMemo(
    () => [...contacts].sort((a, b) => (a.company || a.name).localeCompare(b.company || b.name)),
    [contacts],
  )

  useEffect(() => {
    const contact = new URLSearchParams(window.location.search).get('contact')
    if (contact) setContactFilter(contact)
  }, [])

  return (
    <div className="team-messenger-page flex flex-col flex-1 w-full min-w-0 min-h-0 overflow-hidden lg:min-h-[calc(100vh-4rem)]">
      {/* Compact toolbar — desktop only stats live in thread header on mobile */}
      <div className="hidden lg:flex items-center justify-between gap-4 mb-4 shrink-0">
        <div>
          <h2 className="font-serif text-2xl text-white">Messages</h2>
          <p className="text-sm text-slate-400">
            {threads.length} conversations · {unreadCount} unread
          </p>
        </div>
        <div className="w-56">
          <label className="sr-only" htmlFor="messages-client-filter">Filter by client</label>
          <select
            id="messages-client-filter"
            className={teamSelectCls}
            value={contactFilter}
            onChange={(e) => setContactFilter(e.target.value)}
          >
            <option value="">All clients</option>
            {sortedContacts.map((c) => (
              <option key={c.id} value={c.id}>{c.company || c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <OpsMessagesThreadView
        contactFilter={contactFilter || undefined}
        clients={sortedContacts}
        contactFilterValue={contactFilter}
        onContactFilterChange={setContactFilter}
      />
    </div>
  )
}
