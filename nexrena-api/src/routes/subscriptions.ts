import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { runDueBilling } from '../lib/billing'

const router = Router()

const WRITABLE_FIELDS = [
  'contactId',
  'description',
  'amount',
  'interval',
  'status',
  'billingDay',
  'nextBillingDate',
  'skipNext',
  'netTerms',
  'notes',
  'createdAt',
  'stripeSubscriptionId',
  'stripeSubscriptionItemId',
  'stripePriceId',
] as const

type WritableField = (typeof WRITABLE_FIELDS)[number]

function pickSubscriptionData(body: Record<string, unknown>, includeId = false) {
  const data: Record<string, unknown> = {}
  if (includeId && typeof body.id === 'string') data.id = body.id
  for (const key of WRITABLE_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key]
  }
  return data
}

async function hydrateSubscriptions(subs: Awaited<ReturnType<typeof prisma.subscription.findMany>>) {
  const contactIds = [...new Set(subs.map((s) => s.contactId))]
  const contacts = await prisma.contact.findMany({
    where: { id: { in: contactIds } },
    select: { id: true, name: true, company: true },
  })
  const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c]))
  return subs.map((s) => ({
    ...s,
    contactName: contactMap[s.contactId]?.name ?? 'Unknown',
    contactCompany: contactMap[s.contactId]?.company ?? '',
  }))
}

router.get('/', async (_req, res) => {
  const subs = await prisma.subscription.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(await hydrateSubscriptions(subs))
})

router.post('/', async (req, res) => {
  const data = pickSubscriptionData(req.body as Record<string, unknown>, true)
  if (
    !data.id ||
    !data.contactId ||
    !data.description ||
    data.amount === undefined ||
    !data.interval ||
    !data.nextBillingDate
  ) {
    res.status(400).json({ error: 'id, contactId, description, amount, interval, and nextBillingDate are required' })
    return
  }
  const sub = await prisma.subscription.create({ data: data as Parameters<typeof prisma.subscription.create>[0]['data'] })
  res.status(201).json(sub)
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const data = pickSubscriptionData(req.body as Record<string, unknown>)
  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: 'No valid subscription fields to update' })
    return
  }
  const sub = await prisma.subscription.update({ where: { id }, data: data as Prisma.SubscriptionUpdateInput })
  const [hydrated] = await hydrateSubscriptions([sub])
  res.json(hydrated)
})

router.patch('/:id', async (req, res) => {
  const { id } = req.params
  const body = req.body as Record<string, unknown>
  const data: Partial<Record<WritableField, unknown>> = {}
  for (const key of WRITABLE_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key]
  }
  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: 'No valid subscription fields to update' })
    return
  }
  const sub = await prisma.subscription.update({ where: { id }, data: data as Prisma.SubscriptionUpdateInput })
  const [hydrated] = await hydrateSubscriptions([sub])
  res.json(hydrated)
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
