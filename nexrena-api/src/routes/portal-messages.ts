import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { prisma } from '../lib/prisma'
import { requirePortalAuth } from '../middleware/portal-auth'
import { notifyClientMessage } from '../lib/notify'
import { stripHtml } from '../lib/sanitize'
import {
  effectiveThreadId,
  groupThreads,
  serializePortalMessage,
  type MessageRow,
} from '../lib/message-serialize'

const router = Router()

const SUBJECT_MAX = 200
const MESSAGE_MAX = 5000
const DEFAULT_SUBJECT = 'Message from client portal'

const messageSelect = {
  id: true,
  subject: true,
  message: true,
  status: true,
  threadId: true,
  replyToMessageId: true,
  direction: true,
  readByClient: true,
  readByAdmin: true,
  createdAt: true,
} as const

const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many messages, try again later.' },
  keyGenerator: (req) => req.portalUser?.accountId ?? req.ip ?? 'unknown',
})

async function accountMessages(accountId: string) {
  return prisma.clientMessage.findMany({
    where: { portalAccountId: accountId },
    orderBy: { createdAt: 'asc' },
    select: messageSelect,
  }) as Promise<MessageRow[]>
}

/** GET /api/portal/messages — threaded conversations */
router.get('/', requirePortalAuth, async (req, res) => {
  const accountId = req.portalUser!.accountId
  const rows = await accountMessages(accountId)
  const serialized = rows.map(serializePortalMessage)
  const threads = groupThreads(serialized)
  const unreadCount = threads.reduce((sum, t) => sum + t.unreadByClient, 0)
  res.json({ threads, unreadCount })
})

/** POST /api/portal/messages */
router.post('/', requirePortalAuth, messageLimiter, async (req, res) => {
  const rawSubject = typeof req.body.subject === 'string' ? req.body.subject.trim() : ''
  const rawMessage = typeof req.body.message === 'string' ? req.body.message : ''
  const rawThreadId = typeof req.body.threadId === 'string' ? req.body.threadId.trim() : ''

  const subject = stripHtml(rawSubject || DEFAULT_SUBJECT)
  const message = stripHtml(rawMessage)

  if (!message) {
    res.status(400).json({ error: 'message is required' })
    return
  }
  if (subject.length > SUBJECT_MAX) {
    res.status(400).json({ error: `subject must be at most ${SUBJECT_MAX} characters` })
    return
  }
  if (message.length > MESSAGE_MAX) {
    res.status(400).json({ error: `message must be at most ${MESSAGE_MAX} characters` })
    return
  }

  const account = await prisma.portalAccount.findUnique({
    where: { id: req.portalUser!.accountId },
  })
  if (!account) {
    res.status(404).json({ error: 'Account not found' })
    return
  }

  let threadId: string | null = null
  let replyToMessageId: string | null = null
  let resolvedSubject = subject

  if (rawThreadId) {
    const threadRoot = await prisma.clientMessage.findFirst({
      where: {
        portalAccountId: account.id,
        OR: [{ threadId: rawThreadId }, { id: rawThreadId }],
      },
      orderBy: { createdAt: 'asc' },
    })
    if (!threadRoot) {
      res.status(404).json({ error: 'Thread not found' })
      return
    }
    threadId = effectiveThreadId(threadRoot as MessageRow)
    replyToMessageId = threadRoot.id
    resolvedSubject = threadRoot.subject
  }

  const row = await prisma.clientMessage.create({
    data: {
      portalAccountId: account.id,
      contactId: account.contactId,
      clientName: account.name,
      clientEmail: account.email,
      companyName: account.company,
      subject: resolvedSubject,
      message,
      status: 'unread',
      threadId,
      replyToMessageId,
      direction: 'client',
      readByClient: true,
      readByAdmin: false,
    },
    select: messageSelect,
  })

  const threadKey = threadId ?? row.id
  if (!threadId) {
    await prisma.clientMessage.update({
      where: { id: row.id },
      data: { threadId: threadKey },
    })
  }

  if (!rawThreadId) {
    notifyClientMessage({
      clientName: account.name,
      clientEmail: account.email,
      companyName: account.company,
      subject: resolvedSubject,
      message,
    }).catch(() => {})
  }

  res.status(201).json(serializePortalMessage({ ...row, threadId: threadKey } as MessageRow))
})

/** PATCH /api/portal/messages/threads/:threadId/read */
router.patch('/threads/:threadId/read', requirePortalAuth, async (req, res) => {
  const accountId = req.portalUser!.accountId
  await prisma.clientMessage.updateMany({
    where: {
      portalAccountId: accountId,
      direction: 'admin',
      readByClient: false,
      OR: [{ threadId: req.params.threadId }, { id: req.params.threadId }],
    },
    data: { readByClient: true },
  })
  res.json({ ok: true })
})

/** PATCH /api/portal/messages/:id/read */
router.patch('/:id/read', requirePortalAuth, async (req, res) => {
  const accountId = req.portalUser!.accountId
  const existing = await prisma.clientMessage.findFirst({
    where: { id: req.params.id, portalAccountId: accountId, direction: 'admin' },
  })
  if (!existing) {
    res.status(404).json({ error: 'Message not found' })
    return
  }

  const row = await prisma.clientMessage.update({
    where: { id: req.params.id },
    data: { readByClient: true },
    select: messageSelect,
  })
  res.json(serializePortalMessage(row as MessageRow))
})

export default router
