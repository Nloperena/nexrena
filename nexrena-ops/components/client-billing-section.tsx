'use client'

import { useState } from 'react'
import type { PortalInvoice } from '@/lib/portal-types'
import {
  computeOutstandingBalance,
  countInvoicesByStatus,
  effectiveInvoiceStatus,
  getOldestUnpaidInvoice,
  portalSectionTitleClass,
  sortInvoicesNewestFirst,
} from '@/lib/portal-dashboard-utils'
import { formatCurrency, formatDate } from '@/lib/store'
import { Btn } from '@/components/ui'

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

type Props = {
  invoices: PortalInvoice[]
  stripeEnabled: boolean
  payingId: string | null
  viewLoading: boolean
  onPay: (id: string) => void
  onView: (id: string) => void
}

function InvoiceRow({
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
  const canPay = stripeEnabled && (status === 'sent' || status === 'overdue')

  return (
    <li className={card}>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="min-w-0">
          <p className="font-serif text-lg text-white">{inv.number}</p>
          {inv.projectName && (
            <p className="text-sm text-slate-400 mt-0.5 truncate">{inv.projectName}</p>
          )}
          <p className="text-base text-white font-medium mt-2 tabular-nums">{formatCurrency(inv.total)}</p>
          {status === 'overdue' && (
            <p className="text-sm font-medium text-red-400 mt-2">
              Overdue since {formatDate(inv.dueDate)}
            </p>
          )}
          {status === 'sent' && (
            <p className="text-sm text-slate-400 mt-2">Due {formatDate(inv.dueDate)}</p>
          )}
          {status === 'paid' && inv.paidDate && (
            <p className="text-sm text-emerald-400/90 mt-2">Paid on {formatDate(inv.paidDate)}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {canPay && (
            <Btn size="sm" disabled={payingId === inv.id} onClick={() => onPay(inv.id)}>
              {payingId === inv.id ? '…' : 'Pay now'}
            </Btn>
          )}
          {status === 'paid' ? (
            <Btn size="sm" variant="ghost" disabled={viewLoading} onClick={() => onView(inv.id)}>
              Receipt
            </Btn>
          ) : (
            <Btn size="sm" variant="ghost" disabled={viewLoading} onClick={() => onView(inv.id)}>
              View
            </Btn>
          )}
        </div>
      </div>
    </li>
  )
}

export function ClientBillingSection({
  invoices,
  stripeEnabled,
  payingId,
  viewLoading,
  onPay,
  onView,
}: Props) {
  const [showAll, setShowAll] = useState(false)
  const sorted = sortInvoicesNewestFirst(invoices)
  const { outstanding, paid } = countInvoicesByStatus(invoices)
  const balance = computeOutstandingBalance(invoices)
  const visible = showAll ? sorted : sorted.slice(0, 3)
  const oldestUnpaid = getOldestUnpaidInvoice(invoices)

  const payBalance = () => {
    if (!oldestUnpaid) return
    if (!stripeEnabled) return
    onPay(oldestUnpaid.id)
  }

  return (
    <section>
      <h3 className={portalSectionTitleClass}>Billing</h3>
      <div className="flex flex-col gap-3 mb-4">
        <div>
          <p className="text-base text-white font-medium tabular-nums">
            Outstanding balance: {formatCurrency(balance)}
          </p>
          <p className="text-sm text-slate-400 mt-1">
            {outstanding} unpaid invoice{outstanding === 1 ? '' : 's'} · {paid} paid
          </p>
        </div>
        {sorted.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {balance > 0 && (
              <Btn
                size="sm"
                disabled={!stripeEnabled || payingId !== null}
                onClick={payBalance}
              >
                {payingId ? '…' : `Pay ${formatCurrency(balance)} balance`}
              </Btn>
            )}
            <Btn
              size="sm"
              variant="ghost"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? 'Show recent only' : 'View all invoices'}
            </Btn>
          </div>
        )}
      </div>

      {!stripeEnabled && outstanding > 0 && (
        <p className="text-xs text-slate-500 mb-3">
          Online payment is not configured — contact us to settle your balance.
        </p>
      )}

      {sorted.length === 0 ? (
        <p className={`${card} text-sm text-slate-500`}>No invoices yet.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {visible.map((inv) => (
              <InvoiceRow
                key={inv.id}
                inv={inv}
                stripeEnabled={stripeEnabled}
                payingId={payingId}
                viewLoading={viewLoading}
                onPay={onPay}
                onView={onView}
              />
            ))}
          </ul>
          {!showAll && sorted.length > 3 && (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-3 text-sm text-slate-500 hover:text-gold transition-colors"
            >
              View invoice history ({sorted.length - 3} more) →
            </button>
          )}
        </>
      )}
    </section>
  )
}
