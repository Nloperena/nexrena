import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { getSiteConfig, inboxCategoryForSite, SITES } from '../lib/sites'
import { listManagedSitesForOps } from '../lib/site-chat'

const router = Router()

type InboxKind = 'ai' | 'form' | 'lead'
type InboxCategory = 'ai' | 'client' | 'portfolio'

function siteLabel(siteKey: string): string {
  return getSiteConfig(siteKey)?.label ?? siteKey
}

function formInboxCategory(siteKey: string): InboxCategory {
  const site = getSiteConfig(siteKey)
  if (!site) return 'client'
  if (site.managedCategory === 'agency') return 'ai'
  if (site.managedCategory === 'portfolio') return 'portfolio'
  return 'client'
}

function visitorLabelFromQualification(sessionId: string, qualification: unknown): string {
  const q = qualification as Record<string, string> | null
  if (q?.company) return q.company
  if (q?.name) return q.name
  return `Visitor ${sessionId.slice(-6)}`
}

function parseInboxId(raw: string): { kind: InboxKind; id: string } | null {
  const prefixed = raw.match(/^(ai|form|lead):(.+)$/)
  if (prefixed) return { kind: prefixed[1] as InboxKind, id: prefixed[2] }
  return { kind: 'ai', id: raw }
}

function formMessageBody(fields: Record<string, unknown>, submitterName: string, submitterEmail: string): string {
  const lines = [`From: ${submitterName}`, `Email: ${submitterEmail}`]
  for (const [key, value] of Object.entries(fields)) {
    if (key === 'message' || value == null || value === '') continue
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    lines.push(`${label}: ${String(value)}`)
  }
  const message = typeof fields.message === 'string' ? fields.message : ''
  if (message) lines.push('', message)
  return lines.join('\n')
}

function leadMessageBody(lead: {
  name: string
  email: string
  company: string | null
  budget: string | null
  projectType: string | null
  message: string
  source: string
}): string {
  const lines = [`From: ${lead.name}`, `Email: ${lead.email}`]
  if (lead.company) lines.push(`Company: ${lead.company}`)
  if (lead.projectType) lines.push(`Project: ${lead.projectType}`)
  if (lead.budget) lines.push(`Budget: ${lead.budget}`)
  lines.push(`Source: ${lead.source}`, '', lead.message)
  return lines.join('\n')
}

type InboxSummary = {
  id: string
  kind: InboxKind
  category: InboxCategory
  siteKey?: string
  siteLabel: string
  visitorLabel: string
  visitorEmail?: string
  subject?: string
  createdAt: string
  updatedAt: string
  turnCount: number
  lastPreview?: string | null
  unread: boolean
  leadScore?: number
  lastIntent?: string | null
  qualification?: Record<string, unknown>
  status?: string
}

function serializeAiSummary(session: {
  sessionId: string
  siteKey: string
  createdAt: Date
  updatedAt: Date
  pageUrl: string | null
  leadScore: number
  qualification: unknown
  _count: { turns: number }
  turns: Array<{ content: string; intent: string | null }>
}): InboxSummary {
  const lastTurn = session.turns[0]
  const sk = session.siteKey || 'nexrena'
  const site = getSiteConfig(sk)
  return {
    id: `ai:${session.sessionId}`,
    kind: 'ai',
    category: inboxCategoryForSite(sk),
    siteKey: sk,
    siteLabel: site?.label ?? siteLabel(sk),
    visitorLabel: visitorLabelFromQualification(session.sessionId, session.qualification),
    subject: session.pageUrl ? `AI chat on ${session.pageUrl}` : `${siteLabel(sk)} AI chat`,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    turnCount: session._count.turns,
    lastPreview: lastTurn?.content?.slice(0, 160) ?? null,
    unread: false,
    leadScore: session.leadScore,
    lastIntent: lastTurn?.intent ?? null,
    qualification: (session.qualification as Record<string, unknown>) ?? {},
  }
}

