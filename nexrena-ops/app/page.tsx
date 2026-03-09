'use client'
import { useContacts, useProjects, useInvoices, formatCurrency } from '@/lib/store'
import { StatCard, Badge } from '@/components/ui'
import Link from 'next/link'

export default function Dashboard() {
  const { contacts } = useContacts()
  const { projects } = useProjects()
  const { invoices } = useInvoices()

  const pipeline = contacts.filter(c => !['won','lost'].includes(c.stage))
  const pipelineValue = pipeline.reduce((s, c) => s + c.value, 0)
  const wonValue = contacts.filter(c => c.stage === 'won').reduce((s, c) => s + c.value, 0)
  const activeProjects = projects.filter(p => !['delivered','on_hold'].includes(p.status))
  const pendingInvoices = invoices.filter(i => i.status === 'sent')
  const pendingValue = pendingInvoices.reduce((s, i) => s + i.lineItems.reduce((a, l) => a + l.quantity * l.rate, 0), 0)
  const paidValue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + i.lineItems.reduce((a, l) => a + l.quantity * l.rate, 0), 0)

  const stageOrder = ['lead','contacted','discovery','proposal','negotiation','won','lost']

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[11px] text-[#C9A96E] tracking-widest uppercase mb-1">Nexrena Operations</p>
        <h1 className="font-serif text-4xl text-white">Dashboard</h1>
        <p className="text-[#7A8A9E] text-sm mt-1">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Pipeline Value" value={formatCurrency(pipelineValue)} sub={`${pipeline.length} active deals`} gold />
        <StatCard label="Revenue Closed" value={formatCurrency(wonValue)} sub="Won deals" />
        <StatCard label="Pending Invoices" value={formatCurrency(pendingValue)} sub={`${pendingInvoices.length} awaiting payment`} />
        <StatCard label="Total Collected" value={formatCurrency(paidValue)} sub="Paid invoices" />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Pipeline snapshot */}
        <div className="col-span-2 bg-[#0C0F12] border border-[#1E2530] rounded-lg overflow-hidden">
          <div className="px-5 py-4 border-b border-[#1E2530] flex items-center justify-between">
            <h2 className="font-serif text-base text-white">Pipeline</h2>
            <Link href="/crm" className="text-xs text-[#C9A96E] hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-[#1E2530]">
            {contacts.slice(0, 5).map(c => (
              <div key={c.id} className="px-5 py-3 flex items-center gap-4 hover:bg-[#1E2530]/30 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{c.name}</p>
                  <p className="text-xs text-[#7A8A9E] truncate">{c.company}</p>
                </div>
                <Badge label={c.stage} />
                <p className="text-sm text-[#C9A96E] font-medium w-20 text-right">{formatCurrency(c.value)}</p>
              </div>
            ))}
            {contacts.length === 0 && (
              <div className="px-5 py-8 text-center text-sm text-[#3D4A5C]">No contacts yet. <Link href="/crm" className="text-[#C9A96E]">Add your first lead →</Link></div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Active projects */}
          <div className="bg-[#0C0F12] border border-[#1E2530] rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1E2530] flex items-center justify-between">
              <h2 className="font-serif text-base text-white">Active Projects</h2>
              <Link href="/projects" className="text-xs text-[#C9A96E] hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-[#1E2530]">
              {activeProjects.slice(0, 4).map(p => {
                const done = p.phases.flatMap(ph => ph.tasks).filter(t => t.status === 'done').length
                const total = p.phases.flatMap(ph => ph.tasks).length
                const pct = total > 0 ? Math.round(done/total*100) : 0
                return (
                  <div key={p.id} className="px-5 py-3">
                    <p className="text-sm text-white font-medium truncate">{p.clientName}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 bg-[#1E2530] rounded-full h-1">
                        <div className="bg-[#C9A96E] h-1 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] text-[#7A8A9E]">{pct}%</span>
                    </div>
                  </div>
                )
              })}
              {activeProjects.length === 0 && (
                <div className="px-5 py-6 text-center text-xs text-[#3D4A5C]">No active projects</div>
              )}
            </div>
          </div>

          {/* Invoices */}
          <div className="bg-[#0C0F12] border border-[#1E2530] rounded-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1E2530] flex items-center justify-between">
              <h2 className="font-serif text-base text-white">Recent Invoices</h2>
              <Link href="/invoices" className="text-xs text-[#C9A96E] hover:underline">View all →</Link>
            </div>
            <div className="divide-y divide-[#1E2530]">
              {invoices.slice(0, 4).map(inv => {
                const total = inv.lineItems.reduce((s, l) => s + l.quantity * l.rate, 0)
                return (
                  <div key={inv.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs text-[#7A8A9E]">{inv.number}</p>
                      <p className="text-sm text-white truncate">{inv.clientName}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm text-white">{formatCurrency(total)}</p>
                      <Badge label={inv.status} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline stage funnel */}
      <div className="mt-6 bg-[#0C0F12] border border-[#1E2530] rounded-lg p-5">
        <h2 className="font-serif text-base text-white mb-4">Pipeline by Stage</h2>
        <div className="grid grid-cols-7 gap-2">
          {stageOrder.map(stage => {
            const count = contacts.filter(c => c.stage === stage).length
            const val = contacts.filter(c => c.stage === stage).reduce((s, c) => s + c.value, 0)
            return (
              <div key={stage} className="text-center">
                <div className={`rounded py-3 px-2 mb-2 ${count > 0 ? 'bg-[#1E2530]' : 'bg-[#0C0F12] border border-[#1E2530]'}`}>
                  <p className={`text-2xl font-serif font-bold ${count > 0 ? 'text-[#C9A96E]' : 'text-[#2C3444]'}`}>{count}</p>
                </div>
                <p className="text-[10px] text-[#7A8A9E] capitalize">{stage}</p>
                {val > 0 && <p className="text-[10px] text-[#3D4A5C]">{formatCurrency(val)}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
