import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import multer from 'multer'
import { prisma } from '../lib/prisma'
import { requirePortalAuth } from '../middleware/portal-auth'
import { notifyClientMessage } from '../lib/notify'
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
  portalMessageSelect,
  serializePortalMessage,
  type MessageRow,
} from '../lib/message-serialize'
import { emitMessageCreated, emitThreadRead } from '../lib/message-stream'

const router = Router()

const SUBJECT_MAX = 200
const MESSAGE_MAX = 5000
const DEFAULT_SUBJECT = 'Message from client portal'

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MESSAGE_ATTACHMENT_LIMITS.videoMaxBytes,
    files: MESSAGE_ATTACHMENT_LIMITS.maxFiles,
  },
})

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
    select: portalMessageSelect,
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

/** GET /api/portal/messages/attachments/:id/url — signed URL for attachment */
router.get('/attachments/:id/url', requirePortalAuth, async (req, res) => {
  const accountId = req.portalUser!.accountId
  const attachment = await prisma.messageAttachment.findFirst({
    where: {
      id: req.params.id,
      message: { portalAccountId: accountId },
    },
  })
  if (!attachment) {
    res.status(404).json({ error: 'Attachment not found' })
    return
  }

  try {
    const signed = await createPrivateBlobSignedUrl(attachment.pathname)
    res.json(signed)
  } catch (err) {
    console.error('[portal message attachment url]', err)
    res.status(500).json({ error: blobUploadErrorMessage(err) })
  }
})

/** POST /api/portal/messages — multipart text + optional attachments */
router.post('/', requirePortalAuth, messageLimiter, upload.array('files', MESSAGE_ATTACHMENT_LIMITS.maxFiles), async (req, res) => {
  const rawSubject = typeof req.body.subject === 'string' ? req.body.subject.trim() : ''
  const rawMessage = typeof req.body.message === 'string' ? req.body.message : ''
  const rawThreadId = typeof req.body.threadId === 'string' ? req.body.threadId.trim() : ''
  const files = req.files as Express.Multer.File[] | undefined

  const subject = stripHtml(rawSubject || DEFAULT_SUBJECT)
  const message = stripHtml(rawMessage)

  if (!message && (!files || files.length === 0)) {
    res.status(400).json({ error: 'message or attachment is required' })
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

  for (const file of files ?? []) {
    const validationError = validateMessageAttachment(file)
    if (validationError) {
      res.status(400).json({ error: validationError })
      return
    }
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

  try {
    const uploadedAttachments = []
    for (const file of files ?? []) {
      const uploaded = await uploadMessageAttachment(account.contactId, file)
      uploadedAttachments.push(uploaded)
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
      select: portalMessageSelect,
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
        message: message || 'Sent an attachment',
      }).catch(() => {})
    }

    const created = { ...row, threadId: threadKey } as MessageRow
    emitMessageCreated(created)
    res.status(201).json(serializePortalMessage(created))
  } catch (err) {
    console.error('[portal messages upload]', err)
    const messageText = blobUploadErrorMessage(err)
    const status = /not configured/i.test(messageText) ? 503 : 500
    res.status(status).json({ error: messageText })
  }
})

/** PATCH /api/portal/messages/threads/:threadId/read */
router.patch('/threads/:threadId/read', requirePortalAuth, async (req, res) => {
  const accountId = req.portalUser!.accountId
  const threadId = req.params.threadId
  const sample = await prisma.clientMessage.findFirst({
    where: {
      portalAccountId: accountId,
      OR: [{ threadId }, { id: threadId }],
    },
    select: { contactId: true, portalAccountId: true },
  })

  await prisma.clientMessage.updateMany({
    where: {
      portalAccountId: accountId,
      direction: 'admin',
      readByClient: false,
      OR: [{ threadId }, { id: threadId }],
    },
    data: { readByClient: true },
  })

  if (sample) {
    emitThreadRead({
      threadId,
      reader: 'client',
      contactId: sample.contactId,
      portalAccountId: sample.portalAccountId ?? accountId,
    })
  }

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
    select: portalMessageSelect,
  })
  res.json(serializePortalMessage(row as MessageRow))
})

export default router
