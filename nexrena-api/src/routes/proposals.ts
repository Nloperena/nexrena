import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (_req, res) => {
  const proposals = await prisma.proposal.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(proposals)
})

router.post('/', async (req, res) => {
  const data = req.body
  if (!data.id || !data.title || !data.clientName) {
    res.status(400).json({ error: 'id, title, and clientName are required' })
    return
  }
  const proposal = await prisma.proposal.create({ data })
  res.status(201).json(proposal)
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { id: _strip, ...data } = req.body
  const proposal = await prisma.proposal.update({ where: { id }, data })
  res.json(proposal)
})

router.delete('/:id', async (req, res) => {
  await prisma.proposal.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

export default router
