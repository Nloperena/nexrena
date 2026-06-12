'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSubscriptions, useContacts, formatCurrency } from '@/lib/store'
import { Subscription, SubscriptionStatus } from '@/lib/types'
import { PageHeader, Btn, Modal, StatCard, EmptyState } from '@/components/ui'
import { SubscriptionForm } from '@/components/subscription-form'
import { ClientSubscriptionGroups } from '@/components/client-subscription-groups'
import { MobileFilterChip, MobileFilterRow } from '@/components/mobile-filter-row'
import {
  readSubscriptionFilterFromUrl,
  writeSubscriptionFilterToUrl,
  type SubscriptionViewFilter,
} from '@/lib/subscriptions-view-url'

const STATUS_ORDER: SubscriptionStatus[] = ['active', 'paused', 'cancelled']

function intervalLabel(interval: string) {
  return interval.charAt(0).toUpperCase() + interval.slice(1)
}

export default function SubscriptionsPage() {
  const { subscriptions, add, edit, patch, remove, runBilling } = useSubscriptions()
  const { contacts } = useContacts()
  const [modal, setModal] = useState<null | 'add' | Subscription>(null)
  const [filter, setFilterState] = useState<SubscriptionViewFilter>('all')
  const [filterReady, setFilterReady] = useState(false)
  const [billingMsg, setBillingMsg] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [billingRunning, setBillingRunning] = useState(false)

  useEffect(() => {
    setFilterState(readSubscriptionFilterFromUrl())
    setFilterReady(true)
    const onPopState = () => setFilterState(readSubscriptionFilterFromUrl())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const setFilter = useCallback((next: SubscriptionViewFilter) => {
    setFilterState(next)
    writeSubscriptionFilterToUrl(next)
  }, [])

  const today = new Date().toISOString().slice(0, 10)

  const activeSubs = subscriptions.filter((s) => s.status === 'active')
  const monthlyMRR = activeSubs.reduce((sum, s) => {
    if (s.interval === 'monthly') return sum + s.amount
    if (s.interval === 'quarterly') return sum + s.amount / 3
    if (s.interval === 'annually') return sum + s.amount / 12
    return sum
  }, 0)
  const dueCount = activeSubs.filter((s) => !s.skipNext && s.nextBillingDate <= today).length
  const clientCount = new Set(subscriptions.map((s) => s.contactId).filter(Boolean)).size

  const runAction = async (fn: () => Promise<void>) => {
    setActionError(null)
    try {
      await fn()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Something went wrong. Try again.')
    }
  }

  const handleTogglePause = (s: Subscription) => {
    const nextStatus: SubscriptionStatus =
      s.status === 'active' ? 'paused' : s.status === 'paused' ? 'active' : s.status
    if (nextStatus === s.status) return
    void runAction(() => patch(s.id, { status: nextStatus }))
  }

  const handleToggleSkip = (s: Subscription) => {
    void runAction(() => patch(s.id, { skipNext: !s.skipNext }))
  }

  const handleRunBilling = async () => {
    setBillingRunning(true)
    setBillingMsg(null)
    setActionError(null)
    try {
      const result = await runBilling()
      setBillingMsg(
        `Generated ${result.generated} invoice${result.generated !== 1 ? 's' : ''}${
          result.skipped ? `, skipped ${result.skipped}` : ''
        }${result.errors.length ? `. ${result.errors.length} error(s).` : '.'}`,
      )
    } catch {
      setActionError('Billing run failed. Check the API logs.')
    } finally {
      setBillingRunning(false)
    }
  }

  if (!filterReady) {
    return <div className="min-h-[40vh]" />
  }

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
      <PageHeader
        title="Subscriptions"
        sub={`${clientCount} clients · ${activeSubs.length} active · ${formatCurrency(monthlyMRR)}/mo MRR`}
        action={
          <div className="flex flex-wrap gap-2">
            {dueCount > 0 && (
              <Btn variant="ghost" onClick={handleRunBilling} disabled={billingRunning}>
                {billingRunning ? 'Running…' : `Run Billing (${dueCount} due)`}
              </Btn>
            )}
            <Btn onClick={() => setModal('add')}>+ New Subscription</Btn>
          </div>
        }
      />

      {actionError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-950/40 border border-red-800/40 text-red-300 text-sm flex items-center justify-between">
          <span>{actionError}</span>
          <button type="button" onClick={() => setActionError(null)} className="ml-4 text-red-400 hover:text-red-200">×</button>
        </div>
      )}

      {billingMsg && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 text-sm flex items-center justify-between">
          <span>{billingMsg}</span>
          <button type="button" onClick={() => setBillingMsg(null)} className="text-emerald-600 hover:text-emerald-300 ml-4">
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 md:mb-10 stagger">
        <StatCard label="Monthly MRR" value={formatCurrency(monthlyMRR)} gold />
        <StatCard label="Active Subscriptions" value={String(activeSubs.length)} />
        <StatCard
          label="Due for Billing"
          value={String(dueCount)}
          sub={dueCount > 0 ? 'Invoices will auto-generate on the 1st' : 'Nothing due today'}
        />
      </div>

      <MobileFilterRow className="mb-6">
        {(['all', ...STATUS_ORDER] as const).map((s) => (
          <MobileFilterChip key={s} active={filter === s} onClick={() => setFilter(s)}>
            {s === 'all'
              ? `All (${subscriptions.length})`
              : `${intervalLabel(s)} (${subscriptions.filter((x) => x.status === s).length})`}
          </MobileFilterChip>
        ))}
      </MobileFilterRow>

      {subscriptions.length === 0 ? (
        <EmptyState
          message="No subscriptions yet"
          action={() => setModal('add')}
          actionLabel="Add your first subscription"
        />
      ) : (
        <ClientSubscriptionGroups
          subscriptions={subscriptions}
          filter={filter}
          today={today}
          onEdit={setModal}
          onTogglePause={handleTogglePause}
          onToggleSkip={handleToggleSkip}
          onRemove={(id) => void runAction(() => remove(id))}
        />
      )}

      {modal && (
        <Modal
          title={modal === 'add' ? 'New Subscription' : 'Edit Subscription'}
          onClose={() => setModal(null)}
          wide
        >
          <SubscriptionForm
            initial={modal === 'add' ? undefined : modal}
            onSave={(sub) => void runAction(async () => {
              if (modal === 'add') await add(sub)
              else await edit(sub)
              setModal(null)
            })}
            onClose={() => setModal(null)}
            contacts={contacts}
          />
        </Modal>
      )}
    </div>
  )
}
