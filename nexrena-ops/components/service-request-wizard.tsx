'use client'

import { useMemo, useState } from 'react'
import { Btn } from '@/components/ui'
import { portalFocusRing, portalLabelClass, portalSectionHintClass } from '@/lib/portal-a11y'
import { teamSurfaceCard, teamSurfaceInset } from '@/lib/team-design'
import { createPortalServiceRequest } from '@/lib/portal-client'
import type { PortalServiceRequest } from '@/lib/portal-types'
import { REQUEST_TYPE_OPTIONS, type RequestTypeOption } from '@/components/request-type-visuals'

type Step = 'service' | 'details' | 'budget' | 'timeline' | 'review'

const STEPS: Step[] = ['service', 'details', 'budget', 'timeline', 'review']
const STEP_LABELS: Record<Step, string> = {
  service: 'Choose a service',
  details: 'Describe your needs',
  budget: 'Budget',
  timeline: 'Timeline',
  review: 'Review & send',
}

type Props = {
  onCreated: (request: PortalServiceRequest) => void
  onSuccess?: () => void
}

export function ServiceRequestWizard({ onCreated, onSuccess }: Props) {
  const [step, setStep] = useState<Step>('service')
  const [choice, setChoice] = useState<RequestTypeOption | null>(null)
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [timeline, setTimeline] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const stepIndex = STEPS.indexOf(step)
  const progress = ((stepIndex + 1) / STEPS.length) * 100

  const canContinue = useMemo(() => {
    if (step === 'service') return choice != null
    if (step === 'details') return description.trim().length >= 8
    return true
  }, [step, choice, description])

  const goNext = () => {
    const i = STEPS.indexOf(step)
    if (i < STEPS.length - 1) setStep(STEPS[i + 1]!)
  }

  const goBack = () => {
    const i = STEPS.indexOf(step)
    if (i > 0) setStep(STEPS[i - 1]!)
  }

  const submit = async () => {
    if (!choice || description.trim().length < 8) return
    setLoading(true)
    setError(null)
    try {
      const row = await createPortalServiceRequest({
        projectType: choice.projectType,
        description: `[${choice.label}] ${description.trim()}`,
        budget: budget.trim() || undefined,
        timeline: timeline.trim() || undefined,
      })
      onCreated(row)
      setDone(true)
      onSuccess?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send request.')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <div className={`${teamSurfaceCard} p-8 text-center space-y-4`}>
        <p className="text-4xl" aria-hidden>✓</p>
        <h3 className="font-serif text-2xl text-white">Request sent</h3>
        <p className={portalSectionHintClass}>
          Nico will follow up in Messages. You can track status under Recent requests.
        </p>
        <Btn
          size="lg"
          onClick={() => {
            setDone(false)
            setStep('service')
            setChoice(null)
            setDescription('')
            setBudget('')
            setTimeline('')
          }}
        >
          Submit another request
        </Btn>
      </div>
    )
  }

  return (
    <div className={`${teamSurfaceCard} overflow-hidden`}>
      {/* Progress */}
      <div className="px-5 pt-5 pb-3 border-b border-slate-700/30 bg-[#181d26]">
        <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
          <span>Step {stepIndex + 1} of {STEPS.length}</span>
          <span className="text-slate-500">{STEP_LABELS[step]}</span>
        </div>
        <div className={`h-2 rounded-full ${teamSurfaceInset} overflow-hidden`}>
          <div
            className="h-full bg-gold rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(201,169,110,0.4)]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="p-5 md:p-8 space-y-6">
        {step === 'service' && (
          <>
            <div>
              <h3 className="font-serif text-2xl text-white">What can we help with?</h3>
              <p className={`${portalSectionHintClass} mt-2`}>Pick one — you can add details on the next step.</p>
            </div>
            <ul className="space-y-3" role="listbox" aria-label="Service type">
              {REQUEST_TYPE_OPTIONS.map((option) => {
                const selected = choice?.id === option.id
                const Icon = option.Icon
                return (
                  <li key={option.id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => setChoice(option)}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${portalFocusRing} ${
                        selected
                          ? 'bg-gold/15 border-2 border-gold shadow-[0_4px_20px_rgba(201,169,110,0.15)]'
                          : 'bg-[#151920] border-2 border-slate-700/50 hover:border-slate-500 shadow-[0_2px_12px_rgba(0,0,0,0.25)]'
                      }`}
                    >
                      <div className="w-14 h-14 shrink-0 rounded-xl bg-[#0e1116] p-2 shadow-inner">
                        <Icon selected={selected} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-lg font-semibold text-white">{option.label}</p>
                        <p className="text-base text-slate-400">{option.tagline}</p>
                      </div>
                      <span className={`text-xl shrink-0 ${selected ? 'text-gold' : 'text-slate-600'}`}>
                        {selected ? '●' : '○'}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {step === 'details' && choice && (
          <>
            <div>
              <h3 className="font-serif text-2xl text-white">Tell us what you need</h3>
              <p className={`${portalSectionHintClass} mt-2`}>
                {choice.label} — {choice.tagline}
              </p>
            </div>
            <div>
              <label className={portalLabelClass} htmlFor="request-description">
                Your request
              </label>
              <textarea
                id="request-description"
                required
                rows={5}
                autoFocus
                className="w-full bg-[#0e1116] border-2 border-slate-600/50 rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/25 min-h-[140px] resize-y"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={choice.placeholder}
              />
              <p className="text-sm text-slate-500 mt-2">At least a sentence or two helps us quote accurately.</p>
            </div>
          </>
        )}

        {step === 'budget' && (
          <>
            <div>
              <h3 className="font-serif text-2xl text-white">Do you have a budget in mind?</h3>
              <p className={`${portalSectionHintClass} mt-2`}>Optional — skip if you are not sure yet.</p>
            </div>
            <div>
              <label className={portalLabelClass} htmlFor="request-budget">Budget range</label>
              <input
                id="request-budget"
                className="w-full bg-[#0e1116] border-2 border-slate-600/50 rounded-xl px-4 py-3 text-base text-white min-h-[52px] focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/25"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. $2,000 – $5,000"
              />
            </div>
          </>
        )}

        {step === 'timeline' && (
          <>
            <div>
              <h3 className="font-serif text-2xl text-white">When do you need this?</h3>
              <p className={`${portalSectionHintClass} mt-2`}>Optional — skip if timing is flexible.</p>
            </div>
            <div>
              <label className={portalLabelClass} htmlFor="request-timeline">Target date or timeframe</label>
              <input
                id="request-timeline"
                className="w-full bg-[#0e1116] border-2 border-slate-600/50 rounded-xl px-4 py-3 text-base text-white min-h-[52px] focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/25"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g. Before holiday season, or Q3 2026"
              />
            </div>
          </>
        )}

        {step === 'review' && choice && (
          <>
            <div>
              <h3 className="font-serif text-2xl text-white">Review your request</h3>
              <p className={`${portalSectionHintClass} mt-2`}>Make sure everything looks right before sending.</p>
            </div>
            <dl className={`${teamSurfaceInset} divide-y divide-slate-700/40 rounded-xl overflow-hidden text-base`}>
              <div className="px-4 py-3 flex justify-between gap-4">
                <dt className="text-slate-400 shrink-0">Service</dt>
                <dd className="text-white text-right font-medium">{choice.label}</dd>
              </div>
              <div className="px-4 py-3">
                <dt className="text-slate-400 mb-1">Details</dt>
                <dd className="text-white whitespace-pre-wrap">{description.trim()}</dd>
              </div>
              {budget.trim() && (
                <div className="px-4 py-3 flex justify-between gap-4">
                  <dt className="text-slate-400">Budget</dt>
                  <dd className="text-white text-right">{budget.trim()}</dd>
                </div>
              )}
              {timeline.trim() && (
                <div className="px-4 py-3 flex justify-between gap-4">
                  <dt className="text-slate-400">Timeline</dt>
                  <dd className="text-white text-right">{timeline.trim()}</dd>
                </div>
              )}
            </dl>
            {error && <p className="text-base text-red-300" role="alert">{error}</p>}
          </>
        )}

        {/* Navigation */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-slate-700/30">
          <div className="flex gap-2">
            {stepIndex > 0 && (
              <Btn type="button" variant="ghost" size="lg" onClick={goBack} disabled={loading}>
                Back
              </Btn>
            )}
            {(step === 'budget' || step === 'timeline') && (
              <Btn type="button" variant="ghost" size="lg" onClick={goNext} disabled={loading}>
                Skip
              </Btn>
            )}
          </div>
          {step === 'review' ? (
            <Btn type="button" size="lg" disabled={loading} onClick={submit}>
              {loading ? 'Sending…' : 'Send request'}
            </Btn>
          ) : (
            <Btn type="button" size="lg" disabled={!canContinue} onClick={goNext}>
              Continue
            </Btn>
          )}
        </div>
      </div>
    </div>
  )
}
