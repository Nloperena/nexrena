import { prisma } from '../prisma'
import { portalInvoiceWhere } from '../invoice-utils'
import { COPILOT_ROW_LIMIT, COPILOT_STRING_MAX } from './types'

const INACTIVE_PROJECT_STATUSES = new Set(['delivered', 'on_hold', 'not_started'])

export function truncateForCopilot(value: string | null | undefined, max = COPILOT_STRING_MAX): string | null {
  if (value == null) return null
  const trimmed = value.trim()
  if (trimmed.length <= max) return trimmed
  return `${trimmed.slice(0, max)}…`
}

export async function loadTeamDashboardSummary() {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const [newLeads, newFormLeads, unreadMessages, openRequests, overdueInvoices] = await Promise.all([
    prisma.lead.count({ where: { status: 'new' } }),
    prisma.formSubmission.count({ where: { status: 'new', createdAt: { gte: weekAgo } } }),
    prisma.clientMessage.count({ where: { readByAdmin: false, direction: 'client' } }),
    prisma.serviceRequest.count({ where: { status: { in: ['new', 'in_review'] } } }),
    prisma.invoice.count({ where: { status: 'overdue' } }),
  ])
  return { newLeads, newFormLeads, unreadMessages, openRequests, overdueInvoices }
}

export async function loadClientAccountSummary(contactId: string, email: string) {
  const account = await prisma.portalAccount.findUnique({ where: { contactId } })
  const [projects, openInvoices, openRequests, unreadMessages] = await Promise.all([
    prisma.project.findMany({
      where: { contactId },
      select: { status: true },
    }),
    prisma.invoice.count({
      where: {
        ...portalInvoiceWhere(contactId, email),
        status: { in: ['sent', 'overdue'] },
      },
    }),
    prisma.serviceRequest.count({
      where: { contactId, status: { in: ['new', 'in_review', 'in_progress'] } },
    }),
    prisma.clientMessage.count({
      where: { contactId, readByClient: false, direction: { not: 'client' } },
    }),
  ])
  const activeProjects = projects.filter((p) => !INACTIVE_PROJECT_STATUSES.has(p.status)).length
  return {
    clientName: account?.name ?? 'Client',
    company: account?.company ?? null,
    activeProjects,
    openInvoices,
    openRequests,
    unreadMessages,
  }
}

export { COPILOT_ROW_LIMIT }
