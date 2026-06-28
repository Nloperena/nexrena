import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '../../prisma'
import { portalInvoiceWhere, invoiceTotal, parseLineItems } from '../../invoice-utils'
import type { CopilotContext, ToolExecutionContract } from '../types'
import { COPILOT_ROW_LIMIT, truncateForCopilot } from '../context'

const CLIENT_VIEWS = [
  'home',
  'shop',
  'billing',
  'messages',
  'schedule',
  'files',
  'websites',
  'forms',
  'requests',
  'settings',
] as const

function requireContact(ctx: CopilotContext): string {
  if (!ctx.contactId) throw new Error('Client context missing contactId')
  return ctx.contactId
}

export function buildClientReadTools(ctx: CopilotContext) {
  return {
    get_account_summary: tool({
      description: 'Summarize this client account: projects, invoices, requests, messages.',
      inputSchema: z.object({}),
      execute: async (): Promise<ToolExecutionContract> => {
        const contactId = requireContact(ctx)
        const email = await getEmail(contactId)
        const { loadClientAccountSummary } = await import('../context')
        const data = await loadClientAccountSummary(contactId, email)
        return { ok: true, data }
      },
    }),

    list_invoices: tool({
      description: 'List open and recent invoices for this client.',
      inputSchema: z.object({
        status: z.enum(['sent', 'overdue', 'paid', 'draft']).optional(),
      }),
      execute: async ({ status }): Promise<ToolExecutionContract> => {
        const contactId = requireContact(ctx)
        const email = await getEmail(contactId)
        const rows = await prisma.invoice.findMany({
          where: {
            ...portalInvoiceWhere(contactId, email),
            ...(status ? { status } : {}),
          },
          take: COPILOT_ROW_LIMIT,
          orderBy: { issueDate: 'desc' },
          select: {
            id: true,
            number: true,
            status: true,
            issueDate: true,
            dueDate: true,
            projectName: true,
            lineItems: true,
            taxRate: true,
          },
        })
        const data = rows.map((inv) => ({
          id: inv.id,
          number: inv.number,
          status: inv.status,
          issueDate: inv.issueDate,
          dueDate: inv.dueDate,
          projectName: inv.projectName,
          total: invoiceTotal(parseLineItems(inv.lineItems), inv.taxRate),
        }))
        return { ok: true, data, uiPath: '/?view=billing' }
      },
    }),

    list_messages: tool({
      description: 'List recent message threads for this client.',
      inputSchema: z.object({}),
      execute: async (): Promise<ToolExecutionContract> => {
        const contactId = requireContact(ctx)
        const rows = await prisma.clientMessage.findMany({
          where: { contactId },
          take: COPILOT_ROW_LIMIT,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            subject: true,
            direction: true,
            readByClient: true,
            createdAt: true,
          },
        })
        return { ok: true, data: rows, uiPath: '/?view=messages' }
      },
    }),

    list_service_requests: tool({
      description: 'List service requests for this client.',
      inputSchema: z.object({}),
      execute: async (): Promise<ToolExecutionContract> => {
        const contactId = requireContact(ctx)
        const rows = await prisma.serviceRequest.findMany({
          where: { contactId },
          take: COPILOT_ROW_LIMIT,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            projectType: true,
            status: true,
            budget: true,
            timeline: true,
            description: true,
            createdAt: true,
          },
        })
        return {
          ok: true,
          data: rows.map((r) => ({
            id: r.id,
            projectType: r.projectType,
            status: r.status,
            budget: r.budget,
            timeline: r.timeline,
            createdAt: r.createdAt,
            description: truncateForCopilot(r.description),
          })),
          uiPath: '/?view=requests',
        }
      },
    }),

    navigate: tool({
      description: 'Navigate the client portal to a view.',
      inputSchema: z.object({
        view: z.enum(CLIENT_VIEWS),
      }),
      execute: async ({ view }): Promise<ToolExecutionContract> => {
        const uiPath = view === 'home' ? '/' : `/?view=${view}`
        return { ok: true, data: { view }, uiPath }
      },
    }),
  }
}

async function getEmail(contactId: string): Promise<string> {
  const account = await prisma.portalAccount.findUnique({
    where: { contactId },
    select: { email: true },
  })
  return account?.email ?? ''
}
