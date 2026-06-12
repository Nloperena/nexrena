'use client'

import { useState } from 'react'
import { useServiceRequests, formatDate } from '@/lib/store'
import type { ServiceRequestStatus } from '@/lib/types'
import { PageHeader, Btn, StatCard, SectionCard, EmptyState, Badge } from '@/components/ui'

const STATUS_LABELS: Record<ServiceRequestStatus, string> = {
  new: 'New',
  reviewing: 'Reviewing',
  quoted: 'Quoted',
  accepted: 'Accepted',
  declined: 'Declined',
  closed: 'Closed',
}

const STATUS_ORDER: ServiceRequestStatus[] = ['new', 'reviewing', 'quoted', 'accepted', 'declined', 'closed']

export default function ServiceRequestsPage() {
  const { requests, updateStatus } = useServiceRequests()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<ServiceRequestStatus | 'all'>('all')

  const filtered = filter === 'all' ? requests : requests.filter((r) => r.status === filter)
  const newCount = requests.filter((r) => r.status === 'new').length

  const cycleStatus = (id: string, current: ServiceRequestStatus) => {
    const idx = STATUS_ORDER.indexOf(current)
    const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length]
    updateStatus(id, next)
  }

  return (
    <div>
      <PageHeader title="Service Requests" sub={`${requests.length} client portal submissions`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-10 stagger">
        <StatCard label="Total" value={String(requests.length)} />
        <StatCard label="Needs review" value={String(newCount)} gold />
        <StatCard label="With assets" value={String(requests.filter((r) => (r.assets?.length ?? 0) > 0).length)} />
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {(['all', ...STATUS_ORDER] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase transition-all duration-200 ${
              filter === s ? 'bg-gold text-obsidian' : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-slate-700/40'
            }`}
          >
            {s === 'all' ? `All (${requests.length})` : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <SectionCard>
        <table className="nx-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Client</th>
              <th>Type</th>
              <th>Budget</th>
              <th>Timeline</th>
              <th>Assets</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <>
                <tr key={row.id} className="group cursor-pointer" onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => cycleStatus(row.id, row.status)}
                      className="text-[10px] uppercase tracking-wider text-gold hover:underline"
                    >
                      {STATUS_LABELS[row.status]}
                    </button>
                  </td>
                  <td>
                    <p className="text-white font-medium">{row.contactName}</p>
                    <p className="text-xs text-slate-500">{row.contactCompany || row.contactEmail}</p>
                  </td>
                  <td><Badge label={row.projectType} /></td>
                  <td className="text-gold tabular-nums">{row.budget || '—'}</td>
                  <td className="text-slate-400">{row.timeline || '—'}</td>
                  <td className="tabular-nums">{row.assets?.length ?? 0}</td>
                  <td className="text-slate-400 text-xs">{formatDate(row.createdAt)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    {row.assets && row.assets.length > 0 && (
                      <Btn size="sm" variant="ghost" onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                        {expanded === row.id ? 'Hide' : 'Details'}
                      </Btn>
                    )}
                  </td>
                </tr>
                {expanded === row.id && (
                  <tr key={`${row.id}-detail`}>
                    <td colSpan={8} className="!pt-0 !pb-4 !border-b-0">
                      <div className="bg-slate-800/30 rounded-lg p-4 space-y-4">
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{row.description}</p>
                        {row.assets && row.assets.length > 0 && (
                          <ul className="space-y-2">
                            {row.assets.map((a) => (
                              <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                                <span className="text-white">{a.filename}</span>
                                <a href={a.blobUrl} target="_blank" rel="noopener noreferrer" className="text-gold text-xs hover:underline">
                                  Open asset
                                </a>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8}><EmptyState message="No service requests yet. Clients submit these from the portal." /></td></tr>
            )}
          </tbody>
        </table>
      </SectionCard>
    </div>
  )
}
