import { Router } from 'express'
import { prisma } from '../lib/prisma'
import { serializePortalAsset } from '../lib/portal-asset-serialize'

const router = Router()

function serializeFolder(row: {
  id: string
  contactId: string
  name: string
  parentId: string | null
  createdAt: Date
}) {
  return {
    id: row.id,
    contactId: row.contactId,
    name: row.name,
    parentId: row.parentId,
    createdAt: row.createdAt.toISOString(),
  }
}

/** GET /api/portal-assets — ops view of all client uploads */
router.get('/', async (req, res) => {
  const contactId = typeof req.query.contactId === 'string'
    ? req.query.contactId.trim() || undefined
    : undefined

  const [rows, folders] = await Promise.all([
    prisma.portalAsset.findMany({
      where: contactId ? { contactId } : undefined,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.portalFolder.findMany({
      where: contactId ? { contactId } : undefined,
      orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    }),
  ])

  const contactIds = [...new Set([
    ...rows.map((r) => r.contactId),
    ...folders.map((f) => f.contactId),
  ])]
  const contacts = await prisma.contact.findMany({
    where: { id: { in: contactIds } },
    select: { id: true, name: true, company: true, email: true },
  })
  const contactMap = Object.fromEntries(contacts.map((c) => [c.id, c]))

  res.json({
    assets: rows.map((row) => ({
      ...serializePortalAsset(row),
      contactName: contactMap[row.contactId]?.name ?? 'Unknown',
      contactCompany: contactMap[row.contactId]?.company ?? '',
      contactEmail: contactMap[row.contactId]?.email ?? '',
    })),
    folders: folders.map((row) => ({
      ...serializeFolder(row),
      contactName: contactMap[row.contactId]?.name ?? 'Unknown',
      contactCompany: contactMap[row.contactId]?.company ?? '',
      contactEmail: contactMap[row.contactId]?.email ?? '',
    })),
  })
})

export default router
