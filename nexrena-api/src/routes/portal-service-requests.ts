import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requirePortalAuth } from '../middleware/portal-auth'
import { notifyNewLead } from '../lib/notify'

const router = Router()

function serializeRequest(row: {
  id: string
  contactId: string
  projectType: string
  description: string
  budget: string | null
  timeline: string | null
  status: string
  source: string
  createdAt: Date
  updatedAt: Date
  assets?: {
    id: string
    filename: string
    contentType: string
    sizeBytes: number
    blobUrl: string
    createdAt: Date
  }[]
}) {
  return {
    id: row.id,
    contactId: row.contactId,
    projectType: row.projectType,
    description: row.description,
    budget: row.budget,
    timeline: row.timeline,
    status: row.status,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    assets: row.assets?.map(a => ({
      id: a.id,
      filename: a.filename,
      contentType: a.contentType,
      sizeBytes: a.sizeBytes,
      blobUrl: a.blobUrl,
      createdAt: a.createdAt.toISOString(),
    })),
  }
}

/** GET /api/portal/service-requests */
router.get('/', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const rows = await prisma.serviceRequest.findMany({
    where: { contactId },
    orderBy: { createdAt: 'desc' },
    include: { assets: { orderBy: { createdAt: 'desc' } } },
  })
  res.json(rows.map(serializeRequest))
})

/** POST /api/portal/service-requests */
router.post('/', requirePortalAuth, async (req, res) => {
  const { projectType, description, budget, timeline } = req.body as {
    projectType?: string
    description?: string
    budget?: string
    timeline?: string
  }

  const trimmedType = projectType?.trim()
  const trimmedDescription = description?.trim()
  if (!trimmedType || !trimmedDescription) {
    res.status(400).json({ error: 'projectType and description are required' })
    return
  }

  const account = await prisma.portalAccount.findUnique({
    where: { id: req.portalUser!.accountId },
  })
  if (!account) {
    res.status(404).json({ error: 'Account not found' })
    return
  }

  const row = await prisma.serviceRequest.create({
    data: {
      contactId: account.contactId,
      portalAccountId: account.id,
      projectType: trimmedType,
      description: trimmedDescription,
      budget: budget?.trim() || null,
      timeline: timeline?.trim() || null,
      source: 'portal',
      status: 'new',
    },
    include: { assets: true },
  })

  notifyNewLead({
    name: account.name,
    email: account.email,
    company: account.company,
    budget: row.budget,
    projectType: row.projectType,
    message: `Portal service request:\n\n${row.description}${row.timeline ? `\n\nTimeline: ${row.timeline}` : ''}`,
  }).catch(() => {})

  res.status(201).json(serializeRequest(row))
})

export default router
