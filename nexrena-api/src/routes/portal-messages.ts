import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { prisma } from '../lib/prisma'
import { requirePortalAuth } from '../middleware/portal-auth'
import { notifyClientMessage } from '../lib/notify'
import { stripHtml } from '../lib/sanitize'

const router = Router()

const SUBJECT_MAX = 200
const MESSAGE_MAX = 5000
const DEFAULT_SUBJECT = 'Message from client portal'

const messageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many messages, try again later.' },
  keyGenerator: (req) => req.portalUser?.accountId ?? req.ip ?? 'unknown',
})

function serializeMessage(row: {
  id: string
  subject: string
  message: string
  status: string
  createdAt: Date
}) {
  return {
    id: row.id,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }
}

/** GET /api/portal/messages */
router.get('/', requirePortalAuth, async (req, res) => {
  const accountId = req.portalUser!.accountId
  const rows = await prisma.clientMessage.findMany({
    where: { portalAccountId: accountId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      subject: true,
      message: true,
      status: true,
      createdAt: true,
    },
  })
  res.json(rows.map(serializeMessage))
})

/** POST /api/portal/messages */
router.post('/', requirePortalAuth, messageLimiter, async (req, res) => {
  const rawSubject = typeof req.body.subject === 'string' ? req.body.subject.trim() : ''
  const rawMessage = typeof req.body.message === 'string' ? req.body.message : ''

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

  const row = await prisma.clientMessage.create({
    data: {
      portalAccountId: account.id,
      contactId: account.contactId,
      clientName: account.name,
      clientEmail: account.email,
      companyName: account.company,
      subject,
      message,
      status: 'unread',
    },
  })

  notifyClientMessage({
    clientName: account.name,
    clientEmail: account.email,
    companyName: account.company,
    subject,
    message,
  }).catch(() => {})

  res.status(201).json(serializeMessage(row))
})

export default router
