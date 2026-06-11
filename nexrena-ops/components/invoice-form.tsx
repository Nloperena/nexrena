'use client'
import { useState } from 'react'
import { Invoice, InvoiceStatus, InvoiceLineItem, NetTerms, Contact, Project } from '@/lib/types'
import { genId, formatCurrency } from '@/lib/store'
import { NEXRENA_SERVICES, DEFAULT_PAYMENT_TERMS, NET_TERMS_OPTIONS } from '@/lib/constants'
import { Btn, Field, inputCls, selectCls } from '@/components/ui'

const STATUSES: InvoiceStatus[] = ['draft', 'sent', 'paid', 'overdue', 'cancelled']
const DEFAULT_PRODUCT_TAX_RATE = 7.5

function isLikelyTaxableProduct(description: string): boolean {
  if (!description) return false
  return /(amazon|equipment|adapter|splitter|hdmi|ethernet|shipping|extender|cable|product)/i.test(description)
}

function LineItemRow({ item, onChange, onRemove }: {
  item: InvoiceLineItem; onChange: (item: InvoiceLineItem) => void; onRemove: () => void
}) {
  const [isCustom, setIsCustom] = useState(
    !NEXRENA_SERVICES.includes(item.description as typeof NEXRENA_SERVICES[number])
    && item.description !== ''
  )

  return (
    <div className="grid grid-cols-12 gap-2 items-center">
      <div className="col-span-5">
        {isCustom ? (
          <div className="flex gap-1">
            <input className={inputCls} value={item.description}
              onChange={e => onChange({ ...item, description: e.target.value, taxable: isLikelyTaxableProduct(e.target.value) })}
              placeholder="Custom service description" />
            <button type="button" onClick={() => setIsCustom(false)}
              className="text-[10px] text-slate-400 hover:text-gold shrink-0 px-1 transition-colors">list</button>
          </div>
        ) : (
          <div className="flex gap-1">
            <select className={selectCls} value={item.description}
              onChange={e => {
                if (e.target.value === '__custom__') { setIsCustom(true); onChange({ ...item, description: '', taxable: false }) }
                else onChange({ ...item, description: e.target.value, taxable: isLikelyTaxableProduct(e.target.value) })
              }}>
              <option value="">Select service…</option>
              {NEXRENA_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
              <option value="__custom__">✎ Custom…</option>
            </select>
          </div>
        )}
      </div>
      <div className="col-span-2">
        <input type="number" min={0} step="any" className={inputCls} value={item.quantity || ''}
          onChange={e => onChange({ ...item, quantity: Number(e.target.value) })}
          placeholder="Qty/hrs" />
      </div>
      <div className="col-span-2">
        <input type="number" min={0} step="any" className={inputCls} value={item.rate || ''}
          onChange={e => onChange({ ...item, rate: Number(e.target.value) })}
          placeholder="Rate" />
      </div>
      <div className="col-span-2 text-right">
        <span className="text-sm text-gold font-medium tabular-nums">{formatCurrency(item.quantity * item.rate)}</span>
      </div>
      <div className="col-span-1 text-right">
        <div className="flex flex-col items-end gap-1">
          <label className="text-[10px] text-slate-500 inline-flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={!!item.taxable}
              onChange={e => onChange({ ...item, taxable: e.target.checked })}
            />
            Tax
          </label>
          <button type="button" onClick={onRemove} className="text-slate-600 hover:text-red-400 text-lg leading-none transition-colors">×</button>
        </div>
      </div>
    </div>
  )
}

function computeDueDate(issueDate: string, terms: NetTerms): string {
  if (terms === 'custom') return ''
  const days = NET_TERMS_OPTIONS.find(t => t.value === terms)?.days ?? 15
  const d = new Date(issueDate)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

interface InvoiceFormProps {
  initial?: Partial<Invoice>
  onSave: (i: Invoice) => void
  onSplitDeposit?: (payload: {
    total: number
    projectId: string
    contactId: string
    description?: string
    taxRate?: number
    netTerms?: string
  }) => Promise<unknown>
  onClose: () => void
  nextNumber: string
  contacts: Contact[]
  projects?: Project[]
}

export function InvoiceForm({
  initial,
  onSave,
  onSplitDeposit,
  onClose,
  nextNumber,
  contacts,
  projects = [],
}: InvoiceFormProps) {
  const isEdit = !!initial?.id
  const [split5050, setSplit5050] = useState(false)
  const [splitting, setSplitting] = useState(false)
  const [form, setForm] = useState<Partial<Invoice>>(initial ?? {
    status: 'draft',
    number: nextNumber,
    netTerms: 'net15',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: computeDueDate(new Date().toISOString().slice(0, 10), 'net15'),
    lineItems: [{ id: genId(), description: '', quantity: 1, rate: 0, taxable: false }],
    notes: DEFAULT_PAYMENT_TERMS,
    taxRate: DEFAULT_PRODUCT_TAX_RATE,
  })

  const set = (k: keyof Invoice, v: string | number | undefined) => setForm(f => ({ ...f, [k]: v }))
  const setItems = (items: InvoiceLineItem[]) => setForm(f => ({ ...f, lineItems: items }))
  const addItem = () => setItems([...(form.lineItems ?? []), { id: genId(), description: '', quantity: 1, rate: 0, taxable: false }])
  const updateItem = (id: string, item: InvoiceLineItem) => setItems((form.lineItems ?? []).map(l => l.id === id ? item : l))
  const removeItem = (id: string) => setItems((form.lineItems ?? []).filter(l => l.id !== id))

  const subtotal = (form.lineItems ?? []).reduce((s, l) => s + l.quantity * l.rate, 0)
  const taxableSubtotal = (form.lineItems ?? []).filter(l => l.taxable).reduce((s, l) => s + l.quantity * l.rate, 0)
  const taxAmt = form.taxRate ? taxableSubtotal * ((form.taxRate ?? 0) / 100) : 0
  const total = subtotal + taxAmt

  const handleTermsChange = (terms: NetTerms) => {
    set('netTerms', terms)
    if (terms !== 'custom' && form.issueDate) {
      set('dueDate', computeDueDate(form.issueDate, terms))
    }
  }

  const handleIssueDateChange = (date: string) => {
    set('issueDate', date)
    if (form.netTerms && form.netTerms !== 'custom') {
      set('dueDate', computeDueDate(date, form.netTerms))
    }
  }

  const handleContactSelect = (contactId: string) => {
    const contact = contacts.find(c => c.id === contactId)
    if (!contact) return
    setForm(f => ({
      ...f,
      contactId,
      clientName: contact.name,
      clientCompany: contact.company,
      clientEmail: contact.email,
      clientAddress: contact.billingAddress ?? '',
    }))
  }

  const resolveContactId = () => {
    if (form.contactId) return form.contactId
    const email = form.clientEmail?.trim().toLowerCase()
    if (!email) return undefined
    return contacts.find(c => c.email.trim().toLowerCase() === email)?.id
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const contactId = resolveContactId()

    if (split5050 && onSplitDeposit && !isEdit) {
      if (!contactId) {
        alert('Select a client before creating a 50/50 split.')
        return
      }
      if (!form.projectId) {
        alert('Select a project for the 50/50 split.')
        return
      }
      setSplitting(true)
      try {
        const description = (form.lineItems ?? [])
          .map((l) => l.description)
          .filter(Boolean)
          .join('; ') || form.projectName || undefined
        await onSplitDeposit({
          total,
          projectId: form.projectId,
          contactId,
          description,
          taxRate: form.taxRate,
          netTerms: form.netTerms,
        })
        onClose()
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Could not create split invoices.')
      } finally {
        setSplitting(false)
      }
      return
    }

    onSave({
      id: form.id ?? genId(),
      number: form.number!,
      clientName: form.clientName ?? '',
      clientCompany: form.clientCompany,
      clientEmail: form.clientEmail?.trim() || undefined,
      clientAddress: form.clientAddress,
      contactId,
      projectId: form.projectId,
      projectName: form.projectName,
      status: form.status ?? 'draft',
      lineItems: form.lineItems ?? [],
      issueDate: form.issueDate!,
      dueDate: form.dueDate!,
      netTerms: form.netTerms,
      taxRate: form.taxRate,
      paidDate: form.paidDate,
      notes: form.notes,
      createdAt: form.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {/* Client auto-fill */}
      {contacts.length > 0 && (
        <Field label="Auto-fill from saved client">
          <select className={selectCls}
            value={form.contactId ?? ''}
            onChange={e => e.target.value && handleContactSelect(e.target.value)}>
            <option value="">Select a client…</option>
            {contacts.map(c => (
              <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
            ))}
          </select>
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Invoice #">
          <input
            required
            className={inputCls + (isEdit ? ' opacity-50 cursor-not-allowed' : '')}
            value={form.number ?? ''}
            onChange={e => set('number', e.target.value)}
            readOnly={isEdit}
          />
        </Field>
        <Field label="Status">
          <select className={selectCls} value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Client Name">
          <input required className={inputCls} value={form.clientName ?? ''} onChange={e => set('clientName', e.target.value)} placeholder="Jane Smith" />
        </Field>
        <Field label="Company">
          <input className={inputCls} value={form.clientCompany ?? ''} onChange={e => set('clientCompany', e.target.value)} placeholder="Acme Corp" />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Client Email">
          <input type="email" className={inputCls} value={form.clientEmail ?? ''} onChange={e => set('clientEmail', e.target.value)} placeholder="billing@acme.com" />
        </Field>
        <Field label="Project">
          {projects.length > 0 ? (
            <select
              className={selectCls}
              value={form.projectId ?? ''}
              onChange={(e) => {
                const project = projects.find((p) => p.id === e.target.value)
                setForm((f) => ({
                  ...f,
                  projectId: e.target.value || undefined,
                  projectName: project?.name ?? f.projectName,
                }))
              }}
            >
              <option value="">Select project (optional)…</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name} — {p.clientName}</option>
              ))}
            </select>
          ) : (
            <input className={inputCls} value={form.projectName ?? ''} onChange={e => set('projectName', e.target.value)} placeholder="Website Rebuild Phase 1" />
          )}
        </Field>
      </div>

      <Field label="Billing Address">
        <input className={inputCls} value={form.clientAddress ?? ''} onChange={e => set('clientAddress', e.target.value)} placeholder="123 Main St, Orlando, FL 32801" />
      </Field>

      <div className="grid grid-cols-3 gap-4">
        <Field label="Payment Terms">
          <select className={selectCls} value={form.netTerms ?? 'net15'}
            onChange={e => handleTermsChange(e.target.value as NetTerms)}>
            {NET_TERMS_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
        <Field label="Issue Date">
          <input type="date" required className={inputCls} value={form.issueDate ?? ''}
            onChange={e => handleIssueDateChange(e.target.value)} />
        </Field>
        <Field label="Due Date">
          <input type="date" required className={inputCls} value={form.dueDate ?? ''}
            onChange={e => set('dueDate', e.target.value)} />
        </Field>
      </div>

      {/* Line items */}
      <div>
        <div className="grid grid-cols-12 gap-2 mb-2">
          <p className="col-span-5 text-[10px] text-slate-400 uppercase tracking-[0.15em] font-medium">Service</p>
          <p className="col-span-2 text-[10px] text-slate-400 uppercase tracking-[0.15em] font-medium">Qty / Hrs</p>
          <p className="col-span-2 text-[10px] text-slate-400 uppercase tracking-[0.15em] font-medium">Rate ($)</p>
          <p className="col-span-2 text-[10px] text-slate-400 uppercase tracking-[0.15em] font-medium text-right">Total</p>
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
          className="mt-3 text-xs text-gold hover:text-gold-light transition-colors">+ Add line item</button>
      </div>

      {/* Totals */}
      <div className="flex justify-end border-t border-slate-800/60 pt-4">
        <div className="w-64 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal</span>
            <span className="text-white tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm gap-2">
            <span className="text-slate-400">Tax (products only)</span>
            <div className="flex items-center gap-1">
              <input type="number" min={0} max={100} step="0.1" className={inputCls + ' w-16 text-center !py-1 text-xs'}
                value={form.taxRate ?? 0} onChange={e => set('taxRate', Number(e.target.value))} />
              <span className="text-slate-400 text-xs">%</span>
            </div>
            <span className="text-white tabular-nums">{formatCurrency(taxAmt)}</span>
          </div>
          {taxAmt > 0 && (
            <div className="flex justify-between text-xs text-slate-500 -mt-1">
              <span>Taxable subtotal</span>
              <span className="tabular-nums">{formatCurrency(taxableSubtotal)}</span>
            </div>
          )}
          <div className="flex justify-between items-baseline border-t border-slate-800/60 pt-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-medium">Grand Total</span>
            <span className="text-xl font-serif text-gold font-semibold tabular-nums">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {!isEdit && onSplitDeposit && (
        <label className="flex items-start gap-3 rounded-lg border border-slate-800/60 bg-slate-900/40 p-4 cursor-pointer">
          <input
            type="checkbox"
            checked={split5050}
            onChange={(e) => setSplit5050(e.target.checked)}
            className="mt-1"
          />
          <span>
            <span className="text-sm text-white font-medium">Split 50/50</span>
            <span className="block text-xs text-slate-400 mt-1">
              Creates a deposit invoice (50%, sent now) and a balance invoice (50%, draft until project delivery).
            </span>
          </span>
        </label>
      )}

      <Field label="Notes / Payment Terms">
        <textarea rows={3} className={inputCls} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)}
          placeholder="Payment via ACH, Stripe, or wire transfer. Late payments subject to 1.5% monthly fee." />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn type="submit" disabled={splitting}>
          {splitting ? 'Creating…' : split5050 && !isEdit ? 'Create 50/50 invoices' : isEdit ? 'Update Invoice' : 'Create Invoice'}
        </Btn>
      </div>
    </form>
  )
}
