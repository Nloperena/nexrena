import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { hashPassword, verifyPassword } from '../lib/password'
import { signPortalToken } from '../lib/portal-token'
import { requirePortalAuth } from '../middleware/portal-auth'
import { requireAuth } from '../middleware/auth'
import { notifyNewLead } from '../lib/notify'

const router = Router()

function genContactId() {
  return Math.random().toString(36).slice(2, 10)
}

function nowIso() {
  return new Date().toISOString()
}

function sessionResponse(account: { id: string; email: string; name: string; company: string | null; contactId: string }) {
  const token = signPortalToken({
    accountId: account.id,
    contactId: account.contactId,
    email: account.email,
  })
  return {
    token,
    account: {
      id: account.id,
      email: account.email,
      name: account.name,
      company: account.company,
      contactId: account.contactId,
    },
  }
}

/** POST /api/portal/register */
router.post('/register', async (req, res) => {
  const { name, email, password, company } = req.body as {
    name?: string
    email?: string
    password?: string
    company?: string
  }

  const trimmedName = name?.trim()
  const trimmedEmail = email?.trim().toLowerCase()
  const trimmedPassword = password?.trim()
  const trimmedCompany = company?.trim() || null

  if (!trimmedName || !trimmedEmail || !trimmedPassword) {
    res.status(400).json({ error: 'name, email, and password are required' })
    return
  }
  if (trimmedPassword.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' })
    return
  }

  const existing = await prisma.portalAccount.findUnique({ where: { email: trimmedEmail } })
  if (existing) {
    res.status(409).json({ error: 'An account with this email already exists. Sign in instead.' })
    return
  }

  const contactId = genContactId()
  const ts = nowIso()
  const companyName = trimmedCompany || trimmedName

  await prisma.contact.create({
    data: {
      id: contactId,
      name: trimmedName,
      company: companyName,
      email: trimmedEmail,
      industry: 'other',
      stage: 'portal',
      value: 0,
      notes: 'Self-service client portal signup.',
      createdAt: ts,
      updatedAt: ts,
    },
  })

  const account = await prisma.portalAccount.create({
    data: {
      email: trimmedEmail,
      passwordHash: hashPassword(trimmedPassword),
      name: trimmedName,
      company: trimmedCompany,
      contactId,
    },
  })

  const lead = await prisma.lead.create({
    data: {
      name: trimmedName,
      email: trimmedEmail,
      company: trimmedCompany,
      message: 'Client created a portal account.',
      source: 'portal-signup',
      projectType: 'portal',
      status: 'new',
    },
  })

  notifyNewLead({
    name: trimmedName,
    email: trimmedEmail,
    message: lead.message,
    company: trimmedCompany ?? undefined,
    projectType: 'portal',
  }).catch(() => {})

  res.status(201).json(sessionResponse(account))
})

/** POST /api/portal/login */
router.post('/login', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string }
  const trimmedEmail = email?.trim().toLowerCase()
  const trimmedPassword = password?.trim()

  if (!trimmedEmail || !trimmedPassword) {
    res.status(400).json({ error: 'email and password are required' })
    return
  }

  const account = await prisma.portalAccount.findUnique({ where: { email: trimmedEmail } })
  if (!account || !verifyPassword(trimmedPassword, account.passwordHash)) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  res.json(sessionResponse(account))
})

/** GET /api/portal/me */
router.get('/me', requirePortalAuth, async (req, res) => {
  const account = await prisma.portalAccount.findUnique({
    where: { id: req.portalUser!.accountId },
  })
  if (!account) {
    res.status(404).json({ error: 'Account not found' })
    return
  }
  res.json({
    id: account.id,
    email: account.email,
    name: account.name,
    company: account.company,
    contactId: account.contactId,
    createdAt: account.createdAt,
  })
})

/** PATCH /api/portal/me */
router.patch('/me', requirePortalAuth, async (req, res) => {
  const { name, company } = req.body as { name?: string; company?: string }
  const account = await prisma.portalAccount.findUnique({
    where: { id: req.portalUser!.accountId },
  })
  if (!account) {
    res.status(404).json({ error: 'Account not found' })
    return
  }

  const nextName = name?.trim() || account.name
  const nextCompany = company !== undefined ? (company.trim() || null) : account.company

  const updated = await prisma.portalAccount.update({
    where: { id: account.id },
    data: { name: nextName, company: nextCompany },
  })

  await prisma.contact.update({
    where: { id: account.contactId },
    data: {
      name: nextName,
      company: nextCompany || nextName,
      updatedAt: nowIso(),
    },
  })

  res.json({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    company: updated.company,
    contactId: updated.contactId,
  })
})

/** GET /api/portal/projects */
router.get('/projects', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const projects = await prisma.project.findMany({
    where: { contactId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(projects)
})

/** GET /api/portal/invoices */
router.get('/invoices', requirePortalAuth, async (req, res) => {
  const { contactId, email } = req.portalUser!
  const invoices = await prisma.invoice.findMany({
    where: {
      OR: [{ contactId }, { clientEmail: email }],
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(invoices)
})

/** GET /api/portal/proposals */
router.get('/proposals', requirePortalAuth, async (req, res) => {
  const contactId = req.portalUser!.contactId
  const proposals = await prisma.proposal.findMany({
    where: { contactId },
    orderBy: { createdAt: 'desc' },
  })
  res.json(proposals)
})

/** GET /api/portal/accounts — ops only */
router.get('/accounts', requireAuth, async (_req, res) => {
  const accounts = await prisma.portalAccount.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(accounts)
})

export default router
