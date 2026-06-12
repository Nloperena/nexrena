import type { InvoicePhase, PortalInvoice, PortalProject, PortalProposal } from './portal-types'
import type { InvoiceStatus } from './types'

export function invoicePhaseLabel(phase: InvoicePhase | string | null | undefined): string | null {
  switch (phase) {
    case 'deposit':
      return 'Project deposit (50%)'
    case 'balance':
      return 'Final payment (50%) — due on completion'
    case 'subscription':
      return 'Subscription'
    default:
      return null
  }
}

export function getProjectPaymentStatus(
  projectId: string,
  invoices: PortalInvoice[],
): string | null {
  const projectInvoices = invoices.filter((i) => i.projectId === projectId)
  const deposit = projectInvoices.find((i) => i.invoicePhase === 'deposit')
  const balance = projectInvoices.find((i) => i.invoicePhase === 'balance')

  if (!deposit && !balance) return null

  const depositPaid = deposit?.status === 'paid'
  const balancePaid = balance?.status === 'paid'

  if (depositPaid && balancePaid) return 'Fully paid ✓'
  if (depositPaid && balance && balance.status !== 'paid') {
    if (balance.status === 'draft') return 'Deposit paid ✓ · Balance due on delivery'
    return 'Deposit paid ✓ · Balance due'
  }
  if (deposit && deposit.status !== 'paid') return 'Deposit due'
  return null
}

const INACTIVE_PROJECT_STATUSES = new Set(['delivered', 'on_hold', 'not_started'])

export function effectiveInvoiceStatus(inv: PortalInvoice): InvoiceStatus {
  if (inv.status === 'sent' && new Date(inv.dueDate) < new Date()) return 'overdue'
  return inv.status as InvoiceStatus
}

export function isUnpaidInvoice(inv: PortalInvoice): boolean {
  const status = effectiveInvoiceStatus(inv)
  return status === 'sent' || status === 'overdue'
}

export function computeOutstandingBalance(invoices: PortalInvoice[]): number {
  return invoices.filter(isUnpaidInvoice).reduce((sum, inv) => sum + inv.total, 0)
}

export function getActiveProject(projects: PortalProject[]): PortalProject | null {
  const active = projects.filter((p) => !INACTIVE_PROJECT_STATUSES.has(p.status))
  if (active.length === 0) return null
  return active.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
}

export function getPendingApprovalCount(proposals: PortalProposal[]): number {
  const now = new Date()
  return proposals.filter(
    (p) => p.status === 'sent' && new Date(p.validUntil) >= now,
  ).length
}

export function getNextDueInvoice(invoices: PortalInvoice[]): PortalInvoice | null {
  const unpaid = invoices
    .filter(isUnpaidInvoice)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  return unpaid[0] ?? null
}

export function getOldestOverdueInvoice(invoices: PortalInvoice[]): PortalInvoice | null {
  const overdue = invoices
    .filter((inv) => effectiveInvoiceStatus(inv) === 'overdue')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  return overdue[0] ?? null
}

export function getOldestUnpaidInvoice(invoices: PortalInvoice[]): PortalInvoice | null {
  const unpaid = invoices
    .filter(isUnpaidInvoice)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  return unpaid[0] ?? null
}

export function sortInvoicesNewestFirst(invoices: PortalInvoice[]): PortalInvoice[] {
  return [...invoices].sort(
    (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
  )
}

export function countInvoicesByStatus(invoices: PortalInvoice[]) {
  let outstanding = 0
  let paid = 0
  for (const inv of invoices) {
    const status = effectiveInvoiceStatus(inv)
    if (status === 'sent' || status === 'overdue') outstanding++
    else if (status === 'paid') paid++
  }
  return { outstanding, paid }
}

export { portalSectionTitleClass } from './portal-a11y'

export type PortalDashboardStats = {
  outstandingBalance: number
  activeProjectName: string | null
  pendingApprovalCount: number
  nextDueDate: string | null
}

export function computePortalStats(
  invoices: PortalInvoice[],
  projects: PortalProject[],
  proposals: PortalProposal[],
): PortalDashboardStats {
  const active = getActiveProject(projects)
  const nextDue = getNextDueInvoice(invoices)
  return {
    outstandingBalance: computeOutstandingBalance(invoices),
    activeProjectName: active?.name ?? null,
    pendingApprovalCount: getPendingApprovalCount(proposals),
    nextDueDate: nextDue?.dueDate ?? null,
  }
}
