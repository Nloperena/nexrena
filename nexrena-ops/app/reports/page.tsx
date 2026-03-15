'use client'
import { useState } from 'react'
import { useInvoices, useExpenses, useProjects, useContacts, formatCurrency, invoiceTotal } from '@/lib/store'
import { PageHeader, StatCard, SectionCard, SectionHeader } from '@/components/ui'

function BarChart({ data, maxVal }: { data: { label: string; value: number; color?: string }[]; maxVal: number }) {
  return (
    <div className="space-y-3">
      {data.map(d => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="text-xs text-slate-400 w-16 text-right shrink-0 tabular-nums">{d.label}</span>
          <div className="flex-1 bg-slate-800/60 rounded-full h-5 overflow-hidden">
            <div className={`h-5 rounded-full transition-all duration-700 ease-out ${d.color ?? 'bg-gradient-to-r from-gold-dim to-gold'}`}
              style={{ width: maxVal > 0 ? `${Math.max((d.value / maxVal) * 100, d.value > 0 ? 4 : 0)}%` : '0%' }} />
          </div>
          <span className="text-sm text-white font-medium tabular-nums w-24 text-right">{formatCurrency(d.value)}</span>
        </div>
      ))}
    </div>
  )
}

export default function ReportsPage() {
  const { invoices } = useInvoices()
  const { expenses } = useExpenses()
  const { projects } = useProjects()
  const { contacts } = useContacts()
  const [period, setPeriod] = useState<'ytd' | '12mo' | 'all'>('ytd')

  const now = new Date()
  const yearStart = new Date(now.getFullYear(), 0, 1)
  const twelveMonthsAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())

  const periodStart = period === 'ytd' ? yearStart : period === '12mo' ? twelveMonthsAgo : new Date(2000, 0, 1)

  const paidInvoices = invoices.filter(i => i.status === 'paid' && i.paidDate && new Date(i.paidDate) >= periodStart)
  const revenue = paidInvoices.reduce((s, i) => s + invoiceTotal(i), 0)
  const outstanding = invoices
    .filter(i => ['sent', 'overdue'].includes(i.status))
    .reduce((s, i) => s + invoiceTotal(i), 0)
  const totalExpenses = expenses.filter(e => new Date(e.date) >= periodStart).reduce((s, e) => s + e.amount, 0)
  const profit = revenue - totalExpenses
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const revenueByMonth = monthNames.map((label, i) => {
    const monthRevenue = paidInvoices
      .filter(inv => { const d = new Date(inv.paidDate!); return d.getMonth() === i && d.getFullYear() === now.getFullYear() })
      .reduce((s, inv) => s + invoiceTotal(inv), 0)
    return { label, value: monthRevenue }
  }).filter((_, i) => i <= now.getMonth())
  const maxMonthRevenue = Math.max(...revenueByMonth.map(d => d.value), 1)

  const projectProfitability = projects.slice(0, 8).map(p => {
    const projRevenue = invoices.filter(i => i.projectId === p.id && i.status === 'paid').reduce((s, i) => s + invoiceTotal(i), 0)
    const projExpenses = expenses.filter(e => e.projectId === p.id).reduce((s, e) => s + e.amount, 0)
    return { name: `${p.clientName}`, revenue: projRevenue, expenses: projExpenses, profit: projRevenue - projExpenses }
  })

  const clientRevenue = contacts.filter(c => c.stage === 'won').map(c => {
    const clientInvoices = invoices.filter(i => i.contactId === c.id && i.status === 'paid')
    return { label: c.company, value: clientInvoices.reduce((s, i) => s + invoiceTotal(i), 0) }
  }).filter(c => c.value > 0).sort((a, b) => b.value - a.value).slice(0, 6)
  const maxClientRevenue = Math.max(...clientRevenue.map(d => d.value), 1)

  const expenseByCategory = [
    { label: 'Software', value: expenses.filter(e => e.category === 'software' && new Date(e.date) >= periodStart).reduce((s, e) => s + e.amount, 0) },
    { label: 'Contract', value: expenses.filter(e => e.category === 'contractors' && new Date(e.date) >= periodStart).reduce((s, e) => s + e.amount, 0) },
    { label: 'Hosting', value: expenses.filter(e => e.category === 'hosting' && new Date(e.date) >= periodStart).reduce((s, e) => s + e.amount, 0) },
    { label: 'Marketing', value: expenses.filter(e => e.category === 'marketing' && new Date(e.date) >= periodStart).reduce((s, e) => s + e.amount, 0) },
    { label: 'Office', value: expenses.filter(e => e.category === 'office' && new Date(e.date) >= periodStart).reduce((s, e) => s + e.amount, 0) },
    { label: 'Other', value: expenses.filter(e => e.category === 'other' && new Date(e.date) >= periodStart).reduce((s, e) => s + e.amount, 0) },
  ].filter(d => d.value > 0)
  const maxExpCat = Math.max(...expenseByCategory.map(d => d.value), 1)

  return (
    <div>
      <PageHeader title="Reports" sub="Revenue, profitability, and utilization analytics"
        action={
          <div className="flex rounded-lg overflow-hidden border border-slate-700/50">
            {(['ytd', '12mo', 'all'] as const).map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-4 py-2.5 text-xs font-semibold uppercase transition-all duration-200 ${
                  period === p ? 'bg-gold text-obsidian' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                }`}>{p === 'ytd' ? 'YTD' : p === '12mo' ? '12 Mo' : 'All'}</button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-4 gap-4 mb-10 stagger">
        <StatCard label="Revenue" value={formatCurrency(revenue)} gold />
        <StatCard label="Expenses" value={formatCurrency(totalExpenses)} />
        <StatCard label="Net Profit" value={formatCurrency(profit)} sub={`${margin}% margin`} />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} sub="Unpaid invoices" />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <SectionCard className="p-6 animate-fade-in-up">
          <h3 className="font-serif text-base text-white mb-5">Monthly Revenue ({now.getFullYear()})</h3>
          <BarChart data={revenueByMonth} maxVal={maxMonthRevenue} />
        </SectionCard>

        <SectionCard className="p-6 animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <h3 className="font-serif text-base text-white mb-5">Expenses by Category</h3>
          {expenseByCategory.length > 0 ? (
            <BarChart data={expenseByCategory} maxVal={maxExpCat} />
          ) : (
            <p className="text-sm text-slate-600 py-8 text-center">No expenses in this period</p>
          )}
        </SectionCard>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <SectionCard className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <SectionHeader title="Project Profitability" />
          <table className="nx-table">
            <thead><tr><th>Client</th><th className="text-right">Revenue</th><th className="text-right">Costs</th><th className="text-right">Profit</th></tr></thead>
            <tbody>
              {projectProfitability.map(p => (
                <tr key={p.name}>
                  <td className="text-white font-medium">{p.name}</td>
                  <td className="text-right tabular-nums text-gold">{formatCurrency(p.revenue)}</td>
                  <td className="text-right tabular-nums text-slate-400">{formatCurrency(p.expenses)}</td>
                  <td className={`text-right tabular-nums font-medium ${p.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(p.profit)}
                  </td>
                </tr>
              ))}
              {projectProfitability.length === 0 && (
                <tr><td colSpan={4} className="text-center text-slate-600 py-8">No projects yet</td></tr>
              )}
            </tbody>
          </table>
        </SectionCard>

        <SectionCard className="p-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <h3 className="font-serif text-base text-white mb-5">Revenue by Client</h3>
          {clientRevenue.length > 0 ? (
            <BarChart data={clientRevenue} maxVal={maxClientRevenue} />
          ) : (
            <p className="text-sm text-slate-600 py-8 text-center">No client revenue data yet</p>
          )}
        </SectionCard>
      </div>
    </div>
  )
}

