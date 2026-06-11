'use client'

import { useMemo, useState } from 'react'
import { useContacts, useClientResources, useInvoices, genId } from '@/lib/store'
import type { ClientResourceRecord, ClientResourceType } from '@/lib/types'
import { PageHeader, SectionCard, EmptyState, Btn, Modal, Field, inputCls, selectCls } from '@/components/ui'

const RESOURCE_TYPES: ClientResourceType[] = ['github', 'live_site', 'staging']

function ResourceForm({
  initial,
  contacts,
  onSave,
  onClose,
}: {
  initial?: Partial<ClientResourceRecord>
  contacts: { id: string; name: string; company: string }[]
  onSave: (row: ClientResourceRecord) => void
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<ClientResourceRecord>>({
    type: 'github',
    ...initial,
  })
  const set = <K extends keyof ClientResourceRecord>(k: K, v: ClientResourceRecord[K]) =>
    setForm((f) => ({ ...f, [k]: v }))

  const contactInvoices = useInvoices().invoices.filter((i) => i.contactId === form.contactId)

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: form.id ?? genId(),
      contactId: form.contactId!,
      type: form.type ?? 'github',
      title: form.title!,
      url: form.url!,
      description: form.description ?? null,
      relatedInvoiceId: form.relatedInvoiceId ?? null,
      createdAt: form.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Client">
        <select
          required
          className={selectCls}
          value={form.contactId ?? ''}
          onChange={(e) => set('contactId', e.target.value)}
          disabled={Boolean(initial?.id)}
        >
          <option value="">Select client…</option>
          {contacts.map((c) => (
            <option key={c.id} value={c.id}>{c.company || c.name}</option>
          ))}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type">
          <select className={selectCls} value={form.type} onChange={(e) => set('type', e.target.value as ClientResourceType)}>
            {RESOURCE_TYPES.map((t) => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
          </select>
        </Field>
        <Field label="Title">
          <input required className={inputCls} value={form.title ?? ''} onChange={(e) => set('title', e.target.value)} placeholder="TTAG Live Website" />
        </Field>
      </div>
      <Field label="URL">
        <input required type="url" className={inputCls} value={form.url ?? ''} onChange={(e) => set('url', e.target.value)} placeholder="https://github.com/Nloperena/TTAG.git" />
      </Field>
      <Field label="Description (optional)">
        <textarea rows={2} className={inputCls} value={form.description ?? ''} onChange={(e) => set('description', e.target.value || null)} />
      </Field>
      <Field label="Related invoice (optional)">
        <select
          className={selectCls}
          value={form.relatedInvoiceId ?? ''}
          onChange={(e) => set('relatedInvoiceId', e.target.value || null)}
          disabled={!form.contactId}
        >
          <option value="">None</option>
          {contactInvoices.map((inv) => (
            <option key={inv.id} value={inv.id}>{inv.number} — {inv.projectName ?? 'Invoice'}</option>
          ))}
        </select>
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" type="button" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">Save</Btn>
      </div>
    </form>
  )
}

export default function ClientResourcesPage() {
  const { contacts } = useContacts()
  const { invoices } = useInvoices()
  const [contactFilter, setContactFilter] = useState('')
  const { resources, add, edit, remove } = useClientResources(contactFilter || undefined)
  const [modal, setModal] = useState<null | 'add' | ClientResourceRecord>(null)

  const sortedContacts = useMemo(
    () => [...contacts].sort((a, b) => (a.company || a.name).localeCompare(b.company || b.name)),
    [contacts],
  )

  const invoiceMap = useMemo(
    () => Object.fromEntries(invoices.map((i) => [i.id, i])),
    [invoices],
  )

  return (
    <div>
      <PageHeader
        title="Client websites"
        sub={`${resources.length} repo and site link${resources.length === 1 ? '' : 's'} for portal clients`}
        action={<Btn onClick={() => setModal('add')}>+ Add link</Btn>}
      />

      <div className="mb-6 max-w-xs">
        <label className="block text-[10px] text-slate-400 tracking-[0.15em] uppercase mb-2 font-medium">
          Filter by client
        </label>
        <select className={selectCls} value={contactFilter} onChange={(e) => setContactFilter(e.target.value)}>
          <option value="">All clients</option>
          {sortedContacts.map((c) => (
            <option key={c.id} value={c.id}>{c.company || c.name}</option>
          ))}
        </select>
      </div>

      <SectionCard>
        <table className="nx-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Title</th>
              <th>Type</th>
              <th>URL</th>
              <th>Invoice</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {resources.map((row) => (
              <tr key={row.id}>
                <td>
                  <p className="text-white font-medium">{row.contactName ?? 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{row.contactCompany || row.contactEmail}</p>
                </td>
                <td className="text-white">{row.title}</td>
                <td className="text-slate-400 text-sm capitalize">{row.type.replace('_', ' ')}</td>
                <td>
                  <a href={row.url} target="_blank" rel="noopener noreferrer" className="text-xs text-gold hover:underline truncate max-w-[220px] inline-block">
                    {row.url}
                  </a>
                </td>
                <td className="text-slate-400 text-xs">
                  {row.relatedInvoiceId ? invoiceMap[row.relatedInvoiceId]?.number ?? '—' : '—'}
                </td>
                <td>
                  <div className="flex gap-2">
                    <button type="button" className="text-xs text-slate-400 hover:text-white" onClick={() => setModal(row)}>Edit</button>
                    <button type="button" className="text-xs text-red-400 hover:text-red-300" onClick={() => remove(row.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {resources.length === 0 && (
              <tr>
                <td colSpan={6}>
                  <EmptyState message="No website links yet. Add GitHub repos or live site URLs for clients to see in their portal." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </SectionCard>

      {modal && (
        <Modal
          title={modal === 'add' ? 'Add client website link' : 'Edit website link'}
          onClose={() => setModal(null)}
        >
          <ResourceForm
            initial={modal === 'add' ? undefined : modal}
            contacts={sortedContacts}
            onSave={(row) => (modal === 'add' ? add(row) : edit(row))}
            onClose={() => setModal(null)}
          />
        </Modal>
      )}
    </div>
  )
}
