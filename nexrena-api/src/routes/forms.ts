import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { getSiteConfig, verifySiteSecret } from '../lib/sites'
import { notifyFormSubmission } from '../lib/notify'
import { stripHtml } from '../lib/sanitize'

const router = Router()

function serialize(row: {
  id: string
  contactId: string
  siteKey: string
  formName: string
  submitterName: string
  submitterEmail: string
  fields: unknown
  pageUrl: string | null
  status: string
  createdAt: Date
}) {
  return {
    id: row.id,
    contactId: row.contactId,
    siteKey: row.siteKey,
    formName: row.formName,
    submitterName: row.submitterName,
    submitterEmail: row.submitterEmail,
    fields: row.fields,
    pageUrl: row.pageUrl,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }
}

function previewFromFields(fields: Record<string, unknown>, message?: string): string {
  const text = message || (typeof fields.message === 'string' ? fields.message : '')
  const trimmed = stripHtml(String(text)).slice(0, 160)
  return trimmed.length < String(text).length ? `${trimmed}…` : trimmed
}

/** POST /api/forms/submit — public, rate-limited at mount */
router.post('/submit', async (req, res) => {
  const siteKey =
    (typeof req.headers['x-site-key'] === 'string' ? req.headers['x-site-key'] : null) ||
    (typeof req.body?.siteKey === 'string' ? req.body.siteKey : null)

  if (!siteKey) {
    res.status(400).json({ error: 'siteKey is required (body or X-Site-Key header)' })
    return
  }

  const site = getSiteConfig(siteKey)
  if (!site || !site.contactId) {
    res.status(400).json({ error: 'Unknown siteKey' })
    return
  }

  const formSecret =
    (typeof req.headers['x-form-secret'] === 'string' ? req.headers['x-form-secret'] : null) ||
    (typeof req.body?.formSecret === 'string' ? req.body.formSecret : undefined)

  if (!verifySiteSecret(siteKey, formSecret)) {
    res.status(403).json({ error: 'Invalid form secret' })
    return
  }

  const {
    name,
    email,
    message,
    formName,
    pageUrl,
    website,
    siteKey: _omitSiteKey,
    formSecret: _omitSecret,
    ...customFields
  } = req.body as Record<string, unknown>

  if (website) {
    res.status(201).json({ ok: true })
    return
  }

  const submitterName = typeof name === 'string' ? stripHtml(name.trim()) : ''
  const submitterEmail = typeof email === 'string' ? email.trim().toLowerCase() : ''
  const bodyMessage = typeof message === 'string' ? stripHtml(message.trim()) : ''

  if (!submitterName || !submitterEmail || !bodyMessage) {
    res.status(400).json({ error: 'name, email, and message are required' })
    return
  }

  const sanitizedCustom: Record<string, string> = {}
  for (const [key, value] of Object.entries(customFields)) {
    if (typeof value === 'string') sanitizedCustom[key] = stripHtml(value.trim())
    else if (value != null && typeof value !== 'object') sanitizedCustom[key] = String(value)
  }

  const fields = { ...sanitizedCustom, message: bodyMessage }

  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const duplicate = await prisma.formSubmission.findFirst({
    where: {
      siteKey,
      submitterEmail,
      createdAt: { gte: fiveMinutesAgo },
      fields: { equals: fields },
    },
  })
  if (duplicate) {
    res.status(201).json(serialize(duplicate))
    return
  }

  const submission = await prisma.formSubmission.create({
    data: {
      contactId: site.contactId,
      siteKey,
      formName: typeof formName === 'string' && formName.trim() ? formName.trim() : 'contact',
      submitterName,
      submitterEmail,
      fields,
      pageUrl: typeof pageUrl === 'string' && pageUrl.trim() ? pageUrl.trim().slice(0, 2048) : null,
      status: 'new',
    },
  })

  notifyFormSubmission({
    siteLabel: site.label,
    siteKey,
    formName: submission.formName,
    name: submitterName,
    email: submitterEmail,
    message: bodyMessage,
    fields: sanitizedCustom,
    pageUrl: submission.pageUrl,
  }).catch(() => {})

  res.status(201).json(serialize(submission))
})

/** GET /api/forms/submissions — ops */
router.get('/submissions', requireAuth, async (req, res) => {
  const contactId = typeof req.query.contactId === 'string' ? req.query.contactId : undefined
  const siteKey = typeof req.query.siteKey === 'string' ? req.query.siteKey : undefined
  const status = typeof req.query.status === 'string' ? req.query.status : undefined

  const rows = await prisma.formSubmission.findMany({
    where: {
      ...(contactId ? { contactId } : {}),
      ...(siteKey ? { siteKey } : {}),
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  res.json(rows.map(serialize))
})

/** PATCH /api/forms/submissions/:id — mark read, etc. */
router.patch('/submissions/:id', requireAuth, async (req, res) => {
  const { status } = req.body as { status?: string }
  if (!status || !['new', 'read'].includes(status)) {
    res.status(400).json({ error: 'status must be "new" or "read"' })
    return
  }
  const row = await prisma.formSubmission.update({
    where: { id: req.params.id },
    data: { status },
  })
  res.json(serialize(row))
})

/** DELETE /api/forms/submissions/:id */
router.delete('/submissions/:id', requireAuth, async (req, res) => {
  await prisma.formSubmission.delete({ where: { id: req.params.id } })
  res.json({ ok: true })
})

export { previewFromFields }
export default router
