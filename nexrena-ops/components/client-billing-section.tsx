'use client'

import { useState } from 'react'
import type { PortalInvoice } from '@/lib/portal-types'
import {
  computeOutstandingBalance,
  countInvoicesByStatus,
  effectiveInvoiceStatus,
  getOldestUnpaidInvoice,
  invoicePhaseLabel,
  sortInvoicesNewestFirst,
} from '@/lib/portal-dashboard-utils'
import { formatCurrency, formatDate } from '@/lib/store'
import { Button, Card, SectionHeader } from '@/components/design-system'
import { StatusChip, invoiceStatusChip } from '@/components/status-chip'
import { portalMutedClass, portalSectionHintClass } from '@/lib/portal-a11y'
import { typography } from '@/lib/design-tokens'

type Props = {
  invoices: PortalInvoice[]
  stripeEnabled: boolean
  payingId: string | null
  viewLoading: boolean
  paymentError?: string | null
  onPay: (id: string) => void
  onView: (id: string) => void
  onMessageNico?: () => void
  mode?: 'summary' | 'history'
}

function ClientInvoiceCard({
  inv,
  stripeEnabled,
  payingId,
  viewLoading,
  onPay,
  onView,
}: {
  inv: PortalInvoice
  stripeEnabled: boolean
  payingId: string | null
  viewLoading: boolean
  onPay: (id: string) => void
  onView: (id: string) => void
}) {
  const status = effectiveInvoiceStatus(inv)
  const chip = invoiceStatusChip(status, inv.dueDate)
  const phaseLabel = invoicePhaseLabel(inv.invoicePhase)
  const canPay = stripeEnabled && (status === 'sent' || status === 'overdue')
  const isPaying = payingId === inv.id

  return (
    <Card variant="client" className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-serif text-lg text-white">{inv.number}</p>
          {phaseLabel ? (
            <p className="text-sm text-gold-light mt-0.5">{phaseLabel}</p>
          ) : inv.projectName ? (
            <p className={`${typography.hint} truncate`}>{inv.projectName}</p>
          ) : null}
        </div>
        {chip && <StatusChip variant={chip} />}
      </div>
      <p className="font-serif text-2xl text-white tabular-nums">{formatCurrency(inv.total)}</p>
      {status === 'overdue' && (
        <p className="text-sm font-medium text-red-300">Overdue since {formatDate(inv.dueDate)}</p>
      )}
      {status === 'sent' && <p className={typography.hint}>Due {formatDate(inv.dueDate)}</p>}
      {status === 'paid' && inv.paidDate && (
        <p className="text-sm text-emerald-300">Paid {formatDate(inv.paidDate)}</p>
      )}
      <div className="flex flex-wrap gap-2 pt-1">
        {status === 'paid' ? (
          <Button size="sm" variant="ghost" disabled={viewLoading} onClick={() => onView(inv.id)}>
            Receipt
          </Button>
        ) : canPay ? (
          <Button size="sm" disabled={isPaying} onClick={() => onPay(inv.id)}>
            {isPaying ? '…' : 'Pay now'}
          </Button>
        ) : null}
        {status !== 'paid' && (
          <Button size="sm" variant="ghost" disabled={viewLoading} onClick={() => onView(inv.id)}>
            View
          </Button>
        )}
      </div>
    </Card>
  )
}

function BillingHelpLink({ onMessageNico }: { onMessageNico?: () => void }) {
  return (
    <p className={portalMutedClass}>
      Questions about billing?{' '}
      {onMessageNico ? (
        <button
          type="button"
          onClick={onMessageNico}
          className="text-gold-light hover:text-white underline underline-offset-2"
        >
          Message Nico
        </button>
      ) : (
        <span className="text-gold">Message Nico</span>
      )}
    </p>
  )
}

export function ClientBillingSection({
  invoices,
  stripeEnabled,
  payingId,
  viewLoading,
  paymentError,
  onPay,
  onView,
  onMessageNico,
  mode = 'summary',
}: Props) {
  const sorted = sortInvoicesNewestFirst(invoices)
  const unpaid = sorted.filter((i) => effectiveInvoiceStatus(i) !== 'paid')
  const paid = sorted.filter((i) => effectiveInvoiceStatus(i) === 'paid')
  const { outstanding, paid: paidCount } = countInvoicesByStatus(invoices)
  const balance = computeOutstandingBalance(invoices)
  const oldestUnpaid = getOldestUnpaidInvoice(invoices)
  const showBillingHelp = (!stripeEnabled && outstanding > 0) || Boolean(paymentError)
  const [paidOpen, setPaidOpen] = useState(false)

  const payBalance = () => {
    if (!oldestUnpaid || !stripeEnabled) return
    onPay(oldestUnpaid.id)
  }

  if (mode === 'history') {
    if (sorted.length === 0) {
      return <p className={portalMutedClass}>No invoices yet.</p>
    }

    return (
      <div className="space-y-6">
        {unpaid.length > 0 && (
          <div>
            <SectionHeader title="Unpaid" hint={`${unpaid.length} invoice${unpaid.length > 1 ? 's' : ''} need attention`} compact />
            <ul className="space-y-3">
              {unpaid.map((inv) => (
                <li key={inv.id}>
                  <ClientInvoiceCard
                    inv={inv}
                    stripeEnabled={stripeEnabled}
                    payingId={payingId}
                    viewLoading={viewLoading}
                    onPay={onPay}
                    onView={onView}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
        {paid.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setPaidOpen((v) => !v)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-700/50 bg-slate-900/40 px-4 py-3 min-h-[44px] text-left md:pointer-events-none md:border-0 md:bg-transparent md:px-0 md:py-0"
              aria-expanded={paidOpen}
            >
              <SectionHeader title="Paid" hint={`${paid.length} receipt${paid.length > 1 ? 's' : ''}`} compact />
              <span className="text-gold text-sm md:hidden">{paidOpen ? 'Hide' : 'Show'}</span>
            </button>
            <ul className={`space-y-3 ${paidOpen ? 'block' : 'hidden'} md:block`}>
              {paid.map((inv) => (
                <li key={inv.id}>
                  <ClientInvoiceCard
                    inv={inv}
                    stripeEnabled={stripeEnabled}
                    payingId={payingId}
                    viewLoading={viewLoading}
                    onPay={onPay}
                    onView={onView}
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    )
  }

  return (
    <section id="billing">
      <SectionHeader title="Billing" hint="Outstanding balance and quick pay" />

      <Card variant="client" className="space-y-4">
        <div>
          <p className="font-serif text-3xl text-white tabular-nums">{formatCurrency(balance)}</p>
          <p className={`${typography.body} mt-1 text-base`}>Outstanding balance</p>
          <p className={`${typography.hint} mt-1`}>
            {outstanding} unpaid · {paidCount} paid
          </p>
        </div>

        {balance > 0 && (
          <Button size="lg" disabled={!stripeEnabled || payingId !== null} onClick={payBalance}>
            {payingId ? 'Starting checkout…' : 'Pay balance'}
          </Button>
        )}

        {balance === 0 && sorted.length > 0 && (
          <p className="text-base text-emerald-300">All caught up — nothing due.</p>
        )}

        {sorted.length === 0 && <p className={portalMutedClass}>No invoices yet.</p>}

        {!stripeEnabled && outstanding > 0 && (
          <p className={portalSectionHintClass}>
            Online pay coming soon — message us to settle your balance.
          </p>
        )}

        {showBillingHelp && <BillingHelpLink onMessageNico={onMessageNico} />}
        {paymentError && <p className="text-base text-red-300">{paymentError}</p>}
      </Card>
    </section>
  )
}
