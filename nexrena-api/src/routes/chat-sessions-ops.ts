import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router = Router()

function visitorLabel(sessionId: string, qualification: unknown): string {
  const q = qualification as Record<string, string> | null
  if (q?.company) return q.company
  if (q?.name) return q.name
  return `Visitor ${sessionId.slice(-6)}`
}

function serializeSummary(session: {
  sessionId: string
  createdAt: Date
  updatedAt: Date
  pageUrl: string | null
  leadScore: number
  qualification: unknown
  _count: { turns: number }
  turns: Array<{ content: string; role: string; intent: string | null }>
}) {
  const lastTurn = session.turns[0]
  return {
    sessionId: session.sessionId,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    pageUrl: session.pageUrl,
    leadScore: session.leadScore,
    qualification: session.qualification ?? {},
    turnCount: session._count.turns,
    lastPreview: lastTurn?.content?.slice(0, 160) ?? null,
    lastRole: lastTurn?.role ?? null,
    lastIntent: lastTurn?.intent ?? null,
    visitorLabel: visitorLabel(session.sessionId, session.qualification),
  }
}

/** GET /api/chat-sessions — list website AI chat sessions for ops */
router.get('/', requireAuth, async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 80, 1), 200)
  const offset = Math.max(Number(req.query.offset) || 0, 0)

  const sessions = await prisma.chatSession.findMany({
    orderBy: { updatedAt: 'desc' },
    take: limit,
    skip: offset,
    include: {
      _count: { select: { turns: true } },
      turns: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, role: true, intent: true },
      },
    },
  })

  res.json({
    sessions: sessions.map(serializeSummary),
    limit,
    offset,
  })
})

/** GET /api/chat-sessions/:sessionId — full transcript */
router.get('/:sessionId', requireAuth, async (req, res) => {
  const session = await prisma.chatSession.findUnique({
    where: { sessionId: req.params.sessionId },
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
    ...serializeSummary(session),
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
})

export default router
