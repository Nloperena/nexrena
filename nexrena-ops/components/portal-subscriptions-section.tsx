'use client'

import { useEffect, useState } from 'react'
import type { PortalSubscription } from '@/lib/portal-types'
import { cancelPortalSubscription, fetchPortalSubscriptions } from '@/lib/portal-client'
import { formatCurrency } from '@/lib/store'
import { Btn } from '@/components/ui'

function intervalSuffix(interval: string): string {
  if (interval === 'monthly') return '/mo'
  if (interval === 'quarterly') return '/qtr'
  if (interval === 'annually') return '/yr'
  return ''
}

type Props = {
  onError: (message: string | null) => void
  onMessage: (message: string) => void
}

export function PortalSubscriptionsSection({ onError, onMessage }: Props) {
  const [subs, setSubs] = useState<PortalSubscription[]>([])
  const [loading, setLoading] = useState(true)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  useEffect(() => {
    fetchPortalSubscriptions()
      .then(setSubs)
      .catch(() => setSubs([]))
      .finally(() => setLoading(false))
  }, [])

  const activeSubs = subs.filter((s) => s.status === 'active')

  const confirmSub = activeSubs.find((s) => s.id === confirmId)

  const handleCancel = async () => {
    if (!confirmId) return
    setCancellingId(confirmId)
    onError(null)
    try {
      await cancelPortalSubscription(confirmId)
      setSubs((prev) => prev.filter((s) => s.id !== confirmId))
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
      <div className="space-y-3">
      {activeSubs.map((sub) => (
        <div key={sub.id} className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-sm text-slate-400">
            {sub.description}{' '}
            <span className="text-slate-500 tabular-nums">
              ({formatCurrency(sub.amount)}{intervalSuffix(sub.interval)})
            </span>
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
            Future invoices for this service will stop. Contact Nexrena if you need help.
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
