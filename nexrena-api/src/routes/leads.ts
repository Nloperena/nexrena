import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { notifyNewLead } from '../lib/notify'

const router = Router()

/** POST /api/leads — PUBLIC endpoint for website contact form */
router.post('/', async (req, res) => {
  const { name, email, message, company, budget, projectType } = req.body
  if (!name || !email || !message) {
    res.status(400).json({ error: 'name, email, and message are required' })
    return
  }
  const lead = await prisma.lead.create({
    data: { name, email, message, company: company || null, budget: budget || null, projectType: projectType || null, status: 'new' },
  })

  notifyNewLead({ name, email, message, company, budget, projectType }).catch(() => {})

  res.status(201).json(lead)
})

/** GET /api/leads — protected, for ops dashboard */
router.get('/', requireAuth, async (_req, res) => {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(leads)
})

/** PATCH /api/leads/:id — update lead status, protected */
router.patch('/:id', requireAuth, async (req, res) => {
  const { status } = req.body
  if (!status) {
    res.status(400).json({ error: 'status is required' })
    return
  }
  const lead = await prisma.lead.update({ where: { id: req.params.id }, data: { status } })
  res.json(lead)
})

/** DELETE /api/leads/:id — protected */
router.delete('/:id', requireAuth, async (req, res) => {
  await prisma.lead.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

export default router
