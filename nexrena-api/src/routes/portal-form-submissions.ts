import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requirePortalAuth } from '../middleware/portal-auth'

const router = Router()

const STATUSES = ['new', 'read', 'archived'] as const
type FormStatus = (typeof STATUSES)[number]

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

async function findOwnedSubmission(id: string, contactId: string) {
  return prisma.formSubmission.findFirst({
    where: { id, contactId },
  })
}

/** GET /api/portal/form-submissions — client's website form leads */
router.get('/', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const view = typeof req.query.view === 'string' ? req.query.view : 'all'

  const statusFilter =
    view === 'active'
      ? { status: { not: 'archived' } }
      : view === 'archived'
        ? { status: 'archived' }
        : {}

  const rows = await prisma.formSubmission.findMany({
    where: { contactId, ...statusFilter },
    orderBy: { createdAt: 'desc' },
    take: 100,
  })
  res.json(rows.map(serialize))
})

/** PATCH /api/portal/form-submissions/:id — mark read, archive, restore */
router.patch('/:id', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const { status } = req.body as { status?: string }

  if (!status || !STATUSES.includes(status as FormStatus)) {
    res.status(400).json({ error: 'status must be "new", "read", or "archived"' })
    return
  }

  const existing = await findOwnedSubmission(req.params.id, contactId)
  if (!existing) {
    res.status(404).json({ error: 'Form submission not found' })
    return
  }

  const row = await prisma.formSubmission.update({
    where: { id: existing.id },
    data: { status },
  })
  res.json(serialize(row))
})

/** DELETE /api/portal/form-submissions/:id — permanent delete (archived only) */
router.delete('/:id', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const existing = await findOwnedSubmission(req.params.id, contactId)

  if (!existing) {
    res.status(404).json({ error: 'Form submission not found' })
    return
  }

  if (existing.status !== 'archived') {
    res.status(400).json({ error: 'Move to archive before deleting permanently' })
    return
  }

  await prisma.formSubmission.delete({ where: { id: existing.id } })
  res.json({ ok: true })
})

export default router
