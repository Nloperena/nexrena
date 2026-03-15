'use client'
import { useState } from 'react'
import { useSubscriptions, useContacts, formatCurrency, formatDate } from '@/lib/store'
import { Subscription, SubscriptionStatus } from '@/lib/types'
import { PageHeader, Badge, Btn, Modal, StatCard, SectionCard, EmptyState } from '@/components/ui'
import { SubscriptionForm } from '@/components/subscription-form'

const STATUS_ORDER: SubscriptionStatus[] = ['active', 'paused', 'cancelled']

function intervalLabel(interval: string) {
  return interval.charAt(0).toUpperCase() + interval.slice(1)
}

export default function SubscriptionsPage() {
  const { subscriptions, add, edit, remove, runBilling } = useSubscriptions()
  const { contacts } = useContacts()
  const [modal, setModal] = useState<null | 'add' | Subscription>(null)
  const [filter, setFilter] = useState<'all' | SubscriptionStatus>('all')
  const [billingMsg, setBillingMsg] = useState<string | null>(null)
  const [billingRunning, setBillingRunning] = useState(false)

  const today = new Date().toISOString().slice(0, 10)

  const activeSubs = subscriptions.filter(s => s.status === 'active')
  const monthlyMRR = activeSubs.reduce((sum, s) => {
    if (s.interval === 'monthly') return sum + s.amount
    if (s.interval === 'quarterly') return sum + s.amount / 3
    if (s.interval === 'annually') return sum + s.amount / 12
    return sum
  }, 0)
  const dueCount = activeSubs.filter(s => !s.skipNext && s.nextBillingDate <= today).length

  const filtered = subscriptions.filter(s =>
    filter === 'all' ? true : s.status === filter
  )

  const handleTogglePause = (s: Subscription) => {
    edit({ ...s, status: s.status === 'active' ? 'paused' : 'active' })
  }

  const handleToggleSkip = (s: Subscription) => {
    edit({ ...s, skipNext: !s.skipNext })
  }

  const handleRunBilling = async () => {
    setBillingRunning(true)
    setBillingMsg(null)
    try {
      const result = await runBilling()
      setBillingMsg(`Generated ${result.generated} invoice${result.generated !== 1 ? 's' : ''}${result.skipped ? `, skipped ${result.skipped}` : ''}${result.errors.length ? `. ${result.errors.length} error(s).` : '.'}`)
    } catch {
      setBillingMsg('Billing run failed. Check the API logs.')
    } finally {
      setBillingRunning(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Subscriptions"
        sub={`${activeSubs.length} active · ${formatCurrency(monthlyMRR)}/mo MRR`}
        action={
          <div className="flex gap-2">
            {dueCount > 0 && (
              <Btn variant="ghost" onClick={handleRunBilling} disabled={billingRunning}>
                {billingRunning ? 'Running…' : `Run Billing (${dueCount} due)`}
              </Btn>
            )}
            <Btn onClick={() => setModal('add')}>+ New Subscription</Btn>
          </div>
        }
      />

      {billingMsg && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-emerald-950/40 border border-emerald-800/30 text-emerald-300 text-sm flex items-center justify-between">
          <span>{billingMsg}</span>
          <button onClick={() => setBillingMsg(null)} className="text-emerald-600 hover:text-emerald-300 ml-4">×</button>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-10 stagger">
        <StatCard label="Monthly MRR" value={formatCurrency(monthlyMRR)} gold />
        <StatCard label="Active Subscriptions" value={String(activeSubs.length)} />
        <StatCard label="Due for Billing" value={String(dueCount)}
          sub={dueCount > 0 ? 'Invoices will auto-generate on the 1st' : 'Nothing due today'} />
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6">
        {(['all', ...STATUS_ORDER] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filter === s
                ? 'bg-slate-800 text-white'
                : 'text-slate-500 hover:text-slate-300'
            }`}>
            {s === 'all' ? `All (${subscriptions.length})` : `${intervalLabel(s)} (${subscriptions.filter(x => x.status === s).length})`}
          </button>
        ))}
      </div>

      <SectionCard>
        {filtered.length === 0 ? (
          <EmptyState
            message="No subscriptions yet"
            action={() => setModal('add')}
            actionLabel="Add your first subscription"
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800/60">
                {['Client', 'Description', 'Amount', 'Interval', 'Next Billing', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-[10px] text-slate-500 tracking-[0.15em] uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id} className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/20 transition-colors group">
                  <td className="px-5 py-4">
                    <p className="text-sm text-white font-medium">{s.contactName ?? '—'}</p>
                    {s.contactCompany && <p className="text-xs text-slate-500">{s.contactCompany}</p>}
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-300">{s.description}</td>
                  <td className="px-5 py-4 text-sm text-gold font-medium tabular-nums">{formatCurrency(s.amount)}</td>
                  <td className="px-5 py-4"><Badge label={s.interval} /></td>
                  <td className="px-5 py-4">
                    <p className={`text-sm tabular-nums ${s.nextBillingDate <= today && s.status === 'active' ? 'text-amber-400' : 'text-slate-400'}`}>
                      {formatDate(s.nextBillingDate)}
                    </p>
                    {s.skipNext && <p className="text-[10px] text-slate-600 mt-0.5">Skipping next cycle</p>}
                  </td>
                  <td className="px-5 py-4"><Badge label={s.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setModal(s)}
                        className="text-xs text-slate-400 hover:text-white transition-colors">Edit</button>
                      {s.status !== 'cancelled' && (
                        <button onClick={() => handleTogglePause(s)}
                          className="text-xs text-slate-400 hover:text-amber-300 transition-colors">
                          {s.status === 'active' ? 'Pause' : 'Resume'}
                        </button>
                      )}
                      {s.status === 'active' && (
                        <button onClick={() => handleToggleSkip(s)}
                          className={`text-xs transition-colors ${s.skipNext ? 'text-amber-400 hover:text-white' : 'text-slate-400 hover:text-amber-300'}`}>
                          {s.skipNext ? 'Unskip' : 'Skip next'}
                        </button>
                      )}
                      <button onClick={() => remove(s.id)}
                        className="text-xs text-slate-600 hover:text-red-400 transition-colors">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>

      {modal && (
        <Modal
          title={modal === 'add' ? 'New Subscription' : 'Edit Subscription'}
          onClose={() => setModal(null)}
          wide
        >
          <SubscriptionForm
            initial={modal === 'add' ? undefined : modal}
            onSave={modal === 'add' ? add : edit}
            onClose={() => setModal(null)}
            contacts={contacts}
          />
        </Modal>
      )}
    </div>
  )
}
