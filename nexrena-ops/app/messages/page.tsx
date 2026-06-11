'use client'

import { useState } from 'react'
import { useMessages, formatDate } from '@/lib/store'
import type { ClientMessage, ClientMessageStatus } from '@/lib/types'
import { PageHeader, StatCard, SectionCard, EmptyState } from '@/components/ui'

const STATUS_CONFIG: Record<ClientMessageStatus, { label: string; color: string }> = {
  unread: { label: 'Unread', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  read:   { label: 'Read',   color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
}

function preview(text: string, max = 80) {
  const flat = text.replace(/\s+/g, ' ').trim()
  return flat.length <= max ? flat : `${flat.slice(0, max)}…`
}

export default function MessagesPage() {
  const { messages, updateStatus } = useMessages()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<ClientMessageStatus | 'all'>('all')

  const unreadCount = messages.filter(m => m.status === 'unread').length
  const filtered = filter === 'all' ? messages : messages.filter(m => m.status === filter)

  const openMessage = (msg: ClientMessage) => {
    setExpanded(msg.id)
    if (msg.status === 'unread') updateStatus(msg.id, 'read')
  }

  return (
    <div>
      <PageHeader title="Client Messages" sub={`${messages.length} portal messages`} />

      <div className="grid grid-cols-3 gap-4 mb-10 stagger">
        <StatCard label="Total" value={String(messages.length)} />
        <StatCard label="Unread" value={String(unreadCount)} gold />
        <StatCard label="This week" value={String(messages.filter(m => {
          const d = new Date(m.createdAt)
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return d >= weekAgo
        }).length)} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', 'unread', 'read'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase transition-all duration-200 ${
              filter === s ? 'bg-gold text-obsidian' : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-slate-700/40'
            }`}
          >
            {s === 'all' ? `All (${messages.length})` : `${STATUS_CONFIG[s].label} (${messages.filter(m => m.status === s).length})`}
          </button>
        ))}
      </div>

      <SectionCard>
        <table className="nx-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Client</th>
              <th>Company</th>
              <th>Subject</th>
              <th>Preview</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(msg => {
              const cfg = STATUS_CONFIG[msg.status] || STATUS_CONFIG.unread
              return (
                <>
                  <tr
                    key={msg.id}
                    className="group cursor-pointer"
                    onClick={() => openMessage(msg)}
                  >
                    <td>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="text-white font-medium">{msg.clientName || '—'}</td>
                    <td className="text-slate-400">{msg.companyName || '—'}</td>
                    <td className="text-slate-300">{msg.subject}</td>
                    <td className="text-slate-500 text-xs max-w-[200px] truncate">{preview(msg.message)}</td>
                    <td className="text-slate-400 text-xs">{formatDate(msg.createdAt)}</td>
                  </tr>
                  {expanded === msg.id && (
                    <tr key={`${msg.id}-body`}>
                      <td colSpan={6} className="!pt-0 !pb-4 !border-b-0">
                        <div className="bg-slate-800/30 rounded-lg p-4 space-y-3">
                          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            {msg.clientEmail && (
                              <a href={`mailto:${msg.clientEmail}`} className="text-gold hover:underline">{msg.clientEmail}</a>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateStatus(msg.id, msg.status === 'read' ? 'unread' : 'read')
                              }}
                              className="text-xs uppercase tracking-wider text-slate-500 hover:text-gold"
                            >
                              Mark as {msg.status === 'read' ? 'unread' : 'read'}
                            </button>
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState message={filter === 'all' ? 'No client messages yet. They appear here when a portal client uses Message Nico.' : `No ${filter} messages.`} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </SectionCard>
    </div>
  )
}
