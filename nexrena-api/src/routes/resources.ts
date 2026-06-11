import { Router } from 'express'
import { prisma } from '../lib/prisma'
import {
  parseResourceBody,
  serializeClientResource,
  validateResourceFields,
} from '../lib/client-resource-utils'

const router = Router()

/** GET /api/resources?contactId= */
router.get('/', async (req, res) => {
  const contactId = typeof req.query.contactId === 'string'
    ? req.query.contactId.trim() || undefined
    : undefined

  const rows = await prisma.clientResource.findMany({
    where: contactId ? { contactId } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  const contactIds = [...new Set(rows.map((r) => r.contactId))]
  const contacts = contactIds.length > 0
    ? await prisma.contact.findMany({
        where: { id: { in: contactIds } },
        select: { id: true, name: true, company: true, email: true },
      })
    : []
  const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c]))

  res.json(
    rows.map((row) => ({
      ...serializeClientResource(row),
      contactName: contactMap[row.contactId]?.name ?? 'Unknown',
      contactCompany: contactMap[row.contactId]?.company ?? '',
      contactEmail: contactMap[row.contactId]?.email ?? '',
    })),
  )
})

/** POST /api/resources */
router.post('/', async (req, res) => {
  const fields = parseResourceBody(req.body as Record<string, unknown>)
  const error = validateResourceFields(fields)
  if (error) {
    res.status(400).json({ error })
    return
  }

  const contact = await prisma.contact.findUnique({ where: { id: fields.contactId } })
  if (!contact) {
    res.status(404).json({ error: 'Contact not found' })
    return
  }

  if (fields.relatedInvoiceId) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: fields.relatedInvoiceId, contactId: fields.contactId },
    })
    if (!invoice) {
      res.status(400).json({ error: 'relatedInvoiceId must belong to the same contact' })
      return
    }
  }

  const row = await prisma.clientResource.create({
    data: {
      contactId: fields.contactId,
      type: fields.type,
      title: fields.title,
      url: fields.url,
      description: fields.description ?? null,
      relatedInvoiceId: fields.relatedInvoiceId ?? null,
    },
  })
  res.status(201).json(serializeClientResource(row))
})

/** PATCH /api/resources/:id */
router.patch('/:id', async (req, res) => {
  const existing = await prisma.clientResource.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json({ error: 'Resource not found' })
    return
  }

  const fields = parseResourceBody({
    ...existing,
    ...(req.body as Record<string, unknown>),
    contactId: existing.contactId,
  })
  const error = validateResourceFields(fields, false)
  if (error) {
    res.status(400).json({ error })
    return
  }

  if (fields.relatedInvoiceId) {
    const invoice = await prisma.invoice.findFirst({
      where: { id: fields.relatedInvoiceId, contactId: existing.contactId },
    })
    if (!invoice) {
      res.status(400).json({ error: 'relatedInvoiceId must belong to the same contact' })
      return
    }
  }

  const row = await prisma.clientResource.update({
    where: { id: existing.id },
    data: {
      type: fields.type,
      title: fields.title,
      url: fields.url,
      description: fields.description === undefined ? existing.description : fields.description,
      relatedInvoiceId: fields.relatedInvoiceId === undefined
        ? existing.relatedInvoiceId
        : fields.relatedInvoiceId,
    },
  })
  res.json(serializeClientResource(row))
})

/** DELETE /api/resources/:id */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.clientResource.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'Resource not found' })
  }
})

export default router
