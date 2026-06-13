import { prisma } from './prisma'
import { portalInvoiceWhere } from './invoice-utils'

export type PortalAiChatRole = 'user' | 'assistant'

export type PortalAiChatMessage = {
  role: PortalAiChatRole
  content: string
}

export type PortalAiAction = {
  type: 'navigate' | 'create_service_request'
  label: string
  view?: string
}

export type PortalAiContext = {
  clientName: string
  company: string | null
  activeProjectsCount: number
  openInvoicesCount: number
}

const INACTIVE_PROJECT_STATUSES = new Set(['delivered', 'on_hold', 'not_started'])
const MESSAGE_MAX = 2000
const HISTORY_MAX = 20

const SYSTEM_PROMPT = `You are the Nexrena client portal AI assistant — a helpful, concise guide for clients using their Nexrena workspace.

You can help clients:
- Navigate the portal (Home, Billing, Messages, Files, Websites, Forms, Service Requests, Schedule, Settings)
- Understand invoices, subscriptions, and WaaS (Website-as-a-Service)
- Draft or explain service requests
- Guide file uploads and project status
- Answer how-to questions about the portal

Rules:
- Never invent invoice amounts, project names, dates, or account details not provided in context.
- If you lack specific data, say so and point the client to the right portal section or Messages to reach Nico.
- Keep replies short (2–4 sentences unless the client asks for detail).
- Use a warm, professional tone matching Nexrena's premium brand.
- When suggesting navigation, mention the portal section name clearly.`

export async function loadPortalAiContext(accountId: string): Promise<PortalAiContext | null> {
  const account = await prisma.portalAccount.findUnique({ where: { id: accountId } })
  if (!account) return null

  const [projects, openInvoices] = await Promise.all([
    prisma.project.findMany({
      where: { contactId: account.contactId },
      select: { status: true },
    }),
    prisma.invoice.count({
      where: {
        ...portalInvoiceWhere(account.contactId, account.email),
        status: { in: ['sent', 'overdue'] },
      },
    }),
  ])

  const activeProjectsCount = projects.filter((p) => !INACTIVE_PROJECT_STATUSES.has(p.status)).length

  return {
    clientName: account.name,
    company: account.company,
    activeProjectsCount,
    openInvoicesCount: openInvoices,
  }
}

function buildSystemMessage(context: PortalAiContext): string {
  const companyLine = context.company ? `Company: ${context.company}` : 'Company: (not set)'
  return `${SYSTEM_PROMPT}

Client context (use only this data — do not guess beyond it):
- Name: ${context.clientName}
- ${companyLine}
- Active projects: ${context.activeProjectsCount}
- Open invoices (sent or overdue): ${context.openInvoicesCount}`
}

function sanitizeMessages(raw: unknown): PortalAiChatMessage[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter(
      (m): m is PortalAiChatMessage =>
        typeof m === 'object' &&
        m !== null &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string',
    )
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MESSAGE_MAX) }))
    .filter((m) => m.content.length > 0)
    .slice(-HISTORY_MAX)
}

function detectActions(reply: string): PortalAiAction[] {
  const actions: PortalAiAction[] = []
  const lower = reply.toLowerCase()

  const navMap: Array<{ keywords: string[]; view: string; label: string }> = [
    { keywords: ['billing', 'invoice', 'payment', 'subscription'], view: 'billing', label: 'Go to Billing' },
    { keywords: ['message', 'nico', 'reach out'], view: 'messages', label: 'Open Messages' },
    { keywords: ['file', 'upload', 'asset'], view: 'files', label: 'Go to Files' },
    { keywords: ['website', 'waas'], view: 'websites', label: 'Go to Websites' },
    { keywords: ['service request', 'new request', 'project request'], view: 'requests', label: 'New Service Request' },
    { keywords: ['schedule', 'call', 'meeting', 'calendly'], view: 'schedule', label: 'Open Schedule' },
    { keywords: ['form', 'submission'], view: 'forms', label: 'View Forms' },
    { keywords: ['setting', 'profile', 'password'], view: 'settings', label: 'Open Settings' },
  ]

  for (const nav of navMap) {
    if (nav.keywords.some((k) => lower.includes(k))) {
      actions.push({ type: 'navigate', view: nav.view, label: nav.label })
      break
    }
  }

  if (lower.includes('service request') && (lower.includes('create') || lower.includes('draft') || lower.includes('start'))) {
    actions.push({ type: 'create_service_request', label: 'Start a service request' })
  }

  return actions
}

