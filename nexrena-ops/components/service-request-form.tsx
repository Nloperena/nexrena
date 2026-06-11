'use client'

import { useState } from 'react'
import { Btn, Field, inputCls } from '@/components/ui'
import { createPortalServiceRequest } from '@/lib/portal-client'
import type { PortalServiceRequest } from '@/lib/portal-types'
import { REQUEST_TYPE_OPTIONS } from '@/components/request-type-visuals'
import { RequestTypePicker } from '@/components/request-type-picker'

type Props = {
  onCreated: (request: PortalServiceRequest) => void
  onSuccess?: () => void
  variant?: 'modal' | 'inline'
}

export function ServiceRequestForm({ onCreated, onSuccess, variant = 'modal' }: Props) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const canSubmit =
    selectedIndex != null &&
    REQUEST_TYPE_OPTIONS[selectedIndex] != null &&
    description.trim().length >= 8

  const resetForm = () => {
    setSelectedIndex(null)
    setDescription('')
    setBudget('')
    setTimeline('')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const choice = selectedIndex != null ? REQUEST_TYPE_OPTIONS[selectedIndex] : null
    if (!choice || !canSubmit) return
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const row = await createPortalServiceRequest({
        projectType: choice.projectType,
        description: `[${choice.label}] ${description.trim()}`,
        budget: budget.trim() || undefined,
        timeline: timeline.trim() || undefined,
      })
      onCreated(row)
      resetForm()
      setSuccess(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send request.')
    } finally {
      setLoading(false)
    }
  }

  if (selectedIndex == null) {
    return (
      <div className="space-y-4">
        <RequestTypePicker
          selectedIndex={null}
          onSelect={(index) => {
            setSuccess(false)
            setSelectedIndex(index)
          }}
        />
        {success && (
          <p className="text-sm text-emerald-400 text-center sm:text-left">
            Sent — Nico will follow up in Messages.
          </p>
        )}
      </div>
    )
  }

  const choice = REQUEST_TYPE_OPTIONS[selectedIndex]
  if (!choice) return null

  const ChoiceIcon = choice.Icon

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 shrink-0">
            {ChoiceIcon && <ChoiceIcon selected />}
          </div>
          <div className="min-w-0">
            <p className="font-serif text-lg text-white">{choice.label}</p>
            <p className="text-xs text-slate-500">{choice.tagline}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={resetForm}
          className="text-xs text-slate-500 hover:text-gold transition-colors shrink-0"
        >
          ← Change choice
        </button>
      </div>

      <Field label="What do you need?">
        <textarea
          required
          rows={variant === 'inline' ? 3 : 4}
          className={`${inputCls} min-h-[96px] resize-y`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={choice.placeholder}
          autoFocus
        />
      </Field>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Budget (optional)">
          <input
            className={inputCls}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. $2k–$5k"
          />
        </Field>
        <Field label="Timeline (optional)">
          <input
            className={inputCls}
            value={timeline}
            onChange={(e) => setTimeline(e.target.value)}
            placeholder="e.g. Launch by August"
          />
        </Field>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}
      {success && (
        <p className="text-sm text-emerald-400">Sent — Nico will follow up in Messages.</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Btn type="submit" disabled={loading || !canSubmit}>
          {loading ? 'Sending…' : 'Send request'}
        </Btn>
        {variant === 'inline' && success && (
          <span className="text-xs text-slate-500">Track it below in Recent requests.</span>
        )}
      </div>
    </form>
  )
}
