import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (_req, res) => {
  const expenses = await prisma.expense.findMany({ orderBy: { date: 'desc' } })
  res.json(expenses)
})

router.post('/', async (req, res) => {
  const data = req.body
  if (!data.id || !data.category || !data.description || data.amount == null) {
    res.status(400).json({ error: 'id, category, description, and amount are required' })
    return
  }
  const expense = await prisma.expense.create({ data })
  res.status(201).json(expense)
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { id: _strip, ...data } = req.body
  const expense = await prisma.expense.update({ where: { id }, data })
  res.json(expense)
})

router.delete('/:id', async (req, res) => {
  await prisma.expense.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

export default router
