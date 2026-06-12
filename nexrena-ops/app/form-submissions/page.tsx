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

function messagePreview(sub: FormSubmission): string {
  const fields = sub.fields as Record<string, unknown>
  const msg = typeof fields.message === 'string' ? fields.message : ''
  return msg.length > 120 ? `${msg.slice(0, 120)}…` : msg
}

export default function FormSubmissionsPage() {
  const { submissions, updateStatus, remove } = useFormSubmissions()
  const { contacts } = useContacts()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [siteFilter, setSiteFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<FormSubmissionStatus | 'all'>('all')

  const sites = useMemo(
    () => Array.from(new Set(submissions.map(s => s.siteKey))).sort(),
    [submissions],
  )

  const filtered = submissions.filter(s => {
    if (siteFilter !== 'all' && s.siteKey !== siteFilter) return false
    if (statusFilter !== 'all' && s.status !== statusFilter) return false
    return true
  })

  const newCount = submissions.filter(s => s.status === 'new').length

  const contactFor = (contactId: string) => contacts.find(c => c.id === contactId)

  const toggleRead = (sub: FormSubmission) => {
    updateStatus(sub.id, sub.status === 'new' ? 'read' : 'new')
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <PageHeader
        title="Form Submissions"
        sub={`${submissions.length} submissions from client websites`}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-10 stagger">
        <StatCard label="Total" value={String(submissions.length)} />
        <StatCard label="Unread" value={String(newCount)} gold />
        <StatCard label="Sites" value={String(sites.length)} />
      </div>

      <MobileFilterRow className="mb-3">
        <MobileFilterChip active={siteFilter === 'all'} onClick={() => setSiteFilter('all')}>All sites</MobileFilterChip>
        {sites.map(site => (
          <MobileFilterChip key={site} active={siteFilter === site} onClick={() => setSiteFilter(site)}>
            {SITE_LABELS[site] ?? site.toUpperCase()}
          </MobileFilterChip>
        ))}
      </MobileFilterRow>

      <MobileFilterRow className="mb-6">
        {(['all', 'new', 'read'] as const).map(s => (
          <MobileFilterChip key={s} active={statusFilter === s} onClick={() => setStatusFilter(s)}>
            {s === 'all' ? 'Any status' : s}
          </MobileFilterChip>
        ))}
      </MobileFilterRow>

      <div className="lg:hidden space-y-3 mb-6">
        {filtered.length === 0 ? (
          <EmptyState message="No form submissions yet." />
        ) : (
          filtered.map((sub) => {
            const contact = contactFor(sub.contactId)
            return (
              <Card key={sub.id} className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-serif text-lg text-white truncate">{sub.submitterName}</p>
                    <p className="text-sm text-gold">{SITE_LABELS[sub.siteKey] ?? sub.siteKey}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleRead(sub)}
                    className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded border shrink-0 ${
                      sub.status === 'new' ? 'text-gold border-gold/40' : 'text-slate-500 border-slate-700'
                    }`}
                  >
                    {sub.status}
                  </button>
                </div>
                <p className="text-sm text-slate-400 truncate">{sub.submitterEmail}</p>
                <p className="text-sm text-slate-500 line-clamp-2">{messagePreview(sub)}</p>
                <p className="text-xs text-slate-600">{formatDate(sub.createdAt)}</p>
                {expanded === sub.id && (
                  <div className="text-sm text-slate-300 space-y-2 bg-slate-900/50 rounded-xl p-3">
                    {Object.entries(sub.fields as Record<string, unknown>).map(([key, value]) => (
                      <p key={key}><span className="text-slate-500">{key}: </span>{String(value)}</p>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  <Btn size="sm" variant="ghost" onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}>
                    {expanded === sub.id ? 'Less' : 'Details'}
                  </Btn>
                  {contact && (
                    <Link href={`/crm?highlight=${contact.id}`}>
                      <Btn size="sm" variant="ghost">{contact.name}</Btn>
                    </Link>
                  )}
                  <Btn size="sm" variant="danger" onClick={() => remove(sub.id)}>Delete</Btn>
                </div>
              </Card>
            )
          })
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
              return (
                <>
                  <tr
                    key={sub.id}
                    className="group cursor-pointer"
                    onClick={() => setExpanded(expanded === sub.id ? null : sub.id)}
                  >
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => toggleRead(sub)}
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded border transition-colors ${
                          sub.status === 'new'
                            ? 'text-gold border-gold/40 hover:bg-gold/10'
                            : 'text-slate-500 border-slate-700 hover:text-slate-300'
                        }`}
                      >
                        {sub.status}
                      </button>
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
                      <Btn size="sm" variant="danger" onClick={() => remove(sub.id)}>Del</Btn>
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
                  <EmptyState message="No form submissions yet. Client website forms (e.g. TTAG) will appear here." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </SectionCard>
    </div>
  )
}
