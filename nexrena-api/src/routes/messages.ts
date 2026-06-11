import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { notifyAdminReply } from '../lib/notify'
import { stripHtml } from '../lib/sanitize'
import {
  effectiveThreadId,
  groupThreads,
  serializeMessage,
  type MessageRow,
} from '../lib/message-serialize'

const router = Router()
const MESSAGE_MAX = 5000

const messageSelect = {
  id: true,
  portalAccountId: true,
  contactId: true,
  clientName: true,
  clientEmail: true,
  companyName: true,
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

/** GET /api/messages */
router.get('/', requireAuth, async (_req, res) => {
  const rows = await prisma.clientMessage.findMany({
    orderBy: { createdAt: 'desc' },
    select: messageSelect,
  })
  res.json(rows.map((row) => serializeMessage(row as MessageRow)))
})

/** GET /api/messages/threads */
router.get('/threads', requireAuth, async (_req, res) => {
  const rows = await prisma.clientMessage.findMany({
    orderBy: { createdAt: 'asc' },
    select: messageSelect,
  })
  const serialized = rows.map((row) => serializeMessage(row as MessageRow))
  const threads = groupThreads(serialized)
  const unreadCount = threads.reduce((sum, t) => sum + t.unreadByAdmin, 0)
  res.json({ threads, unreadCount })
})

/** PATCH /api/messages/threads/:threadId/read */
router.patch('/threads/:threadId/read', requireAuth, async (req, res) => {
  await prisma.clientMessage.updateMany({
    where: {
      direction: 'client',
      readByAdmin: false,
      OR: [{ threadId: req.params.threadId }, { id: req.params.threadId }],
    },
    data: { readByAdmin: true, status: 'read' },
  })
  res.json({ ok: true })
})

/** POST /api/messages/:id/reply */
router.post('/:id/reply', requireAuth, async (req, res) => {
  const rawMessage = typeof req.body.message === 'string' ? req.body.message : ''
  const message = stripHtml(rawMessage)

  if (!message) {
    res.status(400).json({ error: 'message is required' })
    return
  }
  if (message.length > MESSAGE_MAX) {
    res.status(400).json({ error: `message must be at most ${MESSAGE_MAX} characters` })
    return
  }

  const parent = await prisma.clientMessage.findUnique({
    where: { id: req.params.id },
    select: messageSelect,
  })
  if (!parent) {
    res.status(404).json({ error: 'Message not found' })
    return
  }

  const threadId = effectiveThreadId(parent as MessageRow)
  const row = await prisma.clientMessage.create({
    data: {
      portalAccountId: parent.portalAccountId,
      contactId: parent.contactId,
      clientName: parent.clientName,
      clientEmail: parent.clientEmail,
      companyName: parent.companyName,
      subject: parent.subject,
      message,
      status: 'read',
      threadId,
      replyToMessageId: parent.id,
      direction: 'admin',
      readByClient: false,
      readByAdmin: true,
    },
    select: messageSelect,
  })

  if (parent.clientEmail && parent.clientName) {
    notifyAdminReply({
      clientName: parent.clientName,
      clientEmail: parent.clientEmail,
      subject: parent.subject,
      message,
    }).catch(() => {})
  }

  res.status(201).json(serializeMessage(row as MessageRow))
})

/** PATCH /api/messages/:id/read */
router.patch('/:id/read', requireAuth, async (req, res) => {
  const existing = await prisma.clientMessage.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json({ error: 'Message not found' })
    return
  }

  const row = await prisma.clientMessage.update({
    where: { id: req.params.id },
    data: { readByAdmin: true, status: 'read' },
    select: messageSelect,
  })
  res.json(serializeMessage(row as MessageRow))
})

/** PATCH /api/messages/:id */
router.patch('/:id', requireAuth, async (req, res) => {
  const { status } = req.body as { status?: string }
  if (status !== 'unread' && status !== 'read') {
    res.status(400).json({ error: 'status must be "unread" or "read"' })
    return
  }

  const row = await prisma.clientMessage.update({
    where: { id: req.params.id },
    data: {
      status,
      readByAdmin: status === 'read',
    },
    select: messageSelect,
  })
  res.json(serializeMessage(row as MessageRow))
})

export default router
