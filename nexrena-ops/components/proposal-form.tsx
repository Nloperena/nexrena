'use client'
import { useState } from 'react'
import { Proposal, ProposalStatus, ProposalService, Contact } from '@/lib/types'
import { genId, formatCurrency } from '@/lib/store'
import { NEXRENA_SERVICES } from '@/lib/constants'
import { Btn, Field, inputCls, selectCls } from '@/components/ui'

const STATUSES: ProposalStatus[] = ['draft', 'sent', 'accepted', 'declined', 'expired']

function ServiceRow({ item, onChange, onRemove }: {
  item: ProposalService; onChange: (s: ProposalService) => void; onRemove: () => void
}) {
  const [isCustom, setIsCustom] = useState(
    !NEXRENA_SERVICES.includes(item.description as typeof NEXRENA_SERVICES[number]) && item.description !== ''
  )
  return (
    <div className="grid grid-cols-12 gap-2 items-start">
      <div className="col-span-5">
        {isCustom ? (
          <div className="flex gap-1">
            <input className={inputCls} value={item.description}
              onChange={e => onChange({ ...item, description: e.target.value })} placeholder="Custom service" />
            <button type="button" onClick={() => setIsCustom(false)}
              className="text-[10px] text-slate-400 hover:text-gold shrink-0 px-1 transition-colors">list</button>
          </div>
        ) : (
          <select className={selectCls} value={item.description}
            onChange={e => {
              if (e.target.value === '__custom__') { setIsCustom(true); onChange({ ...item, description: '' }) }
              else onChange({ ...item, description: e.target.value })
            }}>
            <option value="">Select service…</option>
            {NEXRENA_SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
            <option value="__custom__">✎ Custom…</option>
          </select>
        )}
      </div>
      <div className="col-span-3">
        <input type="number" min={0} step="any" className={inputCls} value={item.price || ''}
          onChange={e => onChange({ ...item, price: Number(e.target.value) })} placeholder="Price" />
      </div>
      <div className="col-span-3">
        <input className={inputCls} value={item.notes ?? ''} onChange={e => onChange({ ...item, notes: e.target.value })} placeholder="Notes" />
      </div>
      <div className="col-span-1 text-right pt-2">
        <button type="button" onClick={onRemove} className="text-slate-600 hover:text-red-400 text-lg leading-none transition-colors">×</button>
      </div>
    </div>
  )
}

interface ProposalFormProps {
  initial?: Partial<Proposal>
  onSave: (p: Proposal) => void
  onClose: () => void
  contacts: Contact[]
}

export function ProposalForm({ initial, onSave, onClose, contacts }: ProposalFormProps) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState<Partial<Proposal>>(initial ?? {
    status: 'draft',
    discount: 0,
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
    services: [{ id: genId(), description: '', price: 0 }],
    scopeOfWork: '',
  })

  const set = (k: keyof Proposal, v: string | number | undefined) => setForm(f => ({ ...f, [k]: v }))
  const setServices = (services: ProposalService[]) => setForm(f => ({ ...f, services }))
  const addService = () => setServices([...(form.services ?? []), { id: genId(), description: '', price: 0 }])
  const updateService = (id: string, svc: ProposalService) => setServices((form.services ?? []).map(s => s.id === id ? svc : s))
  const removeService = (id: string) => setServices((form.services ?? []).filter(s => s.id !== id))

  const subtotal = (form.services ?? []).reduce((s, svc) => s + svc.price, 0)
  const total = subtotal - (form.discount || 0)

  const handleContactSelect = (contactId: string) => {
    const c = contacts.find(x => x.id === contactId)
    if (!c) return
    setForm(f => ({ ...f, contactId, clientName: c.name, clientCompany: c.company, clientEmail: c.email }))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: form.id ?? genId(),
      title: form.title ?? '',
      contactId: form.contactId,
      clientName: form.clientName ?? '',
      clientCompany: form.clientCompany,
      clientEmail: form.clientEmail,
      services: form.services ?? [],
      discount: form.discount ?? 0,
      status: form.status ?? 'draft',
      validUntil: form.validUntil ?? '',
      scopeOfWork: form.scopeOfWork ?? '',
      timeline: form.timeline,
      notes: form.notes,
      createdAt: form.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {contacts.length > 0 && (
        <Field label="Auto-fill from CRM">
          <select className={selectCls} value={form.contactId ?? ''} onChange={e => e.target.value && handleContactSelect(e.target.value)}>
            <option value="">Select a client…</option>
            {contacts.map(c => <option key={c.id} value={c.id}>{c.name} — {c.company}</option>)}
          </select>
        </Field>
      )}
      <Field label="Proposal Title"><input required className={inputCls} value={form.title ?? ''} onChange={e => set('title', e.target.value)} placeholder="Website Redesign & SEO Strategy" /></Field>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Client Name"><input required className={inputCls} value={form.clientName ?? ''} onChange={e => set('clientName', e.target.value)} /></Field>
        <Field label="Company"><input className={inputCls} value={form.clientCompany ?? ''} onChange={e => set('clientCompany', e.target.value)} /></Field>
        <Field label="Status">
          <select className={selectCls} value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Valid Until"><input required type="date" className={inputCls} value={form.validUntil ?? ''} onChange={e => set('validUntil', e.target.value)} /></Field>
        <Field label="Timeline"><input className={inputCls} value={form.timeline ?? ''} onChange={e => set('timeline', e.target.value)} placeholder="6-8 weeks" /></Field>
      </div>

      <div>
        <div className="grid grid-cols-12 gap-2 mb-2">
          <p className="col-span-5 text-[10px] text-slate-400 uppercase tracking-[0.15em] font-medium">Service</p>
          <p className="col-span-3 text-[10px] text-slate-400 uppercase tracking-[0.15em] font-medium">Price ($)</p>
          <p className="col-span-3 text-[10px] text-slate-400 uppercase tracking-[0.15em] font-medium">Notes</p>
          <div className="col-span-1" />
        </div>
        <div className="space-y-2">
          {(form.services ?? []).map(svc => (
            <ServiceRow key={svc.id} item={svc} onChange={u => updateService(svc.id, u)} onRemove={() => removeService(svc.id)} />
          ))}
        </div>
        <button type="button" onClick={addService} className="mt-3 text-xs text-gold hover:text-gold-light transition-colors">+ Add service</button>
      </div>

      <div className="flex justify-end border-t border-slate-800/60 pt-4">
        <div className="w-64 space-y-2.5">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal</span>
            <span className="text-white tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center text-sm gap-2">
            <span className="text-slate-400">Discount</span>
            <input type="number" min={0} step="any" className={inputCls + ' w-24 text-center !py-1 text-xs'}
              value={form.discount ?? 0} onChange={e => set('discount', Number(e.target.value))} />
          </div>
          <div className="flex justify-between items-baseline border-t border-slate-800/60 pt-3">
            <span className="text-[10px] text-slate-400 uppercase tracking-[0.15em] font-medium">Total</span>
            <span className="text-xl font-serif text-gold font-semibold tabular-nums">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <Field label="Scope of Work"><textarea required rows={4} className={inputCls} value={form.scopeOfWork ?? ''} onChange={e => set('scopeOfWork', e.target.value)} placeholder="Describe the deliverables, milestones, and what's included..." /></Field>
      <Field label="Notes"><textarea rows={2} className={inputCls} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Additional terms, exclusions, etc." /></Field>

      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">{isEdit ? 'Update Proposal' : 'Create Proposal'}</Btn>
      </div>
    </form>
  )
}
