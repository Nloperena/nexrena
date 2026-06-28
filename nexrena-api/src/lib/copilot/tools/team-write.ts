import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '../../prisma'
import type { CopilotContext, ToolExecutionContract } from '../types'
import { queueHighRiskAction, runConfirmedAction } from '../executor'

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost'] as const

export function buildTeamWriteTools(ctx: CopilotContext) {
  return {
    update_lead_status: tool({
      description: 'Update a pipeline lead status.',
      inputSchema: z.object({
        leadId: z.string().uuid(),
        status: z.enum(LEAD_STATUSES),
      }),
      execute: async ({ leadId, status }): Promise<ToolExecutionContract> => {
        try {
          const updated = await prisma.lead.update({ where: { id: leadId }, data: { status } })
          await logAction(ctx, 'update_lead_status', { leadId, status }, true)
          return {
            ok: true,
            data: { id: updated.id, status: updated.status },
            uiPath: '/leads',
            invalidatedPaths: ['/leads', '/'],
            risk: 'low',
          }
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : 'Update failed' }
        }
      },
    }),

    update_form_submission_status: tool({
      description: 'Update a form submission status.',
      inputSchema: z.object({
        submissionId: z.string(),
        status: z.enum(['new', 'contacted', 'qualified', 'closed']),
      }),
      execute: async ({ submissionId, status }): Promise<ToolExecutionContract> => {
        try {
          const updated = await prisma.formSubmission.update({
            where: { id: submissionId },
            data: { status },
          })
          await logAction(ctx, 'update_form_submission_status', { submissionId, status }, true)
          return {
            ok: true,
            data: { id: updated.id, status: updated.status },
            uiPath: '/form-submissions',
            invalidatedPaths: ['/form-submissions', '/'],
            risk: 'low',
          }
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : 'Update failed' }
        }
      },
    }),

    reply_to_message: tool({
      description: 'Send a team reply in a client message thread.',
      inputSchema: z.object({
        threadId: z.string(),
        message: z.string().min(1).max(4000),
        subject: z.string().max(200).optional(),
      }),
      execute: async ({ threadId, message, subject }): Promise<ToolExecutionContract> => {
        try {
          const parent = await prisma.clientMessage.findFirst({
            where: { OR: [{ id: threadId }, { threadId }] },
            orderBy: { createdAt: 'desc' },
          })
          if (!parent) return { ok: false, error: 'Thread not found' }

          const created = await prisma.clientMessage.create({
            data: {
              contactId: parent.contactId,
              portalAccountId: parent.portalAccountId,
              clientName: parent.clientName,
              clientEmail: parent.clientEmail,
              companyName: parent.companyName,
              subject: subject ?? parent.subject,
              message,
              status: 'read',
              threadId: parent.threadId ?? parent.id,
              replyToMessageId: parent.id,
              direction: 'admin',
              readByAdmin: true,
              readByClient: false,
            },
          })
          await logAction(ctx, 'reply_to_message', { threadId, messageId: created.id }, true)
          return {
            ok: true,
            data: { id: created.id },
            uiPath: '/messages',
            invalidatedPaths: ['/messages'],
            risk: 'low',
          }
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : 'Reply failed' }
        }
      },
    }),

    create_service_request: tool({
      description: 'Create a service request on behalf of a contact.',
      inputSchema: z.object({
        contactId: z.string(),
        projectType: z.string().min(1),
        description: z.string().min(1).max(4000),
        budget: z.string().optional(),
        timeline: z.string().optional(),
      }),
      execute: async (args): Promise<ToolExecutionContract> => {
        try {
          const account = await prisma.portalAccount.findUnique({ where: { contactId: args.contactId } })
          const created = await prisma.serviceRequest.create({
            data: {
              contactId: args.contactId,
              portalAccountId: account?.id,
              projectType: args.projectType,
              description: args.description,
              budget: args.budget,
              timeline: args.timeline,
              status: 'new',
              source: 'copilot',
            },
          })
          await logAction(ctx, 'create_service_request', { id: created.id }, true)
          return {
            ok: true,
            data: { id: created.id },
            uiPath: '/service-requests',
            invalidatedPaths: ['/service-requests'],
            risk: 'low',
          }
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : 'Create failed' }
        }
      },
    }),

    delete_contact: tool({
      description: 'Permanently delete a CRM contact. Requires UI confirmation.',
      inputSchema: z.object({
        contactId: z.string(),
      }),
      execute: async ({ contactId }): Promise<ToolExecutionContract> => {
        return queueHighRiskAction('delete_contact', { contactId })
      },
    }),
  }
}

export async function executeTeamConfirmedAction(
  toolName: string,
  args: Record<string, unknown>,
  ctx: CopilotContext,
): Promise<ToolExecutionContract> {
  if (toolName === 'delete_contact') {
    const contactId = String(args.contactId ?? '')
    if (!contactId) return { ok: false, error: 'contactId required' }
    try {
      await prisma.contact.delete({ where: { id: contactId } })
      await logAction(ctx, toolName, args, true)
      return {
        ok: true,
        data: { contactId },
        uiPath: '/crm',
        invalidatedPaths: ['/crm', '/'],
        risk: 'high',
      }
    } catch (error) {
      await logAction(ctx, toolName, args, false)
      return { ok: false, error: error instanceof Error ? error.message : 'Delete failed' }
    }
  }
  return { ok: false, error: `Unknown confirmed action: ${toolName}` }
}

async function logAction(
  ctx: CopilotContext,
  toolName: string,
  args: Record<string, unknown>,
  ok: boolean,
) {
  await runConfirmedAction(ctx, toolName, args, ok)
}
