'use client'
import { useState } from 'react'
import { useContacts, genId, formatCurrency } from '@/lib/store'
import { Contact, DealStage } from '@/lib/types'
import { PageHeader, Badge, Btn, Modal, Field, inputCls, selectCls } from '@/components/ui'

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
      phone: form.phone, notes: form.notes, createdAt: form.createdAt ?? now, updatedAt: now })
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
            {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Deal Value ($)"><input type="number" className={inputCls} value={form.value ?? 0} onChange={e => set('value', e.target.value)} /></Field>
      </div>
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
              className="bg-[#1E2530] border border-[#2C3444] rounded px-3 py-1.5 text-sm text-white placeholder-[#3D4A5C] focus:outline-none focus:border-[#C9A96E] w-48"
              placeholder="Search..." />
            <div className="flex border border-[#2C3444] rounded overflow-hidden">
              {(['kanban','list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className={`px-3 py-1.5 text-xs font-medium capitalize transition-colors ${view === v ? 'bg-[#C9A96E] text-[#0C0F12]' : 'text-[#7A8A9E] hover:text-white'}`}>
                  {v}
                </button>
              ))}
            </div>
            <Btn onClick={() => setModal('add')}>+ Add Contact</Btn>
          </div>
        }
      />

      {view === 'kanban' ? (
        <div className="flex gap-3 overflow-x-auto pb-4">
          {STAGES.map(stage => {
            const cards = filtered.filter(c => c.stage === stage)
            const stageVal = cards.reduce((s, c) => s + c.value, 0)
            return (
              <div key={stage} className="flex-shrink-0 w-52">
                <div className="flex items-center justify-between mb-2 px-1">
                  <div className="flex items-center gap-2">
                    <Badge label={stage} />
                    <span className="text-xs text-[#3D4A5C]">{cards.length}</span>
                  </div>
                  {stageVal > 0 && <span className="text-[10px] text-[#7A8A9E]">{formatCurrency(stageVal)}</span>}
                </div>
                <div className="space-y-2 min-h-20">
                  {cards.map(c => (
                    <div key={c.id} onClick={() => setModal(c)}
                      className="bg-[#0C0F12] border border-[#1E2530] rounded-lg p-3 cursor-pointer hover:border-[#C9A96E]/50 transition-all group">
                      <p className="text-sm text-white font-medium leading-tight">{c.name}</p>
                      <p className="text-xs text-[#7A8A9E] mt-0.5">{c.company}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-[#3D4A5C] capitalize">{c.industry}</span>
                        <span className="text-xs text-[#C9A96E] font-medium">{formatCurrency(c.value)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-[#0C0F12] border border-[#1E2530] rounded-lg overflow-hidden">
          <table className="nx-table">
            <thead>
              <tr><th>Name</th><th>Company</th><th>Industry</th><th>Stage</th><th>Value</th><th>Email</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td className="text-white font-medium">{c.name}</td>
                  <td>{c.company}</td>
                  <td className="capitalize">{c.industry}</td>
                  <td><Badge label={c.stage} /></td>
                  <td className="text-[#C9A96E]">{formatCurrency(c.value)}</td>
                  <td>{c.email}</td>
                  <td>
                    <div className="flex gap-2">
                      <Btn size="sm" variant="ghost" onClick={() => setModal(c)}>Edit</Btn>
                      <Btn size="sm" variant="danger" onClick={() => remove(c.id)}>Del</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center text-[#3D4A5C] py-8">No contacts found.</td></tr>
              )}
            </tbody>
          </table>
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
