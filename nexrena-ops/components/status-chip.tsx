'use client'

export type StatusChipVariant =
  | 'due_soon'
  | 'overdue'
  | 'paid'
  | 'waiting_on_you'
  | 'in_progress'
  | 'needs_approval'
  | 'complete'
  | 'new'
  | 'reviewing'

const CHIP_STYLES: Record<StatusChipVariant, string> = {
  due_soon: 'bg-amber-950/50 text-amber-300 ring-1 ring-amber-800/40',
  overdue: 'bg-red-950/50 text-red-300 ring-1 ring-red-800/40',
  paid: 'bg-emerald-950/50 text-emerald-300 ring-1 ring-emerald-800/40',
  waiting_on_you: 'bg-gold/10 text-gold ring-1 ring-gold/30',
  in_progress: 'bg-blue-950/50 text-blue-300 ring-1 ring-blue-800/40',
  needs_approval: 'bg-gold/10 text-gold ring-1 ring-gold/30',
  complete: 'bg-emerald-950/50 text-emerald-300 ring-1 ring-emerald-800/40',
  new: 'bg-slate-800/80 text-slate-300 ring-1 ring-slate-700/50',
  reviewing: 'bg-purple-950/50 text-purple-300 ring-1 ring-purple-800/40',
}

const CHIP_LABELS: Record<StatusChipVariant, string> = {
  due_soon: 'Due soon',
  overdue: 'Overdue',
  paid: 'Paid',
  waiting_on_you: 'Waiting on you',
  in_progress: 'In progress',
  needs_approval: 'Needs approval',
  complete: 'Complete',
  new: 'New',
  reviewing: 'Reviewing',
}

type Props = {
  variant: StatusChipVariant
  className?: string
}

export function StatusChip({ variant, className = '' }: Props) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide uppercase ${CHIP_STYLES[variant]} ${className}`}
    >
      {CHIP_LABELS[variant]}
    </span>
  )
}

export function invoiceStatusChip(
  status: string,
  dueDate: string,
): StatusChipVariant | null {
  if (status === 'paid') return 'paid'
  if (status === 'overdue') return 'overdue'
  if (status === 'sent') {
    const due = new Date(dueDate)
    const now = new Date()
    const daysUntil = (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    if (daysUntil < 0) return 'overdue'
    if (daysUntil <= 7) return 'due_soon'
    return null
  }
  return null
}

export function requestStatusChip(status: string): StatusChipVariant | null {
  switch (status) {
    case 'new': return 'new'
    case 'reviewing': return 'reviewing'
    case 'quoted': return 'waiting_on_you'
    case 'accepted': return 'in_progress'
    case 'closed': return 'complete'
    default: return null
  }
}

export function proposalStatusChip(status: string, validUntil: string): StatusChipVariant | null {
  if (status === 'sent' && new Date(validUntil) >= new Date()) return 'needs_approval'
  if (status === 'accepted') return 'complete'
  return null
}

export function projectStatusChip(status: string): StatusChipVariant | null {
  if (status === 'in_progress' || status === 'review' || status === 'execution') return 'in_progress'
  if (status === 'delivered') return 'complete'
  return null
}
