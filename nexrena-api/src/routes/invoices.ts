import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (_req, res) => {
  const invoices = await prisma.invoice.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(invoices)
})

router.post('/', async (req, res) => {
  const data = req.body
  if (!data.id || !data.number || !data.clientName) {
    res.status(400).json({ error: 'id, number, and clientName are required' })
    return
  }
  const invoice = await prisma.invoice.create({ data })
  res.status(201).json(invoice)
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { id: _strip, ...data } = req.body
  const invoice = await prisma.invoice.update({ where: { id }, data })
  res.json(invoice)
})

router.delete('/:id', async (req, res) => {
  await prisma.invoice.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

export default router
