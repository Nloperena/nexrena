'use client'

import { Fragment, useMemo, useState } from 'react'
import Link from 'next/link'
import { useContacts, useServiceRequests, formatDate } from '@/lib/store'
import type { ServiceRequest, ServiceRequestStatus } from '@/lib/types'
import { PageHeader, Btn, StatCard, SectionCard, EmptyState, Badge, Modal } from '@/components/ui'
import { Card } from '@/components/design-system'
import { MobileFilterChip, MobileFilterRow } from '@/components/mobile-filter-row'
import { OpsServiceRequestForm } from '@/components/ops-service-request-form'
import { SERVICE_REQUEST_STATUS_OPTIONS } from '@/lib/service-request-api'

const STATUS_CONFIG: Record<ServiceRequestStatus, { label: string; className: string }> = {
  new: { label: 'New', className: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
  reviewing: { label: 'Reviewing', className: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  quoted: { label: 'Quoted', className: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
  accepted: { label: 'Accepted', className: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  declined: { label: 'Declined', className: 'bg-red-500/20 text-red-300 border-red-500/30' },
  closed: { label: 'Closed', className: 'bg-slate-500/20 text-slate-400 border-slate-600/40' },
}

const STATUS_ORDER: ServiceRequestStatus[] = [
  'new',
  'reviewing',
  'quoted',
  'accepted',
  'declined',
  'closed',
]

function StatusSelect({
  value,
  onChange,
}: {
  value: ServiceRequestStatus
  onChange: (status: ServiceRequestStatus) => void
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as ServiceRequestStatus)}
      className="bg-[#0e1116] border border-slate-600/50 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-gold min-h-[32px]"
      onClick={(e) => e.stopPropagation()}
    >
      {SERVICE_REQUEST_STATUS_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function RequestDetail({ row }: { row: ServiceRequest }) {
  return (
    <div className="bg-slate-800/30 rounded-lg p-4 space-y-4 text-sm">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Description</p>
        <p className="text-slate-200 whitespace-pre-wrap">{row.description}</p>
      </div>
      {row.internalNotes && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Internal notes</p>
          <p className="text-slate-400 whitespace-pre-wrap">{row.internalNotes}</p>
        </div>
      )}
      <dl className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="text-slate-500 uppercase tracking-wider">Source</dt>
          <dd className="text-slate-300 mt-0.5">{row.source}</dd>
        </div>
        <div>
          <dt className="text-slate-500 uppercase tracking-wider">Updated</dt>
          <dd className="text-slate-300 mt-0.5">{formatDate(row.updatedAt)}</dd>
        </div>
      </dl>
      {row.assets && row.assets.length > 0 && (
        <ul className="space-y-2">
          {row.assets.map((asset) => (
            <li key={asset.id} className="flex items-center justify-between gap-3">
              <span className="text-white truncate">{asset.filename}</span>
              <a
                href={asset.blobUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold text-xs hover:underline shrink-0"
              >
                Open
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function ServiceRequestsPage() {
  const { requests, loading, refresh, add, edit, patch, remove, updateStatus } = useServiceRequests()
  const { contacts } = useContacts()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<ServiceRequestStatus | 'all' | 'open'>('open')
  const [modal, setModal] = useState<null | 'add' | ServiceRequest>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    return requests.filter((row) => {
      if (filter === 'open') return !['declined', 'closed'].includes(row.status)
      if (filter === 'all') return true
      return row.status === filter
    })
  }, [filter, requests])

  const newCount = requests.filter((row) => row.status === 'new').length
  const openCount = requests.filter((row) => !['declined', 'closed'].includes(row.status)).length

  const runAction = async (fn: () => Promise<void>) => {
    setActionError(null)
    try {
      await fn()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong.')
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  const handleDelete = (row: ServiceRequest) => {
    if (!window.confirm(`Delete request from ${row.contactName ?? 'client'}?`)) return
    void runAction(async () => {
      await remove(row.id)
      if (expanded === row.id) setExpanded(null)
      if (modal && modal !== 'add' && modal.id === row.id) setModal(null)
    })
  }

  const handleSave = async (payload: ServiceRequest) => {
    if (modal === 'add') {
      await add({
        contactId: payload.contactId,
        contactName: payload.contactName,
        contactCompany: payload.contactCompany,
        contactEmail: payload.contactEmail,
        portalAccountId: payload.portalAccountId,
        projectType: payload.projectType,
        description: payload.description,
        budget: payload.budget,
        timeline: payload.timeline,
        status: payload.status,
        source: payload.source,
        internalNotes: payload.internalNotes,
      })
    } else if (modal !== 'add') {
      await edit({ ...payload, id: modal.id })
    }
    setModal(null)
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <PageHeader
        title="Service Requests"
        sub={`${requests.length} total · ${openCount} open`}
        action={
          <div className="flex flex-wrap gap-2">
            <Btn size="sm" variant="ghost" onClick={handleRefresh} disabled={refreshing || loading}>
              {refreshing ? 'Refreshing…' : '↻ Refresh'}
            </Btn>
            <Btn onClick={() => setModal('add')}>+ New request</Btn>
          </div>
        }
      />

      {actionError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)} className="ml-4 text-red-400 hover:text-red-200">
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-10 stagger">
        <StatCard label="Open" value={String(openCount)} gold={openCount > 0} />
        <StatCard label="Needs review" value={String(newCount)} gold={newCount > 0} />
        <StatCard
          label="With assets"
          value={String(requests.filter((row) => (row.assets?.length ?? 0) > 0).length)}
        />
      </div>

      <MobileFilterRow className="mb-6">
        <MobileFilterChip active={filter === 'open'} onClick={() => setFilter('open')}>
          Open ({openCount})
        </MobileFilterChip>
        {(['all', ...STATUS_ORDER] as const).map((status) => (
          <MobileFilterChip key={status} active={filter === status} onClick={() => setFilter(status)}>
            {status === 'all'
              ? `All (${requests.length})`
              : `${STATUS_CONFIG[status].label} (${requests.filter((row) => row.status === status).length})`}
          </MobileFilterChip>
        ))}
      </MobileFilterRow>

      <div className="lg:hidden space-y-3 mb-6">
        {filtered.length === 0 ? (
          <EmptyState message="No service requests match these filters." action={() => setModal('add')} actionLabel="Create request" />
        ) : (
          filtered.map((row) => (
            <Card key={row.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-serif text-lg text-white truncate">{row.contactName}</p>
                  <p className="text-sm text-slate-400 truncate">{row.contactCompany || row.contactEmail}</p>
                </div>
                <StatusSelect value={row.status} onChange={(status) => void runAction(() => updateStatus(row.id, status))} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge label={row.projectType} />
                {row.budget && <span className="text-sm text-gold">{row.budget}</span>}
              </div>
              <p className="text-sm text-slate-400 line-clamp-2">{row.description}</p>
              <p className="text-xs text-slate-600">{formatDate(row.createdAt)}</p>
              {expanded === row.id && <RequestDetail row={row} />}
              <div className="flex flex-wrap gap-2">
                <Btn size="sm" variant="ghost" onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                  {expanded === row.id ? 'Less' : 'Details'}
                </Btn>
                <Btn size="sm" variant="ghost" onClick={() => setModal(row)}>Edit</Btn>
                <Link href={`/messages?contact=${row.contactId}`}>
                  <Btn size="sm" variant="ghost">Message</Btn>
                </Link>
                <Btn size="sm" variant="danger" onClick={() => handleDelete(row)}>Delete</Btn>
              </div>
            </Card>
          ))
        )}
      </div>

      <SectionCard className="hidden lg:block">
        <table className="nx-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Client</th>
              <th>Type</th>
              <th>Budget</th>
              <th>Timeline</th>
              <th>Assets</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <Fragment key={row.id}>
                <tr className="group cursor-pointer" onClick={() => setExpanded(expanded === row.id ? null : row.id)}>
                  <td onClick={(e) => e.stopPropagation()}>
                    <StatusSelect
                      value={row.status}
                      onChange={(status) => void runAction(() => updateStatus(row.id, status))}
                    />
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
                    <div className="flex gap-1 flex-wrap justify-end">
                      <Btn size="sm" variant="ghost" onClick={() => setModal(row)}>Edit</Btn>
                      <Link href={`/messages?contact=${row.contactId}`}>
                        <Btn size="sm" variant="ghost">Msg</Btn>
                      </Link>
                      <Btn size="sm" variant="danger" onClick={() => handleDelete(row)}>Del</Btn>
                    </div>
                  </td>
                </tr>
                {expanded === row.id && (
                  <tr>
                    <td colSpan={8} className="!pt-0 !pb-4 !border-b-0">
                      <RequestDetail row={row} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <EmptyState
                    message="No service requests yet."
                    action={() => setModal('add')}
                    actionLabel="Create first request"
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </SectionCard>

      {modal && (
        <Modal
          title={modal === 'add' ? 'New service request' : 'Edit service request'}
          onClose={() => setModal(null)}
          wide
        >
          <OpsServiceRequestForm
            initial={modal === 'add' ? undefined : modal}
            contacts={contacts}
            onSave={(payload) => runAction(() => handleSave(payload))}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  )
}
