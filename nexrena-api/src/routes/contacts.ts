import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (_req, res) => {
  const contacts = await prisma.contact.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(contacts)
})

router.post('/', async (req, res) => {
  const data = req.body
  if (!data.id || !data.name || !data.company || !data.email) {
    res.status(400).json({ error: 'id, name, company, and email are required' })
    return
  }
  const contact = await prisma.contact.create({ data })
  res.status(201).json(contact)
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { id: _strip, ...data } = req.body
  const contact = await prisma.contact.update({ where: { id }, data })
  res.json(contact)
})

router.delete('/:id', async (req, res) => {
  await prisma.contact.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

export default router