function fallbackReply(userMessage: string, context: PortalAiContext): string {
  const lower = userMessage.toLowerCase()

  if (/hello|hi|hey|good (morning|afternoon|evening)/.test(lower)) {
    const greeting = context.company
      ? `Hello ${context.clientName}! I'm your Nexrena portal assistant for ${context.company}.`
      : `Hello ${context.clientName}! I'm your Nexrena portal assistant.`
    return `${greeting} I can help with billing, service requests, files, websites, and more. Full AI responses are coming soon — for now, tell me what you need and I'll point you in the right direction.`
  }

  if (/bill|invoice|pay|subscription|waas/.test(lower)) {
    const inv = context.openInvoicesCount
    const invNote =
      inv > 0
        ? `You have ${inv} open invoice${inv === 1 ? '' : 's'} — open Billing to review and pay.`
        : 'No open invoices on your account right now.'
    return `${invNote} Billing also shows subscriptions and WaaS details. Open the Billing section from the sidebar, or message Nico in Messages for billing questions.`
  }

  if (/request|project|quote|scope/.test(lower)) {
    return 'To start new work, open Service Requests from the portal menu. Describe your project type, timeline, and budget — Nico will follow up. I can help you think through what to include before you submit.'
  }

  if (/file|upload|logo|photo|document|asset/.test(lower)) {
    return 'Use the Files section to upload logos, photos, and documents. You can organize files in folders and attach them to service requests. Tap Files in the navigation to get started.'
  }

  if (/message|contact|nico|help|support/.test(lower)) {
    return 'Open Messages to reach Nico directly — great for questions that need a human. You can attach files and keep everything in one thread.'
  }

  if (/website|waas|domain|hosting/.test(lower)) {
    return 'The Websites section covers your WaaS sites, media, and related resources. For changes to your live site, submit a service request or message Nico with specifics.'
  }

  if (/schedule|call|meeting|book/.test(lower)) {
    return 'If scheduling is enabled on your account, open Schedule to book a call with Nico. Otherwise, send a message with your availability.'
  }

  return `I'm the Nexrena portal assistant (AI features are being enabled). I can guide you to Billing, Messages, Files, Service Requests, and Websites. What would you like help with today, ${context.clientName}?`
}

async function callOpenAi(system: string, messages: PortalAiChatMessage[]): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY?.trim()
  if (!apiKey) return null

  const model = process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini'

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 600,
      messages: [
        { role: 'system', content: system },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
    }),
  })

  if (!res.ok) {
    console.error('OpenAI portal AI error:', res.status, await res.text().catch(() => ''))
    return null
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content = data.choices?.[0]?.message?.content?.trim()
  return content || null
}

async function callAnthropic(system: string, messages: PortalAiChatMessage[]): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
  if (!apiKey) return null

  const model = process.env.ANTHROPIC_MODEL?.trim() || 'claude-3-5-haiku-20241022'

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: 600,
      system,
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
    }),
  })

  if (!res.ok) {
    console.error('Anthropic portal AI error:', res.status, await res.text().catch(() => ''))
    return null
  }

  const data = (await res.json()) as {
    content?: Array<{ type: string; text?: string }>
  }
  const block = data.content?.find((c) => c.type === 'text')
  return block?.text?.trim() || null
}

export function isPortalAiConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim() || process.env.ANTHROPIC_API_KEY?.trim())
}

export async function generatePortalAiReply(
  accountId: string,
  rawMessages: unknown,
): Promise<{ message: string; actions: PortalAiAction[]; configured: boolean }> {
  const context = await loadPortalAiContext(accountId)
  if (!context) {
    throw new Error('Account not found')
  }

  const messages = sanitizeMessages(rawMessages)
  const lastUser = [...messages].reverse().find((m) => m.role === 'user')
  if (!lastUser) {
    throw new Error('messages must include at least one user message')
  }

  const configured = isPortalAiConfigured()
  const system = buildSystemMessage(context)

  let message: string | null = null
  if (configured) {
    message = await callOpenAi(system, messages)
    if (!message) message = await callAnthropic(system, messages)
  }

  if (!message) {
    message = fallbackReply(lastUser.content, context)
  }

  const actions = detectActions(message)
  return { message, actions, configured }
}
