import { Router } from 'express'
import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import {
  assertContactExists,
  fetchHydratedServiceRequest,
  hydrateServiceRequests,
  pickServiceRequestData,
  validateServiceRequestWrite,
} from '../lib/service-request-ops'

const router = Router()

/** GET /api/service-requests — ops list */
router.get('/', async (_req, res) => {
  const rows = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: 'desc' },
    include: { assets: { orderBy: { createdAt: 'desc' } } },
  })
  res.json(await hydrateServiceRequests(rows))
})

/** GET /api/service-requests/:id */
router.get('/:id', async (req, res) => {
  const row = await fetchHydratedServiceRequest(req.params.id)
  if (!row) {
    res.status(404).json({ error: 'Service request not found' })
    return
  }
  res.json(row)
})

/** POST /api/service-requests — ops create on behalf of client */
router.post('/', async (req, res) => {
  const body = req.body as Record<string, unknown>
  const contactId = typeof body.contactId === 'string' ? body.contactId.trim() : ''
  const projectType = typeof body.projectType === 'string' ? body.projectType.trim() : ''
  const description = typeof body.description === 'string' ? body.description.trim() : ''

  if (!contactId || !projectType || !description) {
    res.status(400).json({ error: 'contactId, projectType, and description are required' })
    return
  }

  if (!(await assertContactExists(contactId))) {
    res.status(400).json({ error: 'Contact not found' })
    return
  }

  const extras = pickServiceRequestData(body)
  delete extras.contactId
  delete extras.projectType
  delete extras.description

  const validationError = validateServiceRequestWrite(extras)
  if (validationError) {
    res.status(400).json({ error: validationError })
    return
  }

  const row = await prisma.serviceRequest.create({
    data: {
      contactId,
      projectType,
      description,
      budget: typeof extras.budget === 'string' ? extras.budget.trim() || null : null,
      timeline: typeof extras.timeline === 'string' ? extras.timeline.trim() || null : null,
      status: typeof extras.status === 'string' ? extras.status : 'new',
      source: typeof extras.source === 'string' ? extras.source : 'ops',
      internalNotes:
        typeof extras.internalNotes === 'string' ? extras.internalNotes.trim() || null : null,
    },
    include: { assets: { orderBy: { createdAt: 'desc' } } },
  })

  const hydrated = await fetchHydratedServiceRequest(row.id)
  res.status(201).json(hydrated)
})

/** PUT /api/service-requests/:id */
router.put('/:id', async (req, res) => {
  const data = pickServiceRequestData(req.body as Record<string, unknown>)
  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: 'No valid fields to update' })
    return
  }

  const validationError = validateServiceRequestWrite(data)
  if (validationError) {
    res.status(400).json({ error: validationError })
    return
  }

  if (typeof data.contactId === 'string' && !(await assertContactExists(data.contactId))) {
    res.status(400).json({ error: 'Contact not found' })
    return
  }

  if (typeof data.projectType === 'string') data.projectType = data.projectType.trim()
  if (typeof data.description === 'string') data.description = data.description.trim()
  if (typeof data.budget === 'string') data.budget = data.budget.trim() || null
  if (typeof data.timeline === 'string') data.timeline = data.timeline.trim() || null
  if (typeof data.internalNotes === 'string') data.internalNotes = data.internalNotes.trim() || null

  try {
    await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: data as Prisma.ServiceRequestUpdateInput,
    })
  } catch {
    res.status(404).json({ error: 'Service request not found' })
    return
  }

  const hydrated = await fetchHydratedServiceRequest(req.params.id)
  res.json(hydrated)
})

/** PATCH /api/service-requests/:id */
router.patch('/:id', async (req, res) => {
  const data = pickServiceRequestData(req.body as Record<string, unknown>)
  if (Object.keys(data).length === 0) {
    res.status(400).json({ error: 'No valid fields to update' })
    return
  }

  const validationError = validateServiceRequestWrite(data)
  if (validationError) {
    res.status(400).json({ error: validationError })
    return
  }

  if (typeof data.contactId === 'string' && !(await assertContactExists(data.contactId))) {
    res.status(400).json({ error: 'Contact not found' })
    return
  }

  if (typeof data.projectType === 'string') data.projectType = data.projectType.trim()
  if (typeof data.description === 'string') data.description = data.description.trim()
  if (typeof data.budget === 'string') data.budget = data.budget.trim() || null
  if (typeof data.timeline === 'string') data.timeline = data.timeline.trim() || null
  if (typeof data.internalNotes === 'string') data.internalNotes = data.internalNotes.trim() || null

  try {
    await prisma.serviceRequest.update({
      where: { id: req.params.id },
      data: data as Prisma.ServiceRequestUpdateInput,
    })
  } catch {
    res.status(404).json({ error: 'Service request not found' })
    return
  }

  const hydrated = await fetchHydratedServiceRequest(req.params.id)
  res.json(hydrated)
})

/** DELETE /api/service-requests/:id */
router.delete('/:id', async (req, res) => {
  try {
    await prisma.serviceRequest.delete({ where: { id: req.params.id } })
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'Service request not found' })
  }
})

export default router
