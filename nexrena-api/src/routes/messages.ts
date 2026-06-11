import { Router } from 'express'
import multer from 'multer'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { notifyAdminReply } from '../lib/notify'
import { stripHtml } from '../lib/sanitize'
import {
  blobUploadErrorMessage,
  MESSAGE_ATTACHMENT_LIMITS,
  uploadMessageAttachment,
  validateMessageAttachment,
} from '../lib/blob-upload'
import { createPrivateBlobSignedUrl } from '../lib/blob-signed-url'
import {
  effectiveThreadId,
  groupThreads,
  messageSelect,
  serializeMessage,
  type MessageRow,
} from '../lib/message-serialize'

const router = Router()
const MESSAGE_MAX = 5000

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MESSAGE_ATTACHMENT_LIMITS.videoMaxBytes,
    files: MESSAGE_ATTACHMENT_LIMITS.maxFiles,
  },
})

async function contactMessageWhere(contactId: string) {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
    select: { email: true },
  })
  if (!contact) return undefined

  const portalAccounts = await prisma.portalAccount.findMany({
    where: { contactId },
    select: { email: true },
  })

  const emails = new Set<string>()
  if (contact.email) emails.add(contact.email.toLowerCase())
  for (const account of portalAccounts) {
    if (account.email) emails.add(account.email.toLowerCase())
  }

  const emailFilters = [...emails].map((email) => ({
    clientEmail: { equals: email, mode: 'insensitive' as const },
  }))

  return {
    OR: [{ contactId }, ...emailFilters],
  }
}

/** GET /api/messages */
router.get('/', requireAuth, async (_req, res) => {
  const rows = await prisma.clientMessage.findMany({
    orderBy: { createdAt: 'desc' },
    select: messageSelect,
  })
  res.json(rows.map((row) => serializeMessage(row as MessageRow)))
})

/** GET /api/messages/threads */
router.get('/threads', requireAuth, async (req, res) => {
  const contactId = typeof req.query.contactId === 'string'
    ? req.query.contactId.trim() || undefined
    : undefined

  let messageWhere: NonNullable<Awaited<ReturnType<typeof contactMessageWhere>>> | undefined
  if (contactId) {
    const filter = await contactMessageWhere(contactId)
    if (!filter) {
      res.json({ threads: [], unreadCount: 0 })
      return
    }
    messageWhere = filter
  }

  const rows = await prisma.clientMessage.findMany({
    where: messageWhere,
    orderBy: { createdAt: 'asc' },
    select: messageSelect,
  })
  const serialized = rows.map((row) => serializeMessage(row as MessageRow))
  const threads = groupThreads(serialized)
  const unreadCount = threads.reduce((sum, t) => sum + t.unreadByAdmin, 0)
  res.json({ threads, unreadCount })
})

/** GET /api/messages/attachments/:id/url — signed URL for ops */
router.get('/attachments/:id/url', requireAuth, async (req, res) => {
  const attachment = await prisma.messageAttachment.findUnique({
    where: { id: req.params.id },
  })
  if (!attachment) {
    res.status(404).json({ error: 'Attachment not found' })
    return
  }

  try {
    const signed = await createPrivateBlobSignedUrl(attachment.pathname)
    res.json(signed)
  } catch (err) {
    console.error('[ops message attachment url]', err)
    res.status(500).json({ error: blobUploadErrorMessage(err) })
  }
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

/** POST /api/messages/:id/reply — multipart reply with optional attachments */
router.post('/:id/reply', requireAuth, upload.array('files', MESSAGE_ATTACHMENT_LIMITS.maxFiles), async (req, res) => {
  const rawMessage = typeof req.body.message === 'string' ? req.body.message : ''
  const message = stripHtml(rawMessage)
  const files = req.files as Express.Multer.File[] | undefined

  if (!message && (!files || files.length === 0)) {
    res.status(400).json({ error: 'message or attachment is required' })
    return
  }
  if (message.length > MESSAGE_MAX) {
    res.status(400).json({ error: `message must be at most ${MESSAGE_MAX} characters` })
    return
  }

  for (const file of files ?? []) {
    const validationError = validateMessageAttachment(file)
    if (validationError) {
      res.status(400).json({ error: validationError })
      return
    }
  }

  const parent = await prisma.clientMessage.findUnique({
    where: { id: req.params.id },
    select: messageSelect,
  })
  if (!parent) {
    res.status(404).json({ error: 'Message not found' })
    return
  }

  const contactId = parent.contactId
  if (!contactId) {
    res.status(400).json({ error: 'Parent message has no contact' })
    return
  }

  try {
    const uploadedAttachments = []
    for (const file of files ?? []) {
      const uploaded = await uploadMessageAttachment(contactId, file)
      uploadedAttachments.push(uploaded)
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
        attachments: uploadedAttachments.length
          ? {
              create: uploadedAttachments.map((a) => ({
                blobUrl: a.blobUrl,
                pathname: a.pathname,
                filename: a.filename,
                mimeType: a.mimeType,
                sizeBytes: a.sizeBytes,
              })),
            }
          : undefined,
      },
      select: messageSelect,
    })

    if (parent.clientEmail && parent.clientName) {
      notifyAdminReply({
        clientName: parent.clientName,
        clientEmail: parent.clientEmail,
        subject: parent.subject,
        message: message || 'Sent an attachment',
      }).catch(() => {})
    }

    res.status(201).json(serializeMessage(row as MessageRow))
  } catch (err) {
    console.error('[ops message reply upload]', err)
    const messageText = blobUploadErrorMessage(err)
    const status = /not configured/i.test(messageText) ? 503 : 500
    res.status(status).json({ error: messageText })
  }
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
