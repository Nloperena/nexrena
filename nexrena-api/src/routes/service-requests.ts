import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

/** GET /api/service-requests — ops view */
router.get('/', async (_req, res) => {
  const rows = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      assets: { orderBy: { createdAt: 'desc' } },
    },
  })

  const contactIds = [...new Set(rows.map(r => r.contactId))]
  const contacts = await prisma.contact.findMany({
    where: { id: { in: contactIds } },
    select: { id: true, name: true, company: true, email: true },
  })
  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]))

  res.json(
    rows.map(row => ({
      ...row,
      contactName: contactMap[row.contactId]?.name ?? 'Unknown',
      contactCompany: contactMap[row.contactId]?.company ?? '',
      contactEmail: contactMap[row.contactId]?.email ?? '',
    })),
  )
})

/** PATCH /api/service-requests/:id */
router.patch('/:id', async (req, res) => {
  const { status } = req.body as { status?: string }
  if (!status) {
    res.status(400).json({ error: 'status is required' })
    return
  }

  const updated = await prisma.serviceRequest.update({
    where: { id: req.params.id },
    data: { status },
    include: { assets: true },
  })
  res.json(updated)
})

export default router
