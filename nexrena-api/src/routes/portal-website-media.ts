import { Router } from 'express'
import multer from 'multer'
import { requirePortalAuth } from '../middleware/portal-auth'
import { getWebsiteMediaSource } from '../lib/website-media-sources'
import { indexWebsiteMedia } from '../lib/website-media-index'
import {
  hasWebsiteMediaUpload,
  uploadWebsiteMediaFile,
  validateWebsiteMediaUpload,
} from '../lib/website-media-upload'

const router = Router()

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
})

/** GET /api/portal/website-media — catalog for logged-in portal client */
router.get('/', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const source = getWebsiteMediaSource(contactId)
  if (!source) {
    res.json({
      contactId,
      label: null,
      baseUrl: null,
      folders: [],
      items: [],
      indexedAt: new Date().toISOString(),
      uploadEnabled: false,
    })
    return
  }

  const catalog = await indexWebsiteMedia(contactId)
  res.json({
    ...catalog,
    uploadEnabled: hasWebsiteMediaUpload(contactId),
  })
})

/** POST /api/portal/website-media — upload into a website media folder (GitHub commit) */
router.post('/', requirePortalAuth, upload.single('file'), async (req, res) => {
  const file = req.file
  if (!file) {
    res.status(400).json({ error: 'file is required' })
    return
  }

  const contactId = req.portalUser!.contactId
  if (!getWebsiteMediaSource(contactId)) {
    res.status(404).json({ error: 'Website media is not available for this account.' })
    return
  }

  const folderId = typeof req.body.folderId === 'string' ? req.body.folderId.trim() : ''
  if (!folderId) {
    res.status(400).json({ error: 'folderId is required — select a folder first.' })
    return
  }

  const validationError = validateWebsiteMediaUpload(file)
  if (validationError) {
    const status = /not configured/i.test(validationError) ? 503 : 400
    res.status(status).json({ error: validationError })
    return
  }

  try {
    const result = await uploadWebsiteMediaFile(contactId, folderId, file)
    const catalog = await indexWebsiteMedia(contactId)
    res.status(201).json({
      ...result,
      catalog,
    })
  } catch (err) {
    console.error('[portal website-media upload]', err)
    const message = err instanceof Error ? err.message : 'Upload failed'
    const status = /not configured|not available|missing/i.test(message) ? 503 : 500
    res.status(status).json({ error: message })
  }
})

export default router
