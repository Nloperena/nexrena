import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requirePortalAuth } from '../middleware/portal-auth'
import { serializeClientResource } from '../lib/client-resource-utils'

const router = Router()

/** GET /api/portal/resources */
router.get('/', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const rows = await prisma.clientResource.findMany({
    where: { contactId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(rows.map(serializeClientResource))
})

export default router
