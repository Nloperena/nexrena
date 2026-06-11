'use client'

import type { PortalInvoice } from '@/lib/portal-types'
import {
  computeOutstandingBalance,
  countInvoicesByStatus,
  effectiveInvoiceStatus,
  getOldestUnpaidInvoice,
  sortInvoicesNewestFirst,
} from '@/lib/portal-dashboard-utils'
import { formatCurrency, formatDate } from '@/lib/store'
import { Btn } from '@/components/ui'
import { StatusChip, invoiceStatusChip } from '@/components/status-chip'

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

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
  const chip = invoiceStatusChip(status, inv.dueDate)
  const canPay = stripeEnabled && (status === 'sent' || status === 'overdue')
  const isPaying = payingId === inv.id

  return (
    <li className={card}>
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-serif text-lg text-white">{inv.number}</p>
            {chip && <StatusChip variant={chip} />}
          </div>
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
          {status === 'paid' ? (
            <Btn size="sm" variant="ghost" disabled={viewLoading} onClick={() => onView(inv.id)}>
              Receipt
            </Btn>
          ) : status === 'overdue' ? (
            canPay ? (
              <Btn size="sm" disabled={isPaying} onClick={() => onPay(inv.id)}>
                {isPaying ? '…' : 'Pay now'}
              </Btn>
            ) : (
              <Btn size="sm" variant="ghost" disabled={viewLoading} onClick={() => onView(inv.id)}>
                View invoice
              </Btn>
            )
          ) : canPay ? (
            <>
              <Btn size="sm" disabled={isPaying} onClick={() => onPay(inv.id)}>
                {isPaying ? '…' : 'Pay invoice'}
              </Btn>
              <Btn size="sm" variant="ghost" disabled={viewLoading} onClick={() => onView(inv.id)}>
                View
              </Btn>
            </>
          ) : (
            <Btn size="sm" variant="ghost" disabled={viewLoading} onClick={() => onView(inv.id)}>
              View invoice
            </Btn>
          )}
        </div>
      </div>
    </li>
  )
}

function BillingHelpLink({ onMessageNico }: { onMessageNico?: () => void }) {
  return (
    <p className="text-sm text-slate-500">
      Need help with billing?{' '}
      {onMessageNico ? (
        <button
          type="button"
          onClick={onMessageNico}
          className="text-gold hover:text-gold-light transition-colors"
        >
          Message Nico
        </button>
      ) : (
        <span className="text-gold">Message Nico</span>
      )}
      .
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
  const { outstanding, paid } = countInvoicesByStatus(invoices)
  const balance = computeOutstandingBalance(invoices)
  const oldestUnpaid = getOldestUnpaidInvoice(invoices)
  const showBillingHelp = (!stripeEnabled && outstanding > 0) || Boolean(paymentError)

  const payBalance = () => {
    if (!oldestUnpaid || !stripeEnabled) return
    onPay(oldestUnpaid.id)
  }

  if (mode === 'history') {
    if (sorted.length === 0) {
      return <p className="text-sm text-slate-500">No invoices yet.</p>
    }
    return (
      <ul className="space-y-3">
        {sorted.map((inv) => (
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
    )
  }

  return (
    <section id="billing">
      <h2 className="text-sm text-slate-400 mb-4 font-medium">Billing</h2>

      <div className={`${card} space-y-4`}>
        <div>
          <p className="text-2xl font-serif text-white tabular-nums">
            {formatCurrency(balance)}
          </p>
          <p className="text-sm text-slate-400 mt-1">Outstanding balance</p>
          <p className="text-xs text-slate-500 mt-2">
            {outstanding} unpaid · {paid} paid
          </p>
        </div>

        {balance > 0 && (
          <Btn
            size="md"
            disabled={!stripeEnabled || payingId !== null}
            onClick={payBalance}
          >
            {payingId ? 'Starting checkout…' : `Pay balance`}
          </Btn>
        )}

        {balance === 0 && sorted.length > 0 && (
          <p className="text-sm text-emerald-400/90">You&apos;re all caught up — no balance due.</p>
        )}

        {sorted.length === 0 && (
          <p className="text-sm text-slate-500">No invoices yet.</p>
        )}

        {!stripeEnabled && outstanding > 0 && (
          <p className="text-xs text-slate-500">
            Online payment is not configured — contact us to settle your balance.
          </p>
        )}

        {showBillingHelp && <BillingHelpLink onMessageNico={onMessageNico} />}
        {paymentError && <p className="text-sm text-red-400">{paymentError}</p>}
      </div>
    </section>
  )
}
