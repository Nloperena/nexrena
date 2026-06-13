'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useFormSubmissions, useContacts, formatDate } from '@/lib/store'
import type { FormSubmission, FormSubmissionStatus } from '@/lib/types'
import { PageHeader, Btn, StatCard, SectionCard, EmptyState } from '@/components/ui'
import { Card } from '@/components/design-system'
import { MobileFilterChip, MobileFilterRow } from '@/components/mobile-filter-row'

const SITE_LABELS: Record<string, string> = {
  ttag: 'TTAG',
  nexrena: 'Nexrena',
  fpusa: 'Furniture Packages USA',
  nicoloperena: 'NicoLoperena.com',
}

type ListView = 'active' | 'archived'

function messagePreview(sub: FormSubmission): string {
  const fields = sub.fields as Record<string, unknown>
  const msg = typeof fields.message === 'string' ? fields.message : ''
  return msg.length > 120 ? `${msg.slice(0, 120)}…` : msg
}

function confirmArchive(sub: FormSubmission) {
  return window.confirm(
    `Move "${sub.submitterName}" to archive? You can restore it later from the Archive view.`,
  )
}

function confirmPermanentDelete(sub: FormSubmission) {
  return window.confirm(
    `Delete "${sub.submitterName}" permanently? This cannot be undone.`,
  )
}

function SubmissionActions({
  sub,
  listView,
  expanded,
  onToggleExpand,
  onToggleRead,
  onArchive,
  onRestore,
  onRemove,
  contactName,
  contactId,
}: {
  sub: FormSubmission
  listView: ListView
  expanded: boolean
  onToggleExpand: () => void
  onToggleRead: () => void
  onArchive: () => void
  onRestore: () => void
  onRemove: () => void
  contactName?: string
  contactId?: string
}) {
  const isArchived = listView === 'archived'

  return (
    <div className="flex flex-wrap gap-2">
      <Btn size="sm" variant="ghost" onClick={onToggleExpand}>
        {expanded ? 'Less' : 'Details'}
      </Btn>
      {!isArchived && (
        <Btn size="sm" variant="ghost" onClick={onToggleRead}>
          {sub.status === 'new' ? 'Mark read' : 'Mark new'}
        </Btn>
      )}
      {!isArchived ? (
        <Btn size="sm" variant="ghost" onClick={onArchive}>
          Move to archive
        </Btn>
      ) : (
        <>
          <Btn size="sm" variant="ghost" onClick={onRestore}>
            Restore
          </Btn>
          <Btn size="sm" variant="danger" onClick={onRemove}>
            Delete permanently
          </Btn>
        </>
      )}
      {contactId && contactName && (
        <Link href={`/crm?highlight=${contactId}`}>
          <Btn size="sm" variant="ghost">{contactName}</Btn>
        </Link>
      )}
    </div>
  )
}

function SubmissionCard({
  sub,
  listView,
  expanded,
  onToggleExpand,
  onToggleRead,
  onArchive,
  onRestore,
  onRemove,
  contact,
}: {
  sub: FormSubmission
  listView: ListView
  expanded: boolean
  onToggleExpand: () => void
  onToggleRead: () => void
  onArchive: () => void
  onRestore: () => void
  onRemove: () => void
  contact?: { id: string; name: string }
}) {
  const isArchived = listView === 'archived'

  return (
    <Card className={`space-y-3 ${isArchived ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-serif text-lg text-white truncate">{sub.submitterName}</p>
          <p className="text-sm text-gold">{SITE_LABELS[sub.siteKey] ?? sub.siteKey}</p>
        </div>
        <span
          className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border shrink-0 ${
            sub.status === 'new'
              ? 'text-gold border-gold/40'
              : sub.status === 'archived'
                ? 'text-slate-500 border-slate-700'
                : 'text-slate-400 border-slate-600'
          }`}
        >
          {sub.status}
        </span>
      </div>
      <p className="text-sm text-slate-400 truncate">{sub.submitterEmail}</p>
      <p className="text-sm text-slate-500 line-clamp-2">{messagePreview(sub)}</p>
      <p className="text-xs text-slate-600">{formatDate(sub.createdAt)}</p>
      {expanded && (
        <div className="text-sm text-slate-300 space-y-2 bg-slate-900/50 rounded-xl p-3">
          {Object.entries(sub.fields as Record<string, unknown>).map(([key, value]) => (
            <p key={key}><span className="text-slate-500">{key}: </span>{String(value)}</p>
          ))}
        </div>
      )}
      <SubmissionActions
        sub={sub}
        listView={listView}
        expanded={expanded}
        onToggleExpand={onToggleExpand}
        onToggleRead={onToggleRead}
        onArchive={onArchive}
        onRestore={onRestore}
        onRemove={onRemove}
        contactId={contact?.id}
        contactName={contact?.name}
      />
    </Card>
  )
}

