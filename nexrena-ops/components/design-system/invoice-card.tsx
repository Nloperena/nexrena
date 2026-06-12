import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/store'
import type { Invoice, InvoiceStatus } from '@/lib/types'
import { Card } from '@/components/design-system/card'
import { Button } from '@/components/design-system/button'
import { StatusBadge } from '@/components/design-system/status-badge'
import { typography } from '@/lib/design-tokens'

type Props = {
  invoice: Invoice
  total: number
  status: InvoiceStatus
  overdue?: boolean
  onEdit?: () => void
  onMarkPaid?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
}

export function InvoiceCard({
  invoice,
  total,
  status,
  overdue,
  onEdit,
  onMarkPaid,
  onDuplicate,
  onDelete,
}: Props) {
  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-sm text-gold">{invoice.number}</p>
          <p className={`${typography.sectionTitle} text-base mt-1 truncate`}>{invoice.clientName}</p>
          {invoice.projectName && (
            <p className={`${typography.hint} truncate`}>{invoice.projectName}</p>
          )}
        </div>
        <StatusBadge label={status} />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400">
        <span>Due {formatDate(invoice.dueDate)}</span>
        {overdue && <span className="text-red-300 font-medium">Overdue</span>}
      </div>
      <p className="font-serif text-xl text-white tabular-nums">{formatCurrency(total)}</p>
      <div className="flex flex-wrap gap-2 pt-1">
        <Link href={`/invoices/${invoice.id}/print`}>
          <Button size="sm" variant="ghost">View</Button>
        </Link>
        {onEdit && <Button size="sm" variant="ghost" onClick={onEdit}>Edit</Button>}
        {(status === 'sent' || overdue) && onMarkPaid && (
          <Button size="sm" onClick={onMarkPaid}>Paid</Button>
        )}
        {onDuplicate && <Button size="sm" variant="ghost" onClick={onDuplicate}>Dup</Button>}
        {onDelete && <Button size="sm" variant="danger" onClick={onDelete}>Del</Button>}
      </div>
    </Card>
  )
}
