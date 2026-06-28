import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '../../prisma'
import type { CopilotContext, ToolExecutionContract } from '../types'
import { COPILOT_ROW_LIMIT, truncateForCopilot } from '../context'

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'] as const

export function buildTeamReadTools(_ctx: CopilotContext) {
  return {
    get_dashboard_summary: tool({
      description: 'Summarize team dashboard metrics: leads, messages, requests, invoices.',
      inputSchema: z.object({}),
      execute: async (): Promise<ToolExecutionContract> => {
        const { loadTeamDashboardSummary } = await import('../context')
        const data = await loadTeamDashboardSummary()
        return { ok: true, data, invalidatedPaths: ['/'] }
      },
    }),

    list_leads: tool({
      description: 'List pipeline leads, optionally filtered by status.',
      inputSchema: z.object({
        status: z.enum(LEAD_STATUSES).optional(),
      }),
      execute: async ({ status }): Promise<ToolExecutionContract> => {
        const leads = await prisma.lead.findMany({
          where: status ? { status } : undefined,
          take: COPILOT_ROW_LIMIT,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            status: true,
            budget: true,
            projectType: true,
            source: true,
            message: true,
            createdAt: true,
          },
        })
        return {
          ok: true,
          data: leads.map((l) => ({
            id: l.id,
            name: l.name,
            company: l.company,
            email: l.email,
            status: l.status,
            budget: l.budget,
            projectType: l.projectType,
            source: l.source,
            createdAt: l.createdAt,
            message: truncateForCopilot(l.message),
          })),
          uiPath: '/leads',
        }
      },
    }),

    list_form_leads: tool({
      description: 'List recent website form submissions (form leads).',
      inputSchema: z.object({
        status: z.enum(['new', 'contacted', 'qualified', 'closed']).optional(),
      }),
      execute: async ({ status }): Promise<ToolExecutionContract> => {
        const rows = await prisma.formSubmission.findMany({
          where: status ? { status } : undefined,
          take: COPILOT_ROW_LIMIT,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            submitterName: true,
            submitterEmail: true,
            siteKey: true,
            formName: true,
            status: true,
            createdAt: true,
          },
        })
        return { ok: true, data: rows, uiPath: '/form-submissions' }
      },
    }),

    list_unread_messages: tool({
      description: 'List unread client messages for the team inbox.',
      inputSchema: z.object({}),
      execute: async (): Promise<ToolExecutionContract> => {
        const rows = await prisma.clientMessage.findMany({
          where: { readByAdmin: false, direction: 'client' },
          take: COPILOT_ROW_LIMIT,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            clientName: true,
            clientEmail: true,
            subject: true,
            message: true,
            status: true,
            createdAt: true,
          },
        })
        return {
          ok: true,
          data: rows.map((r) => ({
            id: r.id,
            clientName: r.clientName,
            clientEmail: r.clientEmail,
            subject: r.subject,
            status: r.status,
            createdAt: r.createdAt,
            messagePreview: truncateForCopilot(r.message, 120),
          })),
          uiPath: '/messages',
        }
      },
    }),

    list_ai_chats: tool({
      description: 'List recent public website AI chat sessions.',
      inputSchema: z.object({
        siteKey: z.string().optional(),
      }),
      execute: async ({ siteKey }): Promise<ToolExecutionContract> => {
        const rows = await prisma.chatSession.findMany({
          where: siteKey ? { siteKey } : undefined,
          take: COPILOT_ROW_LIMIT,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            sessionId: true,
            siteKey: true,
            leadScore: true,
            pageUrl: true,
            updatedAt: true,
          },
        })
        return { ok: true, data: rows, uiPath: '/ai-chats' }
      },
    }),

    search_contacts: tool({
      description: 'Search CRM contacts by name, company, or email.',
      inputSchema: z.object({
        query: z.string().min(1).max(100),
      }),
      execute: async ({ query }): Promise<ToolExecutionContract> => {
        const q = query.trim()
        const rows = await prisma.contact.findMany({
          where: {
            OR: [
              { name: { contains: q, mode: 'insensitive' } },
              { company: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          },
          take: COPILOT_ROW_LIMIT,
          select: {
            id: true,
            name: true,
            company: true,
            email: true,
            stage: true,
            value: true,
          },
        })
        return { ok: true, data: rows, uiPath: '/crm' }
      },
    }),

    navigate: tool({
      description: 'Return a UI path for the team workspace router.',
      inputSchema: z.object({
        path: z.string().min(1),
      }),
      execute: async ({ path }): Promise<ToolExecutionContract> => {
        const uiPath = path.startsWith('/') ? path : `/${path}`
        return { ok: true, data: { path: uiPath }, uiPath }
      },
    }),
  }
}