export default function FormSubmissionsPage() {
  const { submissions, loading, refresh, updateStatus, archive, restore, remove } = useFormSubmissions()
  const { contacts } = useContacts()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [siteFilter, setSiteFilter] = useState<string>('all')
  const [listView, setListView] = useState<ListView>('active')
  const [statusFilter, setStatusFilter] = useState<FormSubmissionStatus | 'all'>('all')
  const [refreshing, setRefreshing] = useState(false)

  const sites = useMemo(
    () => Array.from(new Set(submissions.map(s => s.siteKey))).sort(),
    [submissions],
  )

  const activeCount = submissions.filter((s) => s.status !== 'archived').length
  const archivedCount = submissions.filter((s) => s.status === 'archived').length

  const filtered = submissions.filter(s => {
    if (listView === 'active' && s.status === 'archived') return false
    if (listView === 'archived' && s.status !== 'archived') return false
    if (siteFilter !== 'all' && s.siteKey !== siteFilter) return false
    if (listView === 'active' && statusFilter !== 'all' && s.status !== statusFilter) return false
    return true
  })

  const newCount = submissions.filter(s => s.status === 'new').length
  const contactFor = (contactId: string) => contacts.find(c => c.id === contactId)

  const handleRefresh = async () => {
    setRefreshing(true)
    await refresh()
    setRefreshing(false)
  }

  const toggleRead = (sub: FormSubmission) => {
    updateStatus(sub.id, sub.status === 'new' ? 'read' : 'new')
  }

  const handleArchive = (sub: FormSubmission) => {
    if (!confirmArchive(sub)) return
    void archive(sub.id)
  }

  const handleRestore = (sub: FormSubmission) => {
    void restore(sub.id)
  }

  const handleRemove = (sub: FormSubmission) => {
    if (!confirmPermanentDelete(sub)) return
    void remove(sub.id)
  }

  const headerAction = (
    <div className="flex flex-wrap gap-2">
      <Btn size="sm" variant="ghost" onClick={handleRefresh} disabled={refreshing || loading}>
        {refreshing ? 'Refreshing…' : '↻ Refresh'}
      </Btn>
    </div>
  )

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <PageHeader
        title="Form Submissions"
        sub={`${activeCount} active · ${archivedCount} archived · auto-updates every 15s`}
        action={headerAction}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-10 stagger">
        <StatCard label="Active" value={String(activeCount)} />
        <StatCard label="Unread" value={String(newCount)} gold />
        <StatCard label="Archived" value={String(archivedCount)} />
      </div>

      <MobileFilterRow className="mb-3">
        <MobileFilterChip active={listView === 'active'} onClick={() => setListView('active')}>
          Active
        </MobileFilterChip>
        <MobileFilterChip active={listView === 'archived'} onClick={() => setListView('archived')}>
          Archive{archivedCount > 0 ? ` (${archivedCount})` : ''}
        </MobileFilterChip>
      </MobileFilterRow>

      <MobileFilterRow className="mb-3">
        <MobileFilterChip active={siteFilter === 'all'} onClick={() => setSiteFilter('all')}>All sites</MobileFilterChip>
        {sites.map(site => (
          <MobileFilterChip key={site} active={siteFilter === site} onClick={() => setSiteFilter(site)}>
            {SITE_LABELS[site] ?? site.toUpperCase()}
          </MobileFilterChip>
        ))}
      </MobileFilterRow>

      {listView === 'active' && (
        <MobileFilterRow className="mb-6">
          {(['all', 'new', 'read'] as const).map(s => (
            <MobileFilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
              {s === 'all' ? 'All statuses' : s}
            </MobileFilterChip>
          ))}
        </MobileFilterRow>
      )}

      {listView === 'archived' && (
        <p className="mb-6 text-sm text-slate-500">
          Archived leads stay here until you restore them or delete permanently.
        </p>
      )}

      <div className="lg:hidden space-y-3 mb-6">
        {filtered.length === 0 ? (
          <EmptyState message={listView === 'archived' ? 'No archived form submissions.' : 'No form submissions match these filters.'} />
        ) : (
          filtered.map((sub) => (
            <SubmissionCard
              key={sub.id}
              sub={sub}
              listView={listView}
              expanded={expanded === sub.id}
              onToggleExpand={() => setExpanded(expanded === sub.id ? null : sub.id)}
              onToggleRead={() => toggleRead(sub)}
              onArchive={() => handleArchive(sub)}
              onRestore={() => handleRestore(sub)}
              onRemove={() => handleRemove(sub)}
              contact={contactFor(sub.contactId)}
            />
          ))
        )}
      </div>

      <SectionCard className="hidden lg:block">
        <table className="nx-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Site</th>
              <th>Form</th>
              <th>Name</th>
              <th>Email</th>
              <th>Preview</th>
              <th>Client</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(sub => {
              const contact = contactFor(sub.contactId)
              const isArchived = listView === 'archived'
              return (
                <>
                  <tr
                    key={sub.id}
                    className={`group cursor-pointer ${isArchived ? 'opacity-60' : ''}`}
                    onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border ${
                        sub.status === 'new' ? 'text-gold border-gold/40' : 'text-slate-500 border-slate-700'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="text-gold font-medium">{SITE_LABELS[sub.siteKey] ?? sub.siteKey}</td>
                    <td className="text-slate-400">{sub.formName}</td>
                    <td className="text-white font-medium">{sub.submitterName}</td>
                    <td className="text-slate-400">{sub.submitterEmail}</td>
                    <td className="text-slate-500 text-xs max-w-[200px] truncate">{messagePreview(sub)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      {contact ? (
                        <Link href={`/crm?highlight=${contact.id}`} className="text-xs text-gold hover:underline">
                          {contact.name}
                        </Link>
                      ) : (
                        <span className="text-xs text-slate-600">{sub.contactId}</span>
                      )}
                    </td>
                    <td className="text-slate-400 text-xs">{formatDate(sub.createdAt)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div className="flex gap-1 flex-wrap justify-end">
                        {!isArchived && (
                          <>
                            <Btn size="sm" variant="ghost" onClick={() => toggleRead(sub)}>
                              {sub.status === 'new' ? 'Read' : 'New'}
                            </Btn>
                            <Btn size="sm" variant="ghost" onClick={() => handleArchive(sub)}>
                              Move to archive
                            </Btn>
                          </>
                        )}
                        {isArchived && (
                          <>
                            <Btn size="sm" variant="ghost" onClick={() => handleRestore(sub)}>
                              Restore
                            </Btn>
                            <Btn size="sm" variant="danger" onClick={() => handleRemove(sub)}>
                              Delete permanently
                            </Btn>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === sub.id && (
                    <tr key={`${sub.id}-detail`}>
                      <td colSpan={9} className="!pt-0 !pb-4 !border-b-0">
                        <div className="bg-slate-800/30 rounded-lg p-4 space-y-3 text-sm">
                          {sub.pageUrl && (
                            <p className="text-slate-400">
                              Page:{' '}
                              <a href={sub.pageUrl} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                                {sub.pageUrl}
                              </a>
                            </p>
                          )}
                          <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                            {Object.entries(sub.fields as Record<string, unknown>).map(([key, value]) => (
                              <div key={key}>
                                <dt className="text-[10px] uppercase tracking-wider text-slate-500">{key}</dt>
                                <dd className="text-slate-300 whitespace-pre-wrap">{String(value)}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9}>
                  <EmptyState message={listView === 'archived' ? 'No archived form submissions.' : 'No form submissions match these filters.'} />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </SectionCard>
    </div>
  )
}
