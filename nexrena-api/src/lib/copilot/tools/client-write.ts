import { tool } from 'ai'
import { z } from 'zod'
import { prisma } from '../../prisma'
import type { CopilotContext, ToolExecutionContract } from '../types'
import { runConfirmedAction } from '../executor'

function requireContact(ctx: CopilotContext): string {
  if (!ctx.contactId) throw new Error('Client context missing contactId')
  return ctx.contactId
}

export function buildClientWriteTools(ctx: CopilotContext) {
  return {
    create_service_request: tool({
      description: 'Create a new service request for this client.',
      inputSchema: z.object({
        projectType: z.string().min(1),
        description: z.string().min(1).max(4000),
        budget: z.string().optional(),
        timeline: z.string().optional(),
      }),
      execute: async (args): Promise<ToolExecutionContract> => {
        const contactId = requireContact(ctx)
        try {
          const account = await prisma.portalAccount.findUnique({ where: { contactId } })
          const created = await prisma.serviceRequest.create({
            data: {
              contactId,
              portalAccountId: account?.id ?? ctx.accountId,
              projectType: args.projectType,
              description: args.description,
              budget: args.budget,
              timeline: args.timeline,
              status: 'new',
              source: 'portal-copilot',
            },
          })
          await runConfirmedAction(ctx, 'create_service_request', { id: created.id }, true)
          return {
            ok: true,
            data: { id: created.id },
            uiPath: '/?view=requests',
            invalidatedPaths: ['/?view=requests'],
            risk: 'low',
          }
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : 'Create failed' }
        }
      },
    }),

    send_portal_message: tool({
      description: 'Send a message from the client to the Nexrena team.',
      inputSchema: z.object({
        subject: z.string().min(1).max(200),
        message: z.string().min(1).max(4000),
      }),
      execute: async ({ subject, message }): Promise<ToolExecutionContract> => {
        const contactId = requireContact(ctx)
        try {
          const account = await prisma.portalAccount.findUnique({ where: { contactId } })
          if (!account) return { ok: false, error: 'Portal account not found' }

          const created = await prisma.clientMessage.create({
            data: {
              contactId,
              portalAccountId: account.id,
              clientName: account.name,
              clientEmail: account.email,
              companyName: account.company,
              subject,
              message,
              status: 'unread',
              direction: 'client',
              readByClient: true,
              readByAdmin: false,
            },
          })
          await runConfirmedAction(ctx, 'send_portal_message', { id: created.id }, true)
          return {
            ok: true,
            data: { id: created.id },
            uiPath: '/?view=messages',
            invalidatedPaths: ['/?view=messages'],
            risk: 'low',
          }
        } catch (error) {
          return { ok: false, error: error instanceof Error ? error.message : 'Send failed' }
        }
      },
    }),
  }
}
