import { Router } from 'express'
import { getWebsiteMediaSource } from '../lib/website-media-sources'
import { indexWebsiteMedia } from '../lib/website-media-index'

const router = Router()

/** GET /api/portal-website-media?contactId= — ops view of website media catalog */
router.get('/', async (req, res) => {
  const contactId = typeof req.query.contactId === 'string'
    ? req.query.contactId.trim()
    : ''

  if (!contactId) {
    res.status(400).json({ error: 'contactId query parameter is required' })
    return
  }

  const source = getWebsiteMediaSource(contactId)
  if (!source) {
    res.status(404).json({ error: 'No website media source configured for this contact' })
    return
  }

  const catalog = await indexWebsiteMedia(contactId)
  if (!catalog) {
    res.status(404).json({ error: 'Could not index website media' })
    return
  }

  res.json(catalog)
})

export default router
