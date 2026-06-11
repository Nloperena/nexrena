'use client'

import { useEffect, useState } from 'react'
import type { PortalSubscription } from '@/lib/portal-types'
import {
  cancelPortalSubscription,
  createPortalSubscriptionCheckout,
  fetchPortalSubscriptions,
} from '@/lib/portal-client'
import { formatCurrency } from '@/lib/store'
import { Btn } from '@/components/ui'

function intervalSuffix(interval: string): string {
  if (interval === 'monthly') return '/mo'
  if (interval === 'quarterly') return '/qtr'
  if (interval === 'annually') return '/yr'
  return ''
}

type Props = {
  stripeEnabled?: boolean
  onError: (message: string | null) => void
  onMessage: (message: string) => void
}

export function PortalSubscriptionsSection({ stripeEnabled = true, onError, onMessage }: Props) {
  const [subs, setSubs] = useState<PortalSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [subscribing, setSubscribing] = useState(false)

  const load = () =>
    fetchPortalSubscriptions()
      .then(setSubs)
      .catch(() => setSubs([]))

  useEffect(() => {
    load().finally(() => setLoading(false))
  }, [])

  const activeSubs = subs.filter((s) => s.status === 'active')
  const needsAutopay = activeSubs.filter((s) => !s.autopay)
  const autopayTotal = needsAutopay.reduce((sum, s) => sum + s.amount, 0)
  const confirmSub = activeSubs.find((s) => s.id === confirmId)

  const handleSubscribe = async () => {
    if (needsAutopay.length === 0) return
    setSubscribing(true)
    onError(null)
    try {
      const { url } = await createPortalSubscriptionCheckout(needsAutopay.map((s) => s.id))
      if (url) window.location.href = url
      else onError('Could not start subscription checkout.')
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not start autopay setup.')
    } finally {
      setSubscribing(false)
    }
  }

  const handleCancel = async () => {
    if (!confirmId) return
    setCancellingId(confirmId)
    onError(null)
    try {
      await cancelPortalSubscription(confirmId)
      await load()
      onMessage('Subscription cancelled.')
      setConfirmId(null)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Could not cancel subscription.')
    } finally {
      setCancellingId(null)
    }
  }

  if (loading) {
    return <p className="text-xs text-slate-600">Loading subscriptions…</p>
  }

  if (activeSubs.length === 0) {
    return null
  }

  return (
    <>
      <div className="my-6 border-t border-slate-800/60" />
      <p className="text-[10px] uppercase tracking-widest text-slate-500">Active subscriptions</p>

      {needsAutopay.length > 0 && stripeEnabled && (
        <div className="mt-3 rounded-lg border border-gold/20 bg-gold/5 p-4 space-y-3">
          <p className="text-sm text-slate-300">
            Enable autopay for {needsAutopay.length} service{needsAutopay.length > 1 ? 's' : ''} (
            {formatCurrency(autopayTotal)}/mo total). Your card will be charged automatically each
            billing cycle.
          </p>
          <Btn type="button" size="sm" disabled={subscribing} onClick={handleSubscribe}>
            {subscribing ? 'Redirecting…' : `Set up autopay — ${formatCurrency(autopayTotal)}/mo`}
          </Btn>
        </div>
      )}

      <div className="space-y-3 mt-3">
        {activeSubs.map((sub) => (
          <div key={sub.id} className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="text-sm text-slate-400">
              {sub.description}{' '}
              <span className="text-slate-500 tabular-nums">
                ({formatCurrency(sub.amount)}
                {intervalSuffix(sub.interval)})
              </span>
              {sub.autopay ? (
                <span className="ml-2 text-[10px] uppercase tracking-wider text-emerald-400/90">
                  Autopay on
                </span>
              ) : (
                <span className="ml-2 text-[10px] uppercase tracking-wider text-amber-400/90">
                  Manual billing
                </span>
              )}
            </p>
            <button
              type="button"
              onClick={() => setConfirmId(sub.id)}
              className="text-[11px] text-slate-600 hover:text-red-400/90 transition-colors"
            >
              Cancel subscription
            </button>
          </div>
        ))}

        {confirmSub && (
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/40 p-4 space-y-3">
            <p className="text-sm text-slate-300">
              Cancel {confirmSub.description} ({formatCurrency(confirmSub.amount)}
              {intervalSuffix(confirmSub.interval)})?
            </p>
            <p className="text-xs text-slate-500">
              {confirmSub.autopay
                ? 'Stripe will stop future automatic charges for this service.'
                : 'Future invoices for this service will stop. Contact Nexrena if you need help.'}
            </p>
            <div className="flex justify-end gap-2">
              <Btn type="button" size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                Keep subscription
              </Btn>
              <Btn
                type="button"
                size="sm"
                variant="ghost"
                disabled={cancellingId === confirmSub.id}
                onClick={handleCancel}
              >
                {cancellingId === confirmSub.id ? 'Cancelling…' : 'Yes, cancel'}
              </Btn>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
