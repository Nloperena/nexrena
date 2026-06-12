'use client'
import { useState } from 'react'
import { useLeads, useContacts, genId, formatDate } from '@/lib/store'
import { Lead, LeadStatus } from '@/lib/types'
import { PageHeader, Btn, StatCard, SectionCard, EmptyState, Badge } from '@/components/ui'
import { Card } from '@/components/design-system'
import { MobileFilterChip, MobileFilterRow } from '@/components/mobile-filter-row'

const STATUS_CONFIG: Record<LeadStatus, { label: string; color: string }> = {
  new:       { label: 'New',       color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  contacted: { label: 'Contacted', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  converted: { label: 'Converted', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  lost:      { label: 'Lost',      color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
}

function StatusBadge({ status, onCycle }: { status: LeadStatus; onCycle: () => void }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.new
  return (
    <button onClick={onCycle} title="Click to change status"
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border transition-colors ${cfg.color} hover:brightness-125`}>
      {cfg.label}
    </button>
  )
}

const STATUS_ORDER: LeadStatus[] = ['new', 'contacted', 'converted', 'lost']

export default function LeadsPage() {
  const { leads, updateStatus, remove } = useLeads()
  const { add: addContact } = useContacts()
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState<LeadStatus | 'all'>('all')

  const thisMonth = leads.filter(l => {
    const d = new Date(l.createdAt)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  const newCount = leads.filter(l => l.status === 'new' || !l.status).length
  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter)
  const portalSignups = leads.filter(l => l.source === 'portal-signup').length

  const cycleStatus = (lead: Lead) => {
    const currentIdx = STATUS_ORDER.indexOf(lead.status || 'new')
    const nextStatus = STATUS_ORDER[(currentIdx + 1) % STATUS_ORDER.length]
    updateStatus(lead.id, nextStatus)
  }

  const convertToContact = (lead: Lead) => {
    const now = new Date().toISOString()
    addContact({
      id: genId(),
      name: lead.name,
      company: lead.company || 'Unknown',
      email: lead.email,
      industry: 'other',
      stage: 'lead',
      value: budgetToValue(lead.budget, lead.projectType),
      notes: `Converted from website lead.\n\nOriginal message: ${lead.message}${lead.projectType ? `\nProject type: ${lead.projectType}` : ''}${lead.budget ? `\nBudget: ${lead.budget}` : ''}`,
      createdAt: now,
      updatedAt: now,
    })
    updateStatus(lead.id, 'converted')
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <PageHeader title="Website Leads" sub={`${leads.length} total submissions`} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 stagger">
        <StatCard label="Total Leads" value={String(leads.length)} />
        <StatCard label="Needs Response" value={String(newCount)} gold />
        <StatCard label="This Month" value={String(thisMonth.length)} />
        <StatCard label="Sources" value={String(new Set(leads.map(l => l.source || 'website')).size)} sub={`${portalSignups} portal signups`} />
      </div>

      <MobileFilterRow className="mb-5">
        {(['all', ...STATUS_ORDER] as const).map(s => (
          <MobileFilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
            {s === 'all' ? `All (${leads.length})` : `${STATUS_CONFIG[s].label} (${leads.filter(l => l.status === s || (s === 'new' && !l.status)).length})`}
          </MobileFilterChip>
        ))}
      </MobileFilterRow>

      {/* Mobile cards */}
      <div className="lg:hidden space-y-3">
        {filteredLeads.length === 0 ? (
          <EmptyState message={filter === 'all' ? 'No website leads yet.' : `No leads with status "${filter}".`} />
        ) : (
          filteredLeads.map((lead) => (
            <Card key={lead.id} className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-serif text-lg text-white truncate">{lead.name}</p>
                  <p className="text-sm text-slate-400 truncate">{lead.company || lead.email}</p>
                </div>
                <StatusBadge status={lead.status || 'new'} onCycle={() => cycleStatus(lead)} />
              </div>
              <div className="flex flex-wrap gap-2 text-sm">
                {lead.projectType && <Badge label={lead.projectType} />}
                {lead.budget && <span className="text-gold font-medium">{lead.budget}</span>}
                <span className="text-slate-500">{formatDate(lead.createdAt)}</span>
              </div>
              {expanded === lead.id && (
                <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap bg-slate-900/50 rounded-xl p-3">
                  {lead.message}
                </p>
              )}
              <div className="flex flex-wrap gap-2 pt-1">
                <Btn size="sm" variant="ghost" onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}>
                  {expanded === lead.id ? 'Hide message' : 'View message'}
                </Btn>
                <Btn size="sm" variant="primary" onClick={() => convertToContact(lead)}>→ CRM</Btn>
                <Btn size="sm" variant="danger" onClick={() => remove(lead.id)}>Delete</Btn>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Desktop table */}
      <SectionCard className="hidden lg:block">
        <table className="nx-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Name</th>
              <th>Company</th>
              <th>Email</th>
              <th>Type</th>
              <th>Budget</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map(lead => (
              <>
                <tr key={lead.id} className="group cursor-pointer" onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}>
                  <td onClick={e => e.stopPropagation()}>
                    <StatusBadge status={lead.status || 'new'} onCycle={() => cycleStatus(lead)} />
                  </td>
                  <td className="text-white font-medium">{lead.name}</td>
                  <td className="text-slate-400">{lead.company || '—'}</td>
                  <td className="text-slate-400">{lead.email}</td>
                  <td>{lead.projectType ? <Badge label={lead.projectType} /> : '—'}</td>
                  <td className="text-gold tabular-nums font-medium">{lead.budget || '—'}</td>
                  <td className="text-slate-400 text-xs">{formatDate(lead.createdAt)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Btn size="sm" variant="primary" onClick={() => convertToContact(lead)}>→ CRM</Btn>
                      <Btn size="sm" variant="danger" onClick={() => remove(lead.id)}>Del</Btn>
                    </div>
                  </td>
                </tr>
                {expanded === lead.id && (
                  <tr key={`${lead.id}-msg`}>
                    <td colSpan={8} className="!pt-0 !pb-4 !border-b-0">
                      <div className="bg-slate-800/30 rounded-lg p-4 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                        {lead.message}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {filteredLeads.length === 0 && (
              <tr><td colSpan={8}><EmptyState message={filter === 'all' ? 'No website leads yet. They\'ll appear here when someone submits the contact form on nexrena.com.' : `No leads with status "${filter}".`} /></td></tr>
            )}
          </tbody>
        </table>
      </SectionCard>
    </div>
  )
}

function budgetToValue(budget?: string, projectType?: string): number {
  if (projectType?.startsWith('waas-')) {
    if (budget?.startsWith('8000')) return 8000
    if (budget?.startsWith('5000')) return 5000
    if (budget?.startsWith('3000')) return 3000
    return 3000
  }
  if (!budget) return 0
  if (budget.includes('50k')) return 50000
  if (budget.includes('25k-50k')) return 37500
  if (budget.includes('10k-25k')) return 17500
  return 0
}
