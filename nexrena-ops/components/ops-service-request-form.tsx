'use client'

import { useState } from 'react'
import type { Contact, ServiceRequest, ServiceRequestStatus } from '@/lib/types'
import { Btn } from '@/components/ui'
import {
  SERVICE_REQUEST_PROJECT_TYPES,
  SERVICE_REQUEST_STATUS_OPTIONS,
} from '@/lib/service-request-api'

type Props = {
  initial?: Partial<ServiceRequest>
  contacts: Contact[]
  onSave: (request: ServiceRequest) => void | Promise<void>
  onClose: () => void
}

const inputCls =
  'w-full bg-[#0e1116] border border-slate-600/50 rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-gold/60 min-h-[44px]'
const labelCls = 'block text-[10px] uppercase tracking-wider text-slate-500 mb-1.5'

export function OpsServiceRequestForm({ initial, contacts, onSave, onClose }: Props) {
  const editing = Boolean(initial?.id)

  const [contactId, setContactId] = useState(initial?.contactId ?? contacts[0]?.id ?? '')
  const [projectType, setProjectType] = useState(initial?.projectType ?? 'web')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [budget, setBudget] = useState(initial?.budget ?? '')
  const [timeline, setTimeline] = useState(initial?.timeline ?? '')
  const [status, setStatus] = useState<ServiceRequestStatus>(initial?.status ?? 'new')
  const [internalNotes, setInternalNotes] = useState(initial?.internalNotes ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!contactId || !description.trim()) {
      setError('Client and description are required.')
      return
    }

    setSaving(true)
    setError(null)

    const contact = contacts.find((row) => row.id === contactId)
    const payload: ServiceRequest = {
      id: initial?.id ?? '',
      contactId,
      contactName: contact?.name,
      contactCompany: contact?.company,
      contactEmail: contact?.email,
      portalAccountId: initial?.portalAccountId ?? null,
      projectType,
      description: description.trim(),
      budget: budget.trim() || null,
      timeline: timeline.trim() || null,
      status,
      source: initial?.source ?? 'ops',
      internalNotes: internalNotes.trim() || null,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assets: initial?.assets,
    }

    try {
      await onSave(payload)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save request.')
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="sr-contact">Client</label>
          <select
            id="sr-contact"
            className={inputCls}
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            required
          >
            {contacts.length === 0 ? (
              <option value="">No contacts — add one in CRM first</option>
            ) : (
              contacts.map((contact) => (
                <option key={contact.id} value={contact.id}>
                  {contact.company || contact.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div>
          <label className={labelCls} htmlFor="sr-type">Request type</label>
          <select
            id="sr-type"
            className={inputCls}
            value={projectType}
            onChange={(e) => setProjectType(e.target.value)}
          >
            {SERVICE_REQUEST_PROJECT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className={labelCls} htmlFor="sr-description">Client request</label>
        <textarea
          id="sr-description"
          className={`${inputCls} min-h-[120px] resize-y`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          placeholder="What does the client need?"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls} htmlFor="sr-budget">Budget</label>
          <input
            id="sr-budget"
            className={inputCls}
            value={budget ?? ''}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. $2,000 – $5,000"
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="sr-timeline">Timeline</label>
          <input
            id="sr-timeline"
            className={inputCls}
            value={timeline ?? ''}
            onChange={(e) => setTimeline(e.target.value)}
            placeholder="e.g. Before Q3"
          />
        </div>
      </div>

      {editing && (
        <div>
          <label className={labelCls} htmlFor="sr-status">Status</label>
          <select
            id="sr-status"
            className={inputCls}
            value={status}
            onChange={(e) => setStatus(e.target.value as ServiceRequestStatus)}
          >
            {SERVICE_REQUEST_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className={labelCls} htmlFor="sr-notes">Internal notes</label>
        <textarea
          id="sr-notes"
          className={`${inputCls} min-h-[88px] resize-y`}
          value={internalNotes ?? ''}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Team-only notes — not visible to the client"
        />
      </div>

      {error && <p className="text-sm text-red-300">{error}</p>}

      <div className="flex flex-wrap gap-2 justify-end pt-2">
        <Btn type="button" variant="ghost" onClick={onClose} disabled={saving}>
          Cancel
        </Btn>
        <Btn type="submit" disabled={saving || contacts.length === 0}>
          {saving ? 'Saving…' : editing ? 'Save changes' : 'Create request'}
        </Btn>
      </div>
    </form>
  )
}
