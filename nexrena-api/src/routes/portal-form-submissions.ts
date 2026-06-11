import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requirePortalAuth } from '../middleware/portal-auth'

const router = Router()

function serialize(row: {
  id: string
  siteKey: string
  formName: string
  submitterName: string
  submitterEmail: string
  fields: unknown
  pageUrl: string | null
  status: string
  createdAt: Date
}) {
  return {
    id: row.id,
    siteKey: row.siteKey,
    formName: row.formName,
    submitterName: row.submitterName,
    submitterEmail: row.submitterEmail,
    fields: row.fields,
    pageUrl: row.pageUrl,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }
}

/** GET /api/portal/form-submissions — client's website form leads */
router.get('/', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const rows = await prisma.formSubmission.findMany({
    where: { contactId },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  res.json(rows.map(serialize))
})

export default router
