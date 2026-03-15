import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { inferProjectType, buildPhases, buildProjectNotes } from '../lib/project-defaults'

const router = Router()

function makeId(): string {
  return Math.random().toString(36).slice(2, 10)
}

router.get('/', async (_req, res) => {
  const proposals = await prisma.proposal.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(proposals)
})

router.post('/', async (req, res) => {
  const data = req.body
  if (!data.id || !data.title || !data.clientName) {
    res.status(400).json({ error: 'id, title, and clientName are required' })
    return
  }
  const proposal = await prisma.proposal.create({ data })
  res.status(201).json(proposal)
})

router.put('/:id', async (req, res) => {
  const { id } = req.params
  const { id: _strip, ...data } = req.body
  const proposal = await prisma.proposal.update({ where: { id }, data })
  res.json(proposal)
})

router.delete('/:id', async (req, res) => {
  await prisma.proposal.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

/**
 * POST /proposals/:id/accept
 *
 * Atomically:
 *   1. Loads the proposal (short-circuits if projectId already set)
 *   2. Creates a project derived from the proposal
 *   3. Updates the proposal: status=accepted, projectId
 *   4. Updates the linked CRM contact: stage=won, value=proposal total
 *
 * Returns { proposal, project }
 */
router.post('/:id/accept', async (req, res) => {
  const { id } = req.params

  const proposal = await prisma.proposal.findUnique({ where: { id } })
  if (!proposal) {
    res.status(404).json({ error: 'Proposal not found' })
    return
  }

  if (proposal.projectId) {
    const existingProject = await prisma.project.findUnique({ where: { id: proposal.projectId } })
    res.json({ proposal, project: existingProject })
    return
  }

  const services = proposal.services as Array<{ id: string; description: string; price: number; notes?: string }>
  const serviceDescriptions = services.map(s => s.description)
  const projectType = inferProjectType(serviceDescriptions)
  const phases = buildPhases(projectType)
  const subtotal = services.reduce((sum, s) => sum + s.price, 0)
  const total = subtotal - (proposal.discount ?? 0)
  const projectId = makeId()
  const now = new Date().toISOString()
  const today = now.slice(0, 10)

  const [project, updatedProposal] = await prisma.$transaction(async (tx) => {
    const newProject = await tx.project.create({
      data: {
        id: projectId,
        name: proposal.title,
        clientName: proposal.clientCompany || proposal.clientName,
        contactId: proposal.contactId ?? undefined,
        type: projectType,
        status: 'not_started',
        startDate: today,
        value: total,
        phases: phases as object,
        notes: buildProjectNotes(proposal.scopeOfWork, proposal.timeline, proposal.notes),
        createdAt: now,
      },
    })

    const updated = await tx.proposal.update({
      where: { id },
      data: { status: 'accepted', projectId },
    })

    if (proposal.contactId) {
      await tx.contact.update({
        where: { id: proposal.contactId },
        data: { stage: 'won', value: total, updatedAt: now },
      })
    }

    return [newProject, updated]
  })

  res.json({ proposal: updatedProposal, project })
})

export default router
