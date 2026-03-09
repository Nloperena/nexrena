'use client'
import { useState } from 'react'
import { useInvoices, genId, formatCurrency, formatDate } from '@/lib/store'
import { Invoice, InvoiceStatus, InvoiceLineItem } from '@/lib/types'
import { PageHeader, Badge, Btn, Modal, Field, inputCls, selectCls, StatCard } from '@/components/ui'

const STATUSES: InvoiceStatus[] = ['draft','sent','paid','overdue','cancelled']

function LineItemRow({ item, onChange, onRemove }: {
  item: InvoiceLineItem
  onChange: (item: InvoiceLineItem) => void
  onRemove: () => void
}) {
  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <div className="col-span-6">
        <input className={inputCls} value={item.description}
          onChange={e => onChange({ ...item, description: e.target.value })}
          placeholder="Service description" />
      </div>
      <div className="col-span-2">
        <input type="number" className={inputCls} value={item.quantity}
          onChange={e => onChange({ ...item, quantity: Number(e.target.value) })}
          placeholder="Qty" />
      </div>
      <div className="col-span-2">
        <input type="number" className={inputCls} value={item.rate}
          onChange={e => onChange({ ...item, rate: Number(e.target.value) })}
          placeholder="Rate" />
      </div>
      <div className="col-span-1 text-right">
        <span className="text-sm text-[#C9A96E]">{formatCurrency(item.quantity * item.rate)}</span>
      </div>
      <div className="col-span-1 text-right">
        <button onClick={onRemove} className="text-[#3D4A5C] hover:text-red-400 text-lg leading-none">×</button>
      </div>
    </div>
  )
}

function InvoiceForm({ initial, onSave, onClose, nextNumber }: {
  initial?: Partial<Invoice>; onSave: (i: Invoice) => void; onClose: () => void; nextNumber: string
}) {
  const [form, setForm] = useState<Partial<Invoice>>(initial ?? {
    status: 'draft', number: nextNumber,
    issueDate: new Date().toISOString().slice(0,10),
    dueDate: new Date(Date.now() + 7*86400000).toISOString().slice(0,10),
    lineItems: [{ id: genId(), description: '', quantity: 1, rate: 0 }],
  })

  const set = (k: keyof Invoice, v: string) => setForm(f => ({ ...f, [k]: v }))
  const setItems = (items: InvoiceLineItem[]) => setForm(f => ({ ...f, lineItems: items }))
  const addItem = () => setItems([...(form.lineItems ?? []), { id: genId(), description: '', quantity: 1, rate: 0 }])
  const updateItem = (id: string, item: InvoiceLineItem) => setItems((form.lineItems ?? []).map(l => l.id === id ? item : l))
  const removeItem = (id: string) => setItems((form.lineItems ?? []).filter(l => l.id !== id))

  const total = (form.lineItems ?? []).reduce((s, l) => s + l.quantity * l.rate, 0)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: form.id ?? genId(),
      number: form.number!,
      clientName: form.clientName!,
      status: form.status ?? 'draft',
      lineItems: form.lineItems ?? [],
      issueDate: form.issueDate!,
      dueDate: form.dueDate!,
      paidDate: form.paidDate,
      notes: form.notes,
      createdAt: form.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Invoice #"><input required className={inputCls} value={form.number ?? ''} onChange={e => set('number', e.target.value)} /></Field>
        <Field label="Client Name"><input required className={inputCls} value={form.clientName ?? ''} onChange={e => set('clientName', e.target.value)} placeholder="Acme Corp" /></Field>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Status">
          <select className={selectCls} value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Issue Date"><input type="date" className={inputCls} value={form.issueDate ?? ''} onChange={e => set('issueDate', e.target.value)} /></Field>
        <Field label="Due Date"><input type="date" className={inputCls} value={form.dueDate ?? ''} onChange={e => set('dueDate', e.target.value)} /></Field>
      </div>

      {/* Line items */}
      <div>
        <div className="grid grid-cols-12 gap-2 mb-2">
          <p className="col-span-6 text-[11px] text-[#7A8A9E] uppercase tracking-wider">Description</p>
          <p className="col-span-2 text-[11px] text-[#7A8A9E] uppercase tracking-wider">Qty</p>
          <p className="col-span-2 text-[11px] text-[#7A8A9E] uppercase tracking-wider">Rate ($)</p>
          <p className="col-span-1 text-[11px] text-[#7A8A9E] uppercase tracking-wider text-right">Total</p>
          <div className="col-span-1" />
        </div>
        <div className="space-y-2">
          {(form.lineItems ?? []).map(item => (
            <LineItemRow key={item.id} item={item}
              onChange={updated => updateItem(item.id, updated)}
              onRemove={() => removeItem(item.id)} />
          ))}
        </div>
        <button type="button" onClick={addItem}
          className="mt-3 text-xs text-[#C9A96E] hover:underline">+ Add line item</button>
      </div>

      {/* Total */}
      <div className="flex justify-end border-t border-[#1E2530] pt-3">
        <div className="text-right">
          <p className="text-xs text-[#7A8A9E] mb-1">Invoice Total</p>
          <p className="text-2xl font-serif text-[#C9A96E] font-semibold">{formatCurrency(total)}</p>
        </div>
      </div>

      <Field label="Notes / Payment Terms">
        <textarea rows={2} className={inputCls} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)}
          placeholder="e.g. Remaining 50% due at project completion. Payment via ACH preferred." />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">Save Invoice</Btn>
      </div>
    </form>
  )
}

