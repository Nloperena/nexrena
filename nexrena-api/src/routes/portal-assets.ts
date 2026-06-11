import { Router } from 'express'
import multer from 'multer'
import { prisma } from '../lib/prisma'
import { requirePortalAuth } from '../middleware/portal-auth'
import { blobUploadErrorMessage, uploadPortalAsset, validateUpload } from '../lib/blob-upload'
import { serializePortalAsset } from '../lib/portal-asset-serialize'

const router = Router()
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
})

const ASSET_CATEGORIES = new Set(['logo', 'photos', 'documents', 'other'])

function parseFolderId(raw: unknown): string | null | undefined {
  if (raw === undefined) return undefined
  if (raw === null || raw === 'root' || raw === '') return null
  return typeof raw === 'string' ? raw.trim() || null : undefined
}

/** GET /api/portal/assets?folderId= */
router.get('/', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const folderId = parseFolderId(req.query.folderId)

  const rows = await prisma.portalAsset.findMany({
    where: {
      contactId,
      ...(folderId !== undefined ? { folderId } : {}),
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(rows.map(serializePortalAsset))
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
  const folderId = parseFolderId(req.body.folderId)
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

  if (folderId) {
    const folder = await prisma.portalFolder.findFirst({ where: { id: folderId, contactId } })
    if (!folder) {
      res.status(404).json({ error: 'Folder not found' })
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
        folderId: folderId ?? null,
        category,
        note,
        ...uploaded,
      },
    })
    res.status(201).json(serializePortalAsset(row))
  } catch (err) {
    console.error('[portal assets upload]', err)
    const message = blobUploadErrorMessage(err)
    const status = /not configured/i.test(message) ? 503 : 500
    res.status(status).json({ error: message })
  }
})

/** PATCH /api/portal/assets/:id — move to folder */
router.patch('/:id', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const existing = await prisma.portalAsset.findFirst({
    where: { id: req.params.id, contactId },
  })
  if (!existing) {
    res.status(404).json({ error: 'Asset not found' })
    return
  }

  if (!('folderId' in req.body)) {
    res.status(400).json({ error: 'folderId is required' })
    return
  }

  const folderId = parseFolderId(req.body.folderId)
  if (folderId === undefined) {
    res.status(400).json({ error: 'folderId must be a string, null, or "root"' })
    return
  }

  if (folderId) {
    const folder = await prisma.portalFolder.findFirst({ where: { id: folderId, contactId } })
    if (!folder) {
      res.status(404).json({ error: 'Folder not found' })
      return
    }
  }

  const row = await prisma.portalAsset.update({
    where: { id: req.params.id },
    data: { folderId },
  })
  res.json(serializePortalAsset(row))
})

export default router