function serializeFormSummary(row: {
  id: string
  siteKey: string
  formName: string
  submitterName: string
  submitterEmail: string
  fields: unknown
  pageUrl: string | null
  status: string
  createdAt: Date
}): InboxSummary {
  const fields = (row.fields ?? {}) as Record<string, unknown>
  const message = typeof fields.message === 'string' ? fields.message : ''
  return {
    id: `form:${row.id}`,
    kind: 'form',
    category: formInboxCategory(row.siteKey),
    siteKey: row.siteKey,
    siteLabel: siteLabel(row.siteKey),
    visitorLabel: row.submitterName,
    visitorEmail: row.submitterEmail,
    subject: `${row.formName} form · ${siteLabel(row.siteKey)}`,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.createdAt.toISOString(),
    turnCount: 1,
    lastPreview: message.slice(0, 160) || null,
    unread: row.status === 'new',
    status: row.status,
  }
}

function serializeLeadSummary(row: {
  id: string
  name: string
  email: string
  company: string | null
  message: string
  source: string
  status: string
  createdAt: Date
}): InboxSummary {
  return {
    id: `lead:${row.id}`,
    kind: 'lead',
    category: 'portfolio',
    siteKey: 'nexrena',
    siteLabel: 'Nexrena',
    visitorLabel: row.company || row.name,
    visitorEmail: row.email,
    subject: row.source === 'chat-assistant' ? 'Chat lead · Nexrena' : 'Contact form · Nexrena',
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.createdAt.toISOString(),
    turnCount: 1,
    lastPreview: row.message.slice(0, 160) || null,
    unread: row.status === 'new' || !row.status,
    status: row.status,
  }
}

/** GET /api/chat-sessions — unified site inbox for ops (use kind=ai&siteKey= for AI-only per site) */
router.get('/', requireAuth, async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 120, 1), 250)
  const category =
    typeof req.query.category === 'string' && ['ai', 'client', 'portfolio'].includes(req.query.category)
      ? (req.query.category as InboxCategory)
      : undefined
  const kindFilter = req.query.kind === 'ai' ? 'ai' : undefined
  const siteKeyFilter =
    typeof req.query.siteKey === 'string' && req.query.siteKey.trim()
      ? req.query.siteKey.trim()
      : undefined

  const perSource = kindFilter === 'ai' ? limit : Math.ceil(limit / 3) + 20

  const aiWhere = siteKeyFilter ? { siteKey: siteKeyFilter } : undefined

  const [aiSessions, forms, leads, siteStatsRows] = await Promise.all([
    prisma.chatSession.findMany({
      where: aiWhere,
      orderBy: { updatedAt: 'desc' },
      take: perSource,
      include: {
        _count: { select: { turns: true } },
        turns: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, intent: true },
        },
      },
    }),
    kindFilter === 'ai'
      ? Promise.resolve([])
      : prisma.formSubmission.findMany({
          where: { status: { not: 'archived' } },
          orderBy: { createdAt: 'desc' },
          take: perSource,
        }),
    kindFilter === 'ai'
      ? Promise.resolve([])
      : prisma.lead.findMany({
          orderBy: { createdAt: 'desc' },
          take: perSource,
        }),
    prisma.chatSession.groupBy({
      by: ['siteKey'],
      _count: { sessionId: true },
      _max: { updatedAt: true },
    }),
  ])

  let items: InboxSummary[] =
    kindFilter === 'ai'
      ? aiSessions.map(serializeAiSummary)
      : [
          ...aiSessions.map(serializeAiSummary),
          ...forms.map(serializeFormSummary),
          ...leads.map(serializeLeadSummary),
        ]

  if (category) items = items.filter((item) => item.category === category)
  if (siteKeyFilter && kindFilter !== 'ai') {
    items = items.filter((item) => item.siteKey === siteKeyFilter)
  }

  items.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  items = items.slice(0, limit)

  const statsByKey = new Map(
    siteStatsRows.map((row) => [
      row.siteKey || 'nexrena',
      { count: row._count.sessionId, lastAt: row._max.updatedAt },
    ]),
  )

  const siteOptions = Object.entries(SITES)
    .filter(([, site]) => site.chat.enabled)
    .map(([key, site]) => ({
      siteKey: key,
      label: site.label,
      category: site.managedCategory === 'agency' ? 'ai' : site.managedCategory,
      chatEnabled: site.chat.enabled,
      chatCount: statsByKey.get(key)?.count ?? 0,
      lastActivityAt: statsByKey.get(key)?.lastAt?.toISOString() ?? null,
    }))
    .sort((a, b) => {
      const aTime = a.lastActivityAt ? new Date(a.lastActivityAt).getTime() : 0
      const bTime = b.lastActivityAt ? new Date(b.lastActivityAt).getTime() : 0
      return bTime - aTime
    })

  res.json({
    sessions: items,
    limit,
    siteOptions,
    counts: {
      ai: siteStatsRows.reduce((sum, row) => sum + row._count.sessionId, 0),
      clientForms: forms.filter((f) => formInboxCategory(f.siteKey) === 'client').length,
      portfolio:
        leads.length +
        forms.filter((f) => formInboxCategory(f.siteKey) === 'portfolio').length +
        aiSessions.filter((s) => inboxCategoryForSite(s.siteKey || 'nexrena') === 'portfolio').length,
    },
    refreshedAt: new Date().toISOString(),
  })
})

