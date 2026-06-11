import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { deliverProjectAndSendBalance } from '../lib/split-deposit'

const router = Router()

router.get('/', async (_req, res) => {
  const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(projects)
})

router.post('/', async (req, res) => {
  const data = req.body
  if (!data.id || !data.name || !data.clientName) {
    res.status(400).json({ error: 'id, name, and clientName are required' })
    return
  }
  const project = await prisma.project.create({ data })
  res.status(201).json(project)
})

/** PATCH /api/projects/:id/deliver — mark delivered and send balance invoice */
router.patch('/:id/deliver', async (req, res) => {
  try {
    const result = await deliverProjectAndSendBalance(req.params.id)
    res.json(result)
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : 'Could not deliver project' })
  }
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { id: _strip, ...data } = req.body
  const project = await prisma.project.update({ where: { id }, data })
  res.json(project)
})

router.delete('/:id', async (req, res) => {
  await prisma.project.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

export default router

