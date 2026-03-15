import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { runDueBilling } from '../lib/billing'

const router = Router()

router.get('/', async (_req, res) => {
  const subs = await prisma.subscription.findMany({ orderBy: { createdAt: 'desc' } })

  const contactIds = [...new Set(subs.map(s => s.contactId))]
  const contacts = await prisma.contact.findMany({
    where: { id: { in: contactIds } },
    select: { id: true, name: true, company: true },
  })
  const contactMap = Object.fromEntries(contacts.map(c => [c.id, c]))

  const result = subs.map(s => ({
    ...s,
    contactName: contactMap[s.contactId]?.name ?? 'Unknown',
    contactCompany: contactMap[s.contactId]?.company ?? '',
  }))

  res.json(result)
})

router.post('/', async (req, res) => {
  const data = req.body
  if (!data.id || !data.contactId || !data.description || !data.amount || !data.interval || !data.nextBillingDate) {
    res.status(400).json({ error: 'id, contactId, description, amount, interval, and nextBillingDate are required' })
    return
  }
  const sub = await prisma.subscription.create({ data })
  res.status(201).json(sub)
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { id: _strip, ...data } = req.body
  const sub = await prisma.subscription.update({ where: { id }, data })
  res.json(sub)
})

router.delete('/:id', async (req, res) => {
  await prisma.subscription.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

router.post('/run-billing', async (_req, res) => {
  const result = await runDueBilling()
  res.json(result)
})

export default router
