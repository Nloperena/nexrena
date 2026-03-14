'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useInvoices, useContacts, genId, formatCurrency, formatDate, nextInvoiceNumber, invoiceTotal } from '@/lib/store'
import { Invoice, InvoiceStatus } from '@/lib/types'
import { PageHeader, Badge, Btn, Modal, StatCard, SectionCard, EmptyState } from '@/components/ui'
import { InvoiceForm } from '@/components/invoice-form'

const STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled']

export default function InvoicesPage() {
  const { invoices, add, edit, remove } = useInvoices()
  const { contacts } = useContacts()
  const [modal, setModal] = useState<null | 'add' | Invoice>(null)
  const [filter, setFilter] = useState<'all' | InvoiceStatus>('all')
  const [search, setSearch] = useState('')

  const getTotal = (inv: Invoice) => invoiceTotal(inv)
  const isOverdue = (inv: Invoice) => inv.status === 'sent' && new Date(inv.dueDate) < new Date()
  const effectiveStatus = (inv: Invoice): InvoiceStatus => isOverdue(inv) ? 'overdue' : inv.status

  const now = new Date()
  const mtdStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const totalOutstanding = invoices
    .filter(i => ['sent', 'overdue'].includes(i.status) || isOverdue(i))
    .reduce((s, i) => s + getTotal(i), 0)
  const paidMTD = invoices
    .filter(i => i.status === 'paid' && i.paidDate && new Date(i.paidDate) >= mtdStart)
    .reduce((s, i) => s + getTotal(i), 0)
  const overdueCount = invoices.filter(i => i.status === 'overdue' || isOverdue(i)).length

  const filtered = invoices
    .filter(i => filter === 'all' ? true : effectiveStatus(i) === filter)
    .filter(i => {
      if (!search) return true
      const q = search.toLowerCase()
      return (
        i.clientName.toLowerCase().includes(q) ||
        (i.clientCompany ?? '').toLowerCase().includes(q) ||
        (i.projectName ?? '').toLowerCase().includes(q) ||
        i.number.toLowerCase().includes(q)
      )
    })

  const nextNum = nextInvoiceNumber(invoices)

  const handleDuplicate = (inv: Invoice) => {
    const dup: Invoice = {
      ...inv,
      id: genId(),
      number: nextInvoiceNumber(invoices),
      status: 'draft',
      paidDate: undefined,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 15 * 86400000).toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      lineItems: inv.lineItems.map(l => ({ ...l, id: genId() })),
    }
    add(dup)
  }

  const handleMarkPaid = (inv: Invoice) => {
    edit({ ...inv, status: 'paid', paidDate: new Date().toISOString().slice(0, 10) })
  }

  const statusCount = (s: InvoiceStatus) =>
    invoices.filter(i => effectiveStatus(i) === s).length

  return (
    <div>
      <PageHeader
        title="Invoices"
        sub={`${invoices.length} total  ·  ${formatCurrency(invoices.filter(i => i.status === 'paid').reduce((s, i) => s + getTotal(i), 0))} collected`}
        action={<Btn onClick={() => setModal('add')}>+ New Invoice</Btn>}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-10 stagger">
        <StatCard label="Total Outstanding" value={formatCurrency(totalOutstanding)} gold />
        <StatCard label="Paid This Month" value={formatCurrency(paidMTD)}
          sub={`${invoices.filter(i => i.status === 'paid' && i.paidDate && new Date(i.paidDate) >= mtdStart).length} invoices`} />
        <StatCard label="Overdue" value={String(overdueCount)}
          sub={overdueCount > 0 ? 'Action required' : 'All clear'} />
      </div>

      {/* Filter tabs + search */}
      <div className="flex items-center justify-between mb-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex gap-0.5">
          {(['all', ...STATUSES] as const).map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2.5 text-xs font-semibold capitalize transition-all duration-200 rounded-lg ${
                filter === s
                  ? 'bg-gold/10 text-gold ring-1 ring-gold/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}>
              {s} {s !== 'all' && <span className="text-slate-600 ml-0.5">({statusCount(s)})</span>}
            </button>
          ))}
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          className="bg-slate-800/50 border border-slate-700/50 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 w-56 transition-all duration-200"
          placeholder="Search client or project…" />
      </div>

      {/* Invoice table */}
      <div className="animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
        <SectionCard>
          <table className="nx-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Project</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Status</th>
                <th className="text-right">Amount</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const total = getTotal(inv)
                const overdue = isOverdue(inv)
                return (
                  <tr key={inv.id} className="group">
                    <td className="font-mono text-sm text-gold">{inv.number}</td>
                    <td>
                      <p className="text-white font-medium group-hover:text-gold transition-colors">{inv.clientName}</p>
                      {inv.clientCompany && <p className="text-xs text-slate-400 mt-0.5">{inv.clientCompany}</p>}
                    </td>
                    <td className="text-slate-400 text-xs">{inv.projectName ?? '—'}</td>
                    <td className="tabular-nums">{formatDate(inv.issueDate)}</td>
                    <td className={`tabular-nums ${overdue ? 'text-red-400' : ''}`}>{formatDate(inv.dueDate)}</td>
                    <td><Badge label={effectiveStatus(inv)} /></td>
                    <td className="text-right font-semibold text-white tabular-nums">{formatCurrency(total)}</td>
                    <td>
                      <div className="flex gap-1.5 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Link href={`/invoices/${inv.id}/print`}>
                          <Btn size="sm" variant="ghost">View</Btn>
                        </Link>
                        <Btn size="sm" variant="ghost" onClick={() => setModal(inv)}>Edit</Btn>
                        {(inv.status === 'sent' || overdue) && (
                          <Btn size="sm" variant="primary" onClick={() => handleMarkPaid(inv)}>Paid</Btn>
                        )}
                        <Btn size="sm" variant="ghost" onClick={() => handleDuplicate(inv)}>Dup</Btn>
                        <Btn size="sm" variant="danger" onClick={() => remove(inv.id)}>Del</Btn>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={8}><EmptyState message="No invoices found." /></td></tr>
              )}
            </tbody>
          </table>
        </SectionCard>
      </div>

      {/* Showing total */}
      {filtered.length > 0 && (
        <div className="flex justify-end mt-4 pr-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-right">
            <p className="text-[10px] text-slate-400 tracking-[0.1em] uppercase">Showing total</p>
            <p className="text-xl font-serif gold-shimmer font-semibold mt-1">
              {formatCurrency(filtered.reduce((s, i) => s + getTotal(i), 0))}
            </p>
          </div>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <Modal wide
          title={modal === 'add' ? 'New Invoice' : `Edit — ${(modal as Invoice).number}`}
          onClose={() => setModal(null)}>
          <InvoiceForm
            initial={modal === 'add' ? undefined : modal as Invoice}
            onSave={modal === 'add' ? add : edit}
            onClose={() => setModal(null)}
            nextNumber={nextNum}
            contacts={contacts} />
        </Modal>
      )}
    </div>
  )
}
