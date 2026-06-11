import type {
  PortalInvoice,
  PortalProposal,
  PortalServiceRequest,
} from './portal-types'
import { effectiveInvoiceStatus } from './portal-dashboard-utils'
import type { StatusChipVariant } from '@/components/status-chip'

export type PortalActivityItem = {
  id: string
  date: string
  label: string
  chip?: StatusChipVariant
  sortTime: number
}

type PortalMessage = {
  id: string
  subject: string
  createdAt: string
}

function invoiceLabel(inv: PortalInvoice): string {
  const name = inv.projectName?.trim() || inv.number
  return name
}

function daysFromNow(dateStr: string): number {
  return (new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
}

function invoiceChip(inv: PortalInvoice): StatusChipVariant | undefined {
  const status = effectiveInvoiceStatus(inv)
  if (status === 'paid') return 'paid'
  if (status === 'overdue') return 'overdue'
  if (status === 'sent' && daysFromNow(inv.dueDate) <= 7) return 'due_soon'
  return undefined
}

export function buildPortalActivity(
  invoices: PortalInvoice[],
  proposals: PortalProposal[],
  serviceRequests: PortalServiceRequest[],
  messages: PortalMessage[] = [],
  limit = 12,
): PortalActivityItem[] {
  const items: PortalActivityItem[] = []

  for (const inv of invoices) {
    const status = effectiveInvoiceStatus(inv)
    const name = invoiceLabel(inv)

    if (status === 'paid' && inv.paidDate) {
      items.push({
        id: `inv-paid-${inv.id}`,
        date: inv.paidDate,
        label: `${name} invoice paid`,
        chip: 'paid',
        sortTime: new Date(inv.paidDate).getTime(),
      })
    }

    if (status === 'overdue') {
      items.push({
        id: `inv-overdue-${inv.id}`,
        date: inv.dueDate,
        label: `${name} invoice overdue`,
        chip: 'overdue',
        sortTime: new Date(inv.dueDate).getTime(),
      })
    } else if (status === 'sent') {
      items.push({
        id: `inv-sent-${inv.id}`,
        date: inv.issueDate,
        label: `${name} invoice sent`,
        chip: invoiceChip(inv),
        sortTime: new Date(inv.issueDate).getTime(),
      })
    }
  }

  for (const p of proposals) {
    if (p.status === 'sent') {
      items.push({
        id: `prop-${p.id}`,
        date: p.validUntil,
        label: `Estimate sent: ${p.title}`,
        chip: new Date(p.validUntil) >= new Date() ? 'needs_approval' : undefined,
        sortTime: new Date(p.validUntil).getTime(),
      })
    }
  }

  for (const r of serviceRequests) {
    items.push({
      id: `req-${r.id}`,
      date: r.createdAt,
      label: `${r.projectType} request submitted`,
      chip: r.status === 'new' ? 'new' : r.status === 'reviewing' ? 'reviewing' : undefined,
      sortTime: new Date(r.createdAt).getTime(),
    })
  }

  for (const m of messages) {
    items.push({
      id: `msg-${m.id}`,
      date: m.createdAt,
      label: m.subject ? `Message sent: ${m.subject}` : 'Message sent to Nico',
      sortTime: new Date(m.createdAt).getTime(),
    })
  }

  return items
    .sort((a, b) => b.sortTime - a.sortTime)
    .slice(0, limit)
}
