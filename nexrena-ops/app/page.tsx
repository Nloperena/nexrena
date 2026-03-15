'use client'
import { useContacts, useProjects, useInvoices, useLeads, useProposals, useExpenses, formatCurrency, formatDate, invoiceTotal } from '@/lib/store'
import { StatCard, Badge, SectionCard, SectionHeader, EmptyState, LinkBtn } from '@/components/ui'
import Link from 'next/link'

export default function Dashboard() {
  const { contacts } = useContacts()
  const { projects } = useProjects()
  const { invoices } = useInvoices()
  const { leads } = useLeads()
  const { proposals } = useProposals()
  const { expenses } = useExpenses()

  const newLeads = leads.filter(l => l.status === 'new')
  const pendingProposals = proposals.filter(p => p.status === 'sent')
  const activeProjects = projects.filter(p => !['delivered', 'on_hold'].includes(p.status))
  const outstandingInvoices = invoices.filter(i => i.status === 'sent')
  const outstandingValue = outstandingInvoices.reduce((s, i) => s + invoiceTotal(i), 0)
  const paidValue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + invoiceTotal(i), 0)
  const pipelineContacts = contacts.filter(c => !['won', 'lost'].includes(c.stage))

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const monthExpenses = expenses.filter(e => new Date(e.date) >= monthStart).reduce((s, e) => s + e.amount, 0)

  const needsAttentionCount = newLeads.length + pendingProposals.length + outstandingInvoices.length

  return (
    <div>
      <div className="mb-10 animate-fade-in-up">
        <p className="text-[10px] text-gold tracking-[0.2em] uppercase mb-2 font-medium">Nexrena Operations</p>
        <h1 className="font-serif text-4xl text-white tracking-tight">Today</h1>
        <p className="text-slate-400 text-sm mt-1.5">
          {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          {needsAttentionCount > 0 && (
            <span className="text-gold ml-3 font-medium">{needsAttentionCount} item{needsAttentionCount !== 1 ? 's' : ''} need attention</span>
          )}
        </p>
        <div className="gold-rule mt-6 opacity-60" />
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
        <LinkBtn href="/leads" variant="ghost" size="sm">Convert a Lead</LinkBtn>
        <LinkBtn href="/proposals" variant="ghost" size="sm">Create Proposal</LinkBtn>
        <LinkBtn href="/invoices" variant="ghost" size="sm">Create Invoice</LinkBtn>
        <LinkBtn href="/projects" variant="ghost" size="sm">New Project</LinkBtn>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-4 gap-4 mb-8 stagger">
        <StatCard label="Pipeline" value={formatCurrency(pipelineContacts.reduce((s, c) => s + c.value, 0))} sub={`${pipelineContacts.length} active deals`} gold />
        <StatCard label="Collected" value={formatCurrency(paidValue)} sub="Paid invoices" />
        <StatCard label="Outstanding" value={formatCurrency(outstandingValue)} sub={`${outstandingInvoices.length} unpaid`} />
        <StatCard label="MTD Expenses" value={formatCurrency(monthExpenses)} sub={<Link href="/expenses" className="text-gold hover:text-gold-light transition-colors">View expenses →</Link>} />
      </div>

      {/* Main content: Needs Attention + Active Projects + Outstanding Invoices */}
      <div className="grid grid-cols-3 gap-6">

        {/* Needs Attention */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <SectionCard>
            <SectionHeader title="Needs Attention" />
            <div className="divide-y divide-slate-800/60">
              {newLeads.length === 0 && pendingProposals.length === 0 && (
                <div className="px-5 py-8 text-center text-xs text-slate-600">All clear — nothing pending</div>
              )}

              {newLeads.map(lead => (
                <Link key={lead.id} href="/leads" className="block px-5 py-3.5 hover:bg-slate-800/20 transition-all duration-200 group">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate group-hover:text-gold transition-colors">{lead.name}</p>
                      <p className="text-xs text-slate-600 truncate">{lead.company || lead.email}</p>
                    </div>
                    <Badge label="new" />
                  </div>
                  <p className="text-[10px] text-gold mt-1.5 font-medium">Convert to CRM →</p>
                </Link>
              ))}

              {pendingProposals.map(p => (
                <Link key={p.id} href="/proposals" className="block px-5 py-3.5 hover:bg-slate-800/20 transition-all duration-200 group">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium truncate group-hover:text-gold transition-colors">{p.clientName}</p>
                      <p className="text-xs text-slate-600 truncate">{p.title}</p>
                    </div>
                    <Badge label="sent" />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5">Proposal awaiting response</p>
                </Link>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Active Projects */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <SectionCard>
            <SectionHeader
              title="Active Projects"
              action={<Link href="/projects" className="text-xs text-gold hover:text-gold-light transition-colors">View all →</Link>}
            />
            <div className="divide-y divide-slate-800/60">
              {activeProjects.slice(0, 6).map(p => {
                const done = p.phases.flatMap(ph => ph.tasks).filter(t => t.status === 'done').length
                const total = p.phases.flatMap(ph => ph.tasks).length
                const pct = total > 0 ? Math.round(done / total * 100) : 0
                return (
                  <Link key={p.id} href="/projects" className="block px-5 py-3.5 group hover:bg-slate-800/20 transition-all duration-200">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-white font-medium truncate group-hover:text-gold transition-colors">{p.clientName}</p>
                      <Badge label={p.status} />
                    </div>
                    <div className="flex items-center gap-2.5 mt-2">
                      <div className="flex-1 bg-slate-800/80 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-gold-dim to-gold h-1.5 rounded-full transition-all duration-700 ease-out" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-slate-400 tabular-nums w-7 text-right">{pct}%</span>
                    </div>
                  </Link>
                )
              })}
              {activeProjects.length === 0 && (
                <EmptyState message="No active projects" action={() => window.location.href = '/projects'} actionLabel="Create a project" />
              )}
            </div>
          </SectionCard>
        </div>

        {/* Outstanding Invoices */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          <SectionCard>
            <SectionHeader
              title="Outstanding Invoices"
              action={<Link href="/invoices" className="text-xs text-gold hover:text-gold-light transition-colors">View all →</Link>}
            />
            <div className="divide-y divide-slate-800/60">
              {outstandingInvoices.map(inv => {
                const total = invoiceTotal(inv)
                return (
                  <Link key={inv.id} href="/invoices" className="block px-5 py-3.5 hover:bg-slate-800/20 transition-all duration-200 group">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] text-slate-400 font-mono">{inv.number}</p>
                        <p className="text-sm text-white truncate group-hover:text-gold transition-colors">{inv.clientName}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm text-white tabular-nums">{formatCurrency(total)}</p>
                        <p className="text-[10px] text-slate-500">Due {formatDate(inv.dueDate)}</p>
                      </div>
                    </div>
                  </Link>
                )
              })}
              {outstandingInvoices.length === 0 && (
                <div className="px-5 py-8 text-center text-xs text-slate-600">No outstanding invoices</div>
              )}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Pipeline snapshot — compact */}
      <div className="mt-8 animate-fade-in-up" style={{ animationDelay: '0.25s' }}>
        <SectionCard>
          <SectionHeader
            title="Pipeline"
            action={<Link href="/crm" className="text-xs text-gold hover:text-gold-light transition-colors">Manage pipeline →</Link>}
          />
          <div className="divide-y divide-slate-800/60">
            {contacts.filter(c => !['won', 'lost'].includes(c.stage)).slice(0, 5).map(c => (
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
            {pipelineContacts.length === 0 && (
              <div className="px-5 py-8 text-center text-xs text-slate-600">No active pipeline deals</div>
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}
