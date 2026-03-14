import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (_req, res) => {
  const entries = await prisma.timeEntry.findMany({ orderBy: { date: 'desc' } })
  res.json(entries)
})

router.post('/', async (req, res) => {
  const data = req.body
  if (!data.id || !data.projectName || !data.description || data.hours == null) {
    res.status(400).json({ error: 'id, projectName, description, and hours are required' })
    return
  }
  const entry = await prisma.timeEntry.create({ data })
  res.status(201).json(entry)
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { id: _strip, ...data } = req.body
  const entry = await prisma.timeEntry.update({ where: { id }, data })
  res.json(entry)
})

router.delete('/:id', async (req, res) => {
  await prisma.timeEntry.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

export default router
