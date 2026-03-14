import { Router } from 'express'
import { prisma } from '../lib/prisma'

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
