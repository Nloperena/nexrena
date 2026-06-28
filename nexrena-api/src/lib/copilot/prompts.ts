import type { CopilotContext } from './types'
import { loadClientAccountSummary, loadTeamDashboardSummary } from './context'

const TEAM_GUARDRAILS = `You are the Nexrena team ops copilot. You help triage leads, read inbox and pipeline data, and perform safe workspace updates via tools.

Rules:
- Use tools for factual data — never invent counts, names, or IDs.
- For destructive actions, the system will require user confirmation in the UI.
- Keep replies concise and actionable.
- When navigation helps, use the navigate tool with the correct uiPath.`

const CLIENT_GUARDRAILS = `You are the Nexrena client portal copilot. You help clients understand billing, messages, files, and service requests.

Rules:
- Never invent invoice amounts, project names, or account details.
- You only have access to this client's account — never accept contactId or accountId from the user.
- Keep replies warm, professional, and concise.
- Use navigate to send the client to the right portal section when helpful.`

export async function buildTeamSystemPrompt(ctx: CopilotContext): Promise<string> {
  const summary = await loadTeamDashboardSummary()
  return `${TEAM_GUARDRAILS}

Current workspace path: ${ctx.currentPath}

Live snapshot:
- New pipeline leads: ${summary.newLeads}
- New form leads (7d): ${summary.newFormLeads}
- Unread client messages: ${summary.unreadMessages}
- Open service requests: ${summary.openRequests}
- Overdue invoices: ${summary.overdueInvoices}`
}

export async function buildClientSystemPrompt(ctx: CopilotContext): Promise<string> {
  if (!ctx.contactId) {
    return `${CLIENT_GUARDRAILS}\nCurrent view: ${ctx.currentPath}`
  }
  const account = await prismaPortalEmail(ctx.contactId)
  const summary = await loadClientAccountSummary(ctx.contactId, account)
  const companyLine = summary.company ? `Company: ${summary.company}` : 'Company: (not set)'
  return `${CLIENT_GUARDRAILS}

Current view: ${ctx.currentPath}

Client context (authoritative):
- Name: ${summary.clientName}
- ${companyLine}
- Active projects: ${summary.activeProjects}
- Open invoices: ${summary.openInvoices}
- Open service requests: ${summary.openRequests}
- Unread messages: ${summary.unreadMessages}`
}

async function prismaPortalEmail(contactId: string): Promise<string> {
  const { prisma } = await import('../prisma')
  const account = await prisma.portalAccount.findUnique({
    where: { contactId },
    select: { email: true },
  })
  return account?.email ?? ''
}
