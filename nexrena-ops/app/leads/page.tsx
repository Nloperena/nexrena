'use client'
import { useState } from 'react'
import { useLeads, useContacts, genId, formatDate } from '@/lib/store'
import { Lead, LeadStatus } from '@/lib/types'
import { PageHeader, Btn, StatCard, SectionCard, EmptyState, Badge } from '@/components/ui'

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
      value: budgetToValue(lead.budget),
      notes: `Converted from website lead.\n\nOriginal message: ${lead.message}${lead.projectType ? `\nProject type: ${lead.projectType}` : ''}${lead.budget ? `\nBudget: ${lead.budget}` : ''}`,
      createdAt: now,
      updatedAt: now,
    })
    updateStatus(lead.id, 'converted')
  }

  return (
    <div>
      <PageHeader title="Website Leads" sub={`${leads.length} total submissions`} />

      <div className="grid grid-cols-4 gap-4 mb-10 stagger">
        <StatCard label="Total Leads" value={String(leads.length)} />
        <StatCard label="Needs Response" value={String(newCount)} gold />
        <StatCard label="This Month" value={String(thisMonth.length)} />
        <StatCard label="Sources" value="Website" sub="nexrena.com/contact" />
      </div>

      <div className="flex gap-2 mb-4">
        {(['all', ...STATUS_ORDER] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded text-xs font-semibold uppercase transition-all duration-200 ${
              filter === s ? 'bg-gold text-obsidian' : 'text-slate-400 hover:text-white hover:bg-slate-800/40 border border-slate-700/40'
            }`}>
            {s === 'all' ? `All (${leads.length})` : `${STATUS_CONFIG[s].label} (${leads.filter(l => l.status === s || (s === 'new' && !l.status)).length})`}
          </button>
        ))}
      </div>

      <SectionCard>
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

function budgetToValue(budget?: string): number {
  if (!budget) return 0
  if (budget.includes('50k')) return 50000
  if (budget.includes('25k-50k')) return 37500
  if (budget.includes('10k-25k')) return 17500
  return 0
}
