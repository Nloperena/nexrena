import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

function serializeAsset(row: {
  id: string
  contactId: string
  serviceRequestId: string | null
  projectId: string | null
  filename: string
  contentType: string
  sizeBytes: number
  blobUrl: string
  pathname: string
  category: string | null
  note: string | null
  createdAt: Date
}) {
  return {
    id: row.id,
    contactId: row.contactId,
    serviceRequestId: row.serviceRequestId,
    projectId: row.projectId,
    filename: row.filename,
    contentType: row.contentType,
    sizeBytes: row.sizeBytes,
    blobUrl: row.blobUrl,
    pathname: row.pathname,
    category: row.category,
    note: row.note,
    createdAt: row.createdAt.toISOString(),
  }
}

/** GET /api/portal-assets — ops view of all client uploads */
router.get('/', async (req, res) => {
  const contactId = typeof req.query.contactId === 'string'
    ? req.query.contactId.trim() || undefined
    : undefined

  const rows = await prisma.portalAsset.findMany({
    where: contactId ? { contactId } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  const contactIds = [...new Set(rows.map((r) => r.contactId))]
  const contacts = await prisma.contact.findMany({
    where: { id: { in: contactIds } },
    select: { id: true, name: true, company: true, email: true },
  })
  const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c]))

  res.json(
    rows.map((row) => ({
      ...serializeAsset(row),
      contactName: contactMap[row.contactId]?.name ?? 'Unknown',
      contactCompany: contactMap[row.contactId]?.company ?? '',
      contactEmail: contactMap[row.contactId]?.email ?? '',
    })),
  )
})

export default router
