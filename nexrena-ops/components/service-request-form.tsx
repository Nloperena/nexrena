'use client'

import { useState } from 'react'
import { Btn, Field, inputCls, selectCls } from '@/components/ui'
import { createPortalServiceRequest } from '@/lib/portal-client'
import type { PortalServiceRequest } from '@/lib/portal-types'

const PROJECT_TYPES = [
  { value: 'web', label: 'Website / landing page' },
  { value: 'seo', label: 'SEO / content' },
  { value: 'both', label: 'Web + SEO' },
  { value: 'hosting', label: 'Hosting / maintenance' },
  { value: 'other', label: 'Other' },
]

type Props = {
  onCreated: (request: PortalServiceRequest) => void
  onSuccess?: () => void
}

export function ServiceRequestForm({ onCreated, onSuccess }: Props) {
  const [projectType, setProjectType] = useState('web')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const row = await createPortalServiceRequest({
        projectType,
        description: description.trim(),
        budget: budget.trim() || undefined,
        timeline: timeline.trim() || undefined,
      })
      onCreated(row)
      setDescription('')
      setBudget('')
      setTimeline('')
      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit request.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="What do you need?">
        <select className={selectCls} value={projectType} onChange={(e) => setProjectType(e.target.value)}>
          {PROJECT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </Field>
      <Field label="Describe the work">
        <textarea
          required
          rows={4}
          className={inputCls}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Goals, pages, integrations, brand notes…"
        />
      </Field>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Budget (optional)">
          <input className={inputCls} value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="$3k–$5k" />
        </Field>
        <Field label="Timeline (optional)">
          <input className={inputCls} value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="Launch by Q3" />
        </Field>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && <p className="text-sm text-emerald-400">Request submitted — we&apos;ll follow up shortly.</p>}
      <Btn type="submit" disabled={loading}>{loading ? 'Submitting…' : 'Submit request'}</Btn>
    </form>
  )
}
