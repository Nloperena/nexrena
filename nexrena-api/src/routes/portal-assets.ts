import { Router } from 'express'
import multer from 'multer'
import { prisma } from '../lib/prisma'
import { requirePortalAuth } from '../middleware/portal-auth'
import { uploadPortalAsset, validateUpload } from '../lib/blob-upload'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
})

const ASSET_CATEGORIES = new Set(['logo', 'photos', 'documents', 'other'])

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

/** GET /api/portal/assets */
router.get('/', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const rows = await prisma.portalAsset.findMany({
    where: { contactId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(rows.map(serializeAsset))
})

/** POST /api/portal/assets — multipart file upload */
router.post('/', requirePortalAuth, upload.single('file'), async (req, res) => {
  const file = req.file
  if (!file) {
    res.status(400).json({ error: 'file is required' })
    return
  }

  const validationError = validateUpload(file)
  if (validationError) {
    res.status(400).json({ error: validationError })
    return
  }

  const contactId = req.portalUser!.contactId
  const serviceRequestId = typeof req.body.serviceRequestId === 'string'
    ? req.body.serviceRequestId.trim() || undefined
    : undefined
  const projectId = typeof req.body.projectId === 'string'
    ? req.body.projectId.trim() || undefined
    : undefined
  const rawCategory = typeof req.body.category === 'string' ? req.body.category.trim().toLowerCase() : ''
  const category = ASSET_CATEGORIES.has(rawCategory) ? rawCategory : null
  const note = typeof req.body.note === 'string' ? req.body.note.trim().slice(0, 500) || null : null

  if (serviceRequestId) {
    const request = await prisma.serviceRequest.findFirst({
      where: { id: serviceRequestId, contactId },
    })
    if (!request) {
      res.status(404).json({ error: 'Service request not found' })
      return
    }
  }

  try {
    const uploaded = await uploadPortalAsset(contactId, file, serviceRequestId)
    const row = await prisma.portalAsset.create({
      data: {
        contactId,
        serviceRequestId: serviceRequestId ?? null,
        projectId: projectId ?? null,
        category,
        note,
        ...uploaded,
      },
    })
    res.status(201).json(serializeAsset(row))
  } catch (err) {
    console.error('[portal assets upload]', err)
    res.status(500).json({ error: 'Upload failed' })
  }
})

export default router
