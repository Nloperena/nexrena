'use client'

import { useState } from 'react'
import type { Contact, DealStage } from '@/lib/types'
import { genId } from '@/lib/store'
import { PRIMARY_STAGES, SECONDARY_STAGES } from '@/lib/constants'
import { Btn, Field } from '@/components/ui'
import { teamInputCls, teamSelectCls } from '@/lib/team-a11y'

const INDUSTRIES = ['industrial', 'ecommerce', 'realestate', 'professional', 'other'] as const

type Props = {
  initial?: Partial<Contact>
  onSave: (c: Contact) => void
  onClose: () => void
}

export function CrmContactForm({ initial, onSave, onClose }: Props) {
  const [form, setForm] = useState<Partial<Contact>>(
    initial ?? { stage: 'lead', industry: 'industrial', value: 0 },
  )

  const set = (k: keyof Contact, v: string | number) =>
    setForm((f) => ({ ...f, [k]: v }))

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const now = new Date().toISOString()
    onSave({
      id: form.id ?? genId(),
      name: form.name!,
      company: form.company!,
      email: form.email!,
      industry: form.industry ?? 'other',
      stage: form.stage ?? 'lead',
      value: Number(form.value) ?? 0,
      phone: form.phone,
      billingAddress: form.billingAddress,
      notes: form.notes,
      createdAt: form.createdAt ?? now,
      updatedAt: now,
    })
    onClose()
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Full Name">
          <input
            required
            className={teamInputCls}
            value={form.name ?? ''}
            onChange={(e) => set('name', e.target.value)}
            placeholder="Jane Smith"
          />
        </Field>
        <Field label="Company">
          <input
            required
            className={teamInputCls}
            value={form.company ?? ''}
            onChange={(e) => set('company', e.target.value)}
            placeholder="Acme Corp"
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Email">
          <input
            required
            type="email"
            className={teamInputCls}
            value={form.email ?? ''}
            onChange={(e) => set('email', e.target.value)}
            placeholder="jane@acme.com"
          />
        </Field>
        <Field label="Phone">
          <input
            className={teamInputCls}
            value={form.phone ?? ''}
            onChange={(e) => set('phone', e.target.value)}
            placeholder="407-555-0100"
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Industry">
          <select
            className={teamSelectCls}
            value={form.industry}
            onChange={(e) => set('industry', e.target.value)}
          >
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Stage">
          <select
            className={teamSelectCls}
            value={form.stage}
            onChange={(e) => set('stage', e.target.value as DealStage)}
          >
            {PRIMARY_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            <option disabled>───</option>
            {SECONDARY_STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Deal Value ($)">
          <input
            type="number"
            className={teamInputCls}
            value={form.value ?? 0}
            onChange={(e) => set('value', e.target.value)}
          />
        </Field>
      </div>
      <Field label="Billing Address">
        <input
          className={teamInputCls}
          value={form.billingAddress ?? ''}
          onChange={(e) => set('billingAddress', e.target.value)}
          placeholder="123 Main St, Orlando, FL 32801"
        />
      </Field>
      <Field label="Notes">
        <textarea
          rows={3}
          className={teamInputCls}
          value={form.notes ?? ''}
          onChange={(e) => set('notes', e.target.value)}
          placeholder="Key context, pain points, next steps…"
        />
      </Field>
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <Btn variant="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn type="submit">Save Contact</Btn>
      </div>
    </form>
  )
}