/** GET /api/chat-sessions/managed-sites — ops registry of managed properties */
router.get('/managed-sites/list', requireAuth, (_req, res) => {
  res.json({ sites: listManagedSitesForOps() })
})

/** GET /api/chat-sessions/:inboxId — transcript (ai, form, or lead) */
router.get('/:inboxId', requireAuth, async (req, res) => {
  const parsed = parseInboxId(req.params.inboxId)
  if (!parsed) {
    res.status(400).json({ error: 'Invalid inbox id' })
    return
  }

  if (parsed.kind === 'ai') {
    const session = await prisma.chatSession.findUnique({
      where: { sessionId: parsed.id },
      include: {
        _count: { select: { turns: true } },
        turns: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            intent: true,
            grounded: true,
            flagged: true,
            actions: true,
            createdAt: true,
          },
        },
      },
    })
    if (!session) {
      res.status(404).json({ error: 'Chat session not found' })
      return
    }
    res.json({
      ...serializeAiSummary(session),
      turns: session.turns.map((turn) => ({
        id: turn.id,
        role: turn.role,
        content: turn.content,
        intent: turn.intent,
        grounded: turn.grounded,
        flagged: turn.flagged,
        actions: turn.actions,
        createdAt: turn.createdAt.toISOString(),
      })),
    })
    return
  }

  if (parsed.kind === 'form') {
    const row = await prisma.formSubmission.findUnique({ where: { id: parsed.id } })
    if (!row) {
      res.status(404).json({ error: 'Form submission not found' })
      return
    }
    const fields = (row.fields ?? {}) as Record<string, unknown>
    const content = formMessageBody(fields, row.submitterName, row.submitterEmail)
    res.json({
      ...serializeFormSummary(row),
      pageUrl: row.pageUrl,
      turns: [
        {
          id: row.id,
          role: 'user',
          content,
          createdAt: row.createdAt.toISOString(),
        },
      ],
    })
    return
  }

  const lead = await prisma.lead.findUnique({ where: { id: parsed.id } })
  if (!lead) {
    res.status(404).json({ error: 'Lead not found' })
    return
  }
  res.json({
    ...serializeLeadSummary(lead),
    turns: [
      {
        id: lead.id,
        role: 'user',
        content: leadMessageBody(lead),
        createdAt: lead.createdAt.toISOString(),
      },
    ],
  })
})

export default router