export default function InvoicesPage() {
  const { invoices, add, edit, remove } = useInvoices()
  const [modal, setModal] = useState<null | 'add' | Invoice>(null)
  const [filter, setFilter] = useState<'all' | InvoiceStatus>('all')

  const getTotal = (inv: Invoice) => inv.lineItems.reduce((s, l) => s + l.quantity * l.rate, 0)

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + getTotal(i), 0)
  const pendingTotal = invoices.filter(i => i.status === 'sent').reduce((s, i) => s + getTotal(i), 0)
  const overdueTotal = invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + getTotal(i), 0)

  const filtered = filter === 'all' ? invoices : invoices.filter(i => i.status === filter)

  const nextNumber = `NX-${String(invoices.length + 1).padStart(3, '0')}`

  return (
    <div>
      <PageHeader
        title="Invoices"
        sub={`${invoices.length} total  ·  ${formatCurrency(totalRevenue)} collected`}
        action={<Btn onClick={() => setModal('add')}>+ New Invoice</Btn>}
      />

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Total Collected" value={formatCurrency(totalRevenue)} gold />
        <StatCard label="Awaiting Payment" value={formatCurrency(pendingTotal)} sub={`${invoices.filter(i => i.status === 'sent').length} invoices sent`} />
        <StatCard label="Overdue" value={formatCurrency(overdueTotal)} sub={overdueTotal > 0 ? 'Action required' : 'All clear'} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4 border-b border-[#1E2530] pb-0">
        {(['all', ...STATUSES] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
              filter === s
                ? 'border-[#C9A96E] text-[#C9A96E]'
                : 'border-transparent text-[#7A8A9E] hover:text-white'
            }`}>
            {s} {s !== 'all' && `(${invoices.filter(i => i.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="bg-[#0C0F12] border border-[#1E2530] rounded-lg overflow-hidden">
        <table className="nx-table">
          <thead>
            <tr>
              <th>Invoice #</th>
              <th>Client</th>
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
              const isOverdue = inv.status === 'sent' && new Date(inv.dueDate) < new Date()
              return (
                <tr key={inv.id}>
                  <td className="font-mono text-sm text-[#C9A96E]">{inv.number}</td>
                  <td className="text-white font-medium">{inv.clientName}</td>
                  <td>{formatDate(inv.issueDate)}</td>
                  <td className={isOverdue ? 'text-red-400' : ''}>{formatDate(inv.dueDate)}</td>
                  <td><Badge label={isOverdue && inv.status === 'sent' ? 'overdue' : inv.status} /></td>
                  <td className="text-right font-semibold text-white">{formatCurrency(total)}</td>
                  <td>
                    <div className="flex gap-2 justify-end">
                      <Btn size="sm" variant="ghost" onClick={() => setModal(inv)}>Edit</Btn>
                      {inv.status === 'sent' && (
                        <Btn size="sm" variant="primary" onClick={() => edit({ ...inv, status: 'paid', paidDate: new Date().toISOString().slice(0,10) })}>
                          Mark Paid
                        </Btn>
                      )}
                      <Btn size="sm" variant="danger" onClick={() => remove(inv.id)}>Del</Btn>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center text-[#3D4A5C] py-10">No invoices found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Totals row */}
      {filtered.length > 0 && (
        <div className="flex justify-end mt-3 pr-4">
          <div className="text-right">
            <p className="text-xs text-[#7A8A9E]">Showing total</p>
            <p className="text-lg font-serif text-[#C9A96E] font-semibold">
              {formatCurrency(filtered.reduce((s, i) => s + getTotal(i), 0))}
            </p>
          </div>
        </div>
      )}

      {modal && (
        <Modal
          title={modal === 'add' ? 'New Invoice' : `Edit — ${(modal as Invoice).number}`}
          onClose={() => setModal(null)}>
          <InvoiceForm
            initial={modal === 'add' ? undefined : modal as Invoice}
            onSave={modal === 'add' ? add : edit}
            onClose={() => setModal(null)}
            nextNumber={nextNumber} />
        </Modal>
      )}
    </div>
  )
}
