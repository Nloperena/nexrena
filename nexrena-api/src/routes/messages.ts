import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router = Router()

function serializeMessage(row: {
  id: string
  portalAccountId: string | null
  contactId: string | null
  clientName: string | null
  clientEmail: string | null
  companyName: string | null
  subject: string
  message: string
  status: string
  createdAt: Date
}) {
  return {
    id: row.id,
    portalAccountId: row.portalAccountId,
    contactId: row.contactId,
    clientName: row.clientName,
    clientEmail: row.clientEmail,
    companyName: row.companyName,
    subject: row.subject,
    message: row.message,
    status: row.status as 'unread' | 'read',
    createdAt: row.createdAt.toISOString(),
  }
}

/** GET /api/messages */
router.get('/', requireAuth, async (_req, res) => {
  const rows = await prisma.clientMessage.findMany({
    orderBy: { createdAt: 'desc' },
  })
  res.json(rows.map(serializeMessage))
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
    data: { status },
  })
  res.json(serializeMessage(row))
})

export default router
