import { Router } from 'express'
import { requirePortalAuth } from '../middleware/portal-auth'
import { getWebsiteMediaSource } from '../lib/website-media-sources'
import { indexWebsiteMedia } from '../lib/website-media-index'

const router = Router()

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
    })
    return
  }

  const catalog = await indexWebsiteMedia(contactId)
  res.json(catalog)
})

export default router
