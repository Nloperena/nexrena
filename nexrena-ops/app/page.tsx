'use client'
import { useContacts, useProjects, useInvoices, useLeads, useTimeEntries, useExpenses, useProposals, formatCurrency, formatDate, invoiceTotal } from '@/lib/store'
import { StatCard, Badge, SectionCard, SectionHeader, EmptyState } from '@/components/ui'
import Link from 'next/link'

export default function Dashboard() {
  const { contacts } = useContacts()
  const { projects } = useProjects()
  const { invoices } = useInvoices()
  const { leads } = useLeads()
  const { entries } = useTimeEntries()
  const { expenses } = useExpenses()
  const { proposals } = useProposals()

  const pipeline = contacts.filter(c => !['won', 'lost'].includes(c.stage))
  const pipelineValue = pipeline.reduce((s, c) => s + c.value, 0)
  const wonValue = contacts.filter(c => c.stage === 'won').reduce((s, c) => s + c.value, 0)
  const activeProjects = projects.filter(p => !['delivered', 'on_hold'].includes(p.status))
  const pendingInvoices = invoices.filter(i => i.status === 'sent')
  const pendingValue = pendingInvoices.reduce((s, i) => s + invoiceTotal(i), 0)
  const paidValue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + invoiceTotal(i), 0)

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthHours = entries.filter(e => new Date(e.date) >= monthStart).reduce((s, e) => s + e.hours, 0)
  const monthExpenses = expenses.filter(e => new Date(e.date) >= monthStart).reduce((s, e) => s + e.amount, 0)
  const pendingProposals = proposals.filter(p => p.status === 'sent')

  const stageOrder = ['lead', 'contacted', 'discovery', 'proposal', 'negotiation', 'won', 'lost']
  const maxStageCount = Math.max(...stageOrder.map(s => contacts.filter(c => c.stage === s).length), 1)

  return (
    <div>
      <div className="mb-10 animate-fade-in-up">
        <p className="text-[10px] text-gold tracking-[0.2em] uppercase mb-2 font-medium">Nexrena Operations</p>
        <h1 className="font-serif text-4xl text-white tracking-tight">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        <div className="gold-rule mt-6 opacity-60" />
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4 stagger">
        <StatCard label="Pipeline Value" value={formatCurrency(pipelineValue)} sub={`${pipeline.length} active deals`} gold />
        <StatCard label="Revenue Closed" value={formatCurrency(wonValue)} sub="Won deals" />
        <StatCard label="Outstanding" value={formatCurrency(pendingValue)} sub={`${pendingInvoices.length} invoices`} />
        <StatCard label="Total Collected" value={formatCurrency(paidValue)} sub="Paid invoices" />
      </div>
      <div className="grid grid-cols-4 gap-4 mb-10 stagger">
        <StatCard label="Hours This Month" value={monthHours.toFixed(1)} sub={<Link href="/time" className="text-gold hover:text-gold-light transition-colors">View time →</Link>} />
        <StatCard label="MTD Expenses" value={formatCurrency(monthExpenses)} sub={<Link href="/expenses" className="text-gold hover:text-gold-light transition-colors">View expenses →</Link>} />
        <StatCard label="Pending Proposals" value={String(pendingProposals.length)} sub={<Link href="/proposals" className="text-gold hover:text-gold-light transition-colors">View proposals →</Link>} />
        <StatCard label="Website Leads" value={String(leads.length)} sub={<Link href="/leads" className="text-gold hover:text-gold-light transition-colors">View leads →</Link>} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <SectionCard>
            <SectionHeader
              title="Pipeline"
              action={<Link href="/crm" className="text-xs text-gold hover:text-gold-light transition-colors">View all →</Link>}
            />
            <div className="divide-y divide-slate-800/60">
              {contacts.slice(0, 5).map(c => (
                <div key={c.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-800/20 transition-all duration-200 group">
                  <div className="w-8 h-8 rounded-full bg-slate-800/50 border border-slate-700/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">{c.name.split(' ').map(n => n[0]).join('')}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-medium truncate group-hover:text-gold transition-colors">{c.name}</p>
                    <p className="text-xs text-slate-600 truncate">{c.company}</p>
                  </div>
                  <Badge label={c.stage} />
                  <p className="text-sm text-gold font-medium w-24 text-right tabular-nums">{formatCurrency(c.value)}</p>
                </div>
              ))}
              {contacts.length === 0 && (
                <EmptyState message="No contacts yet." action={() => {}} actionLabel="Add your first lead" />
              )}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-5 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <SectionCard>
            <SectionHeader
              title="Active Projects"
              action={<Link href="/projects" className="text-xs text-gold hover:text-gold-light transition-colors">View all →</Link>}
            />
            <div className="divide-y divide-slate-800/60">
              {activeProjects.slice(0, 4).map(p => {
                const done = p.phases.flatMap(ph => ph.tasks).filter(t => t.status === 'done').length
                const total = p.phases.flatMap(ph => ph.tasks).length
                const pct = total > 0 ? Math.round(done / total * 100) : 0
                return (
                  <div key={p.id} className="px-5 py-3.5 group hover:bg-slate-800/20 transition-all duration-200">
                    <p className="text-sm text-white font-medium truncate group-hover:text-gold transition-colors">{p.clientName}</p>
                    <div className="flex items-center gap-2.5 mt-2">
                      <div className="flex-1 bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-gold-dim to-gold h-1.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 tabular-nums w-7 text-right">{pct}%</span>
                    </div>
                  </div>
                )
              })}
              {activeProjects.length === 0 && (
                <div className="px-5 py-8 text-center text-xs text-slate-600">No active projects</div>
              )}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              title="Recent Invoices"
              action={<Link href="/invoices" className="text-xs text-gold hover:text-gold-light transition-colors">View all →</Link>}
            />
            <div className="divide-y divide-slate-800/60">
              {invoices.slice(0, 4).map(inv => {
                const total = invoiceTotal(inv)
                return (
                  <div key={inv.id} className="px-5 py-3.5 flex items-center justify-between gap-3 hover:bg-slate-800/20 transition-all duration-200 group">
                    <div className="min-w-0">
                      <p className="text-[11px] text-slate-400 font-mono">{inv.number}</p>
                      <p className="text-sm text-white truncate group-hover:text-gold transition-colors">{inv.clientName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm text-white tabular-nums">{formatCurrency(total)}</p>
                      <Badge label={inv.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard>
            <SectionHeader
              title="Website Leads"
              action={<Link href="/leads" className="text-xs text-gold hover:text-gold-light transition-colors">View all →</Link>}
            />
            <div className="divide-y divide-slate-800/60">
              {leads.slice(0, 3).map(lead => (
                <div key={lead.id} className="px-5 py-3.5 hover:bg-slate-800/20 transition-all duration-200 group">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white font-medium truncate group-hover:text-gold transition-colors">{lead.name}</p>
                    <p className="text-[10px] text-slate-500 tabular-nums shrink-0">{formatDate(lead.createdAt)}</p>
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{lead.company || lead.email}</p>
                </div>
              ))}
              {leads.length === 0 && (
                <div className="px-5 py-8 text-center text-xs text-slate-600">No leads yet</div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
        <SectionCard className="p-6">
          <h2 className="font-serif text-base text-white mb-5">Pipeline by Stage</h2>
          <div className="grid grid-cols-7 gap-3">
            {stageOrder.map(stage => {
              const count = contacts.filter(c => c.stage === stage).length
              const val = contacts.filter(c => c.stage === stage).reduce((s, c) => s + c.value, 0)
              const barHeight = maxStageCount > 0 ? Math.max((count / maxStageCount) * 48, count > 0 ? 8 : 0) : 0
              return (
                <div key={stage} className="text-center group">
                  <div className="flex flex-col items-center justify-end h-16 mb-3">
                    <div
                      className={`w-full max-w-[48px] rounded-t transition-all duration-500 ${count > 0 ? 'bg-gradient-to-t from-gold-dim/40 to-gold/60' : ''}`}
                      style={{ height: barHeight }}
                    />
                  </div>
                  <p className={`text-xl font-serif font-bold transition-colors ${count > 0 ? 'text-gold' : 'text-slate-700'}`}>{count}</p>
                  <p className="text-[10px] text-slate-400 capitalize mt-1 font-medium">{stage}</p>
                  {val > 0 && <p className="text-[10px] text-slate-600 mt-0.5 tabular-nums">{formatCurrency(val)}</p>}
                </div>
              )
            })}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
