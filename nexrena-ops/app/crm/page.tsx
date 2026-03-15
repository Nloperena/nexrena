'use client'
import { useState } from 'react'
import { useContacts, genId, formatCurrency } from '@/lib/store'
import { Contact, DealStage } from '@/lib/types'
import { PageHeader, Badge, Btn, Modal, Field, inputCls, selectCls, EmptyState, SectionCard } from '@/components/ui'

import { PRIMARY_STAGES, SECONDARY_STAGES } from '@/lib/constants'

const STAGES: DealStage[] = ['lead','contacted','discovery','proposal','negotiation','won','lost']
const INDUSTRIES = ['industrial','ecommerce','realestate','professional','other']

function ContactForm({ initial, onSave, onClose }: {
  initial?: Partial<Contact>; onSave: (c: Contact) => void; onClose: () => void
}) {
  const [form, setForm] = useState<Partial<Contact>>(initial ?? { stage: 'lead', industry: 'industrial', value: 0 })
  const set = (k: keyof Contact, v: string | number) => setForm(f => ({ ...f, [k]: v }))
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    onSave({ id: form.id ?? genId(), name: form.name!, company: form.company!, email: form.email!,
      industry: form.industry ?? 'other', stage: form.stage ?? 'lead', value: Number(form.value) ?? 0,
      phone: form.phone, billingAddress: form.billingAddress, notes: form.notes, createdAt: form.createdAt ?? now, updatedAt: now })
    onClose()
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Full Name"><input required className={inputCls} value={form.name ?? ''} onChange={e => set('name', e.target.value)} placeholder="Jane Smith" /></Field>
        <Field label="Company"><input required className={inputCls} value={form.company ?? ''} onChange={e => set('company', e.target.value)} placeholder="Acme Corp" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Email"><input required type="email" className={inputCls} value={form.email ?? ''} onChange={e => set('email', e.target.value)} placeholder="jane@acme.com" /></Field>
        <Field label="Phone"><input className={inputCls} value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} placeholder="407-555-0100" /></Field>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Field label="Industry">
          <select className={selectCls} value={form.industry} onChange={e => set('industry', e.target.value)}>
            {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </Field>
        <Field label="Stage">
          <select className={selectCls} value={form.stage} onChange={e => set('stage', e.target.value as DealStage)}>
            {PRIMARY_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            <option disabled>───</option>
            {SECONDARY_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Deal Value ($)"><input type="number" className={inputCls} value={form.value ?? 0} onChange={e => set('value', e.target.value)} /></Field>
      </div>
      <Field label="Billing Address"><input className={inputCls} value={form.billingAddress ?? ''} onChange={e => set('billingAddress', e.target.value)} placeholder="123 Main St, Orlando, FL 32801" /></Field>
      <Field label="Notes"><textarea rows={3} className={inputCls} value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} placeholder="Key context, pain points, next steps..." /></Field>
      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">Save Contact</Btn>
      </div>
    </form>
  )
}

export default function CRMPage() {
  const { contacts, add, edit, remove } = useContacts()
  const [view, setView] = useState<'kanban' | 'list'>('kanban')
  const [modal, setModal] = useState<null | 'add' | Contact>(null)
  const [search, setSearch] = useState('')

  const filtered = contacts.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  )

  const totalPipeline = contacts.filter(c => !['won','lost'].includes(c.stage)).reduce((s, c) => s + c.value, 0)

  return (
    <div>
      <PageHeader
        title="CRM Pipeline"
        sub={`${contacts.length} contacts  ·  ${formatCurrency(totalPipeline)} in pipeline`}
        action={
          <div className="flex items-center gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)}
              className={`${inputCls} !w-48`}
              placeholder="Search contacts…" />
            <div className="flex rounded-lg overflow-hidden border border-slate-700/50">
              {(['kanban','list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3.5 py-2 text-xs font-semibold capitalize transition-all duration-200 ${
                    view === v ? 'bg-gold text-obsidian' : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}>
                  {v}
                </button>
              ))}
            </div>
            <Btn onClick={() => setModal('add')}>+ Add Contact</Btn>
          </div>
        }
      />

      {view === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4 animate-fade-in">
          {STAGES.map((stage, stageIdx) => {
            const cards = filtered.filter(c => c.stage === stage)
            const stageVal = cards.reduce((s, c) => s + c.value, 0)
            return (
              <div key={stage} className="flex-shrink-0 w-52 animate-fade-in-up" style={{ animationDelay: `${stageIdx * 0.04}s` }}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <Badge label={stage} />
                    <span className="text-[10px] text-slate-600 tabular-nums">{cards.length}</span>
                  </div>
                  {stageVal > 0 && <span className="text-[10px] text-slate-400 tabular-nums">{formatCurrency(stageVal)}</span>}
                </div>
                <div className="space-y-2 min-h-[80px]">
                  {cards.map((c, i) => (
                    <div key={c.id} onClick={() => setModal(c)}
                      className="glass-panel rounded-lg p-3.5 cursor-pointer card-lift glass-panel-hover group animate-fade-in-up"
                      style={{ animationDelay: `${(stageIdx * 0.04) + (i * 0.03)}s` }}>
                      <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800/60 border border-slate-700/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{c.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-white font-medium leading-tight group-hover:text-gold transition-colors">{c.name}</p>
                          <p className="text-xs text-slate-600 mt-0.5 truncate">{c.company}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/40">
                        <span className="text-[10px] text-slate-600 capitalize">{c.industry}</span>
                        <span className="text-xs text-gold font-semibold tabular-nums">{formatCurrency(c.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="animate-fade-in">
          <SectionCard>
            <table className="nx-table">
              <thead>
                <tr><th>Name</th><th>Company</th><th>Industry</th><th>Stage</th><th className="text-right">Value</th><th>Email</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map(c => (
                  <tr key={c.id} className="group">
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-800/50 border border-slate-700/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-[9px] font-bold text-slate-400 uppercase">{c.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                        <span className="text-white font-medium group-hover:text-gold transition-colors">{c.name}</span>
                      </div>
                    </td>
                    <td>{c.company}</td>
                    <td className="capitalize">{c.industry}</td>
                    <td><Badge label={c.stage} /></td>
                    <td className="text-right text-gold tabular-nums font-medium">{formatCurrency(c.value)}</td>
                    <td className="text-slate-400">{c.email}</td>
                    <td>
                      <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Btn size="sm" variant="ghost" onClick={() => setModal(c)}>Edit</Btn>
                        <Btn size="sm" variant="danger" onClick={() => remove(c.id)}>Del</Btn>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7}><EmptyState message="No contacts found." /></td></tr>
                )}
              </tbody>
            </table>
          </SectionCard>
        </div>
      )}

      {modal && (
        <Modal
          title={modal === 'add' ? 'Add Contact' : `Edit — ${(modal as Contact).name}`}
          onClose={() => setModal(null)}>
          <ContactForm
            initial={modal === 'add' ? undefined : modal as Contact}
            onSave={modal === 'add' ? add : edit}
            onClose={() => setModal(null)} />
        </Modal>
      )}
    </div>
  )
}
