'use client'
import { useState } from 'react'
import { Subscription, SubscriptionInterval, Contact } from '@/lib/types'
import { genId } from '@/lib/store'
import { NET_TERMS_OPTIONS } from '@/lib/constants'
import { Btn, Field, inputCls, selectCls } from '@/components/ui'

const INTERVALS: { value: SubscriptionInterval; label: string }[] = [
  { value: 'monthly',   label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually',  label: 'Annually' },
]

function nextBillingDateFor(day: number): string {
  const now = new Date()
  const candidate = new Date(now.getFullYear(), now.getMonth(), day)
  if (candidate <= now) candidate.setMonth(candidate.getMonth() + 1)
  return candidate.toISOString().slice(0, 10)
}

interface SubscriptionFormProps {
  initial?: Partial<Subscription>
  onSave: (s: Subscription) => void
  onClose: () => void
  contacts: Contact[]
}

export function SubscriptionForm({ initial, onSave, onClose, contacts }: SubscriptionFormProps) {
  const isEdit = !!initial?.id
  const [form, setForm] = useState<Partial<Subscription>>(initial ?? {
    status: 'active',
    interval: 'monthly',
    billingDay: 1,
    netTerms: 'net30',
    nextBillingDate: nextBillingDateFor(1),
    skipNext: false,
  })

  const set = <K extends keyof Subscription>(k: K, v: Subscription[K]) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleBillingDayChange = (day: number) => {
    set('billingDay', day)
    if (!isEdit) set('nextBillingDate', nextBillingDateFor(day))
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: form.id ?? genId(),
      contactId: form.contactId!,
      contactName: form.contactName,
      contactCompany: form.contactCompany,
      description: form.description!,
      amount: form.amount!,
      interval: form.interval ?? 'monthly',
      status: form.status ?? 'active',
      billingDay: form.billingDay ?? 1,
      nextBillingDate: form.nextBillingDate!,
      skipNext: form.skipNext ?? false,
      netTerms: form.netTerms,
      notes: form.notes,
      createdAt: form.createdAt ?? new Date().toISOString(),
    })
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Client">
        <select required className={selectCls}
          value={form.contactId ?? ''}
          onChange={e => {
            const contact = contacts.find(c => c.id === e.target.value)
            setForm(f => ({
              ...f,
              contactId: e.target.value,
              contactName: contact?.name,
              contactCompany: contact?.company,
            }))
          }}>
          <option value="">Select a client…</option>
          {contacts.map(c => (
            <option key={c.id} value={c.id}>{c.name} — {c.company}</option>
          ))}
        </select>
      </Field>

      <Field label="Description">
        <input required className={inputCls} value={form.description ?? ''}
          onChange={e => set('description', e.target.value)}
          placeholder="Website Hosting" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Amount ($)">
          <input required type="number" min={0} step="0.01" className={inputCls}
            value={form.amount ?? ''}
            onChange={e => set('amount', Number(e.target.value))}
            placeholder="20.00" />
        </Field>
        <Field label="Billing Interval">
          <select className={selectCls} value={form.interval ?? 'monthly'}
            onChange={e => set('interval', e.target.value as SubscriptionInterval)}>
            {INTERVALS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Billing Day of Month">
          <input type="number" min={1} max={28} className={inputCls}
            value={form.billingDay ?? 1}
            onChange={e => handleBillingDayChange(Number(e.target.value))} />
        </Field>
        <Field label="Payment Terms">
          <select className={selectCls} value={form.netTerms ?? 'net30'}
            onChange={e => set('netTerms', e.target.value)}>
            {NET_TERMS_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Next Billing Date">
        <input required type="date" className={inputCls}
          value={form.nextBillingDate ?? ''}
          onChange={e => set('nextBillingDate', e.target.value)} />
      </Field>

      {isEdit && (
        <Field label="Status">
          <select className={selectCls} value={form.status ?? 'active'}
            onChange={e => set('status', e.target.value as Subscription['status'])}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </Field>
      )}

      <Field label="Notes">
        <textarea rows={2} className={inputCls} value={form.notes ?? ''}
          onChange={e => set('notes', e.target.value)}
          placeholder="Any notes about this subscription…" />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn type="submit">{isEdit ? 'Update Subscription' : 'Create Subscription'}</Btn>
      </div>
    </form>
  )
}
