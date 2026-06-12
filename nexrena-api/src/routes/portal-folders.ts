import { Router } from 'express'

import { prisma } from '../lib/prisma'

import { requirePortalAuth } from '../middleware/portal-auth'



const router = Router()

const NAME_MAX = 100



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



async function folderOwnedByContact(folderId: string, contactId: string) {

  return prisma.portalFolder.findFirst({ where: { id: folderId, contactId } })

}



/** GET /api/portal/folders */

router.get('/', requirePortalAuth, async (req, res) => {

  const contactId = req.portalUser!.contactId

  const rows = await prisma.portalFolder.findMany({

    where: { contactId },

    orderBy: [{ parentId: 'asc' }, { name: 'asc' }],

  })

  res.json(rows.map(serializeFolder))

})



/** POST /api/portal/folders */

router.post('/', requirePortalAuth, async (req, res) => {

  const contactId = req.portalUser!.contactId

  const name = typeof req.body.name === 'string' ? req.body.name.trim() : ''

  const parentId = typeof req.body.parentId === 'string' ? req.body.parentId.trim() || null : null



  if (!name) {

    res.status(400).json({ error: 'name is required' })

    return

  }

  if (name.length > NAME_MAX) {

    res.status(400).json({ error: `name must be at most ${NAME_MAX} characters` })

    return

  }



  if (parentId) {

    const parent = await folderOwnedByContact(parentId, contactId)

    if (!parent) {

      res.status(404).json({ error: 'Parent folder not found' })

      return

    }

  }



  const row = await prisma.portalFolder.create({

    data: { contactId, name, parentId },

  })

  res.status(201).json(serializeFolder(row))

})



/** PATCH /api/portal/folders/:id */

router.patch('/:id', requirePortalAuth, async (req, res) => {

  const contactId = req.portalUser!.contactId

  const existing = await folderOwnedByContact(req.params.id, contactId)

  if (!existing) {

    res.status(404).json({ error: 'Folder not found' })

    return

  }



  const data: { name?: string; parentId?: string | null } = {}

  if (typeof req.body.name === 'string') {

    const name = req.body.name.trim()

    if (!name) {

      res.status(400).json({ error: 'name cannot be empty' })

      return

    }

    if (name.length > NAME_MAX) {

      res.status(400).json({ error: `name must be at most ${NAME_MAX} characters` })

      return

    }

    data.name = name

  }



  if ('parentId' in req.body) {

    const parentId = typeof req.body.parentId === 'string'

      ? req.body.parentId.trim() || null

      : req.body.parentId === null

        ? null

        : undefined

    if (parentId === undefined) {

      res.status(400).json({ error: 'parentId must be a string or null' })

      return

    }

    if (parentId === req.params.id) {

      res.status(400).json({ error: 'A folder cannot be its own parent' })

      return

    }

    if (parentId) {

      const parent = await folderOwnedByContact(parentId, contactId)

      if (!parent) {

        res.status(404).json({ error: 'Parent folder not found' })

        return

      }

    }

    data.parentId = parentId

  }



  const row = await prisma.portalFolder.update({

    where: { id: req.params.id },

    data,

  })

  res.json(serializeFolder(row))

})



/** DELETE /api/portal/folders/:id — empty folders only */

router.delete('/:id', requirePortalAuth, async (req, res) => {

  const contactId = req.portalUser!.contactId

  const existing = await folderOwnedByContact(req.params.id, contactId)

  if (!existing) {

    res.status(404).json({ error: 'Folder not found' })

    return

  }



  const [childCount, assetCount] = await Promise.all([

    prisma.portalFolder.count({ where: { parentId: req.params.id, contactId } }),

    prisma.portalAsset.count({ where: { folderId: req.params.id, contactId } }),

  ])



  if (childCount > 0 || assetCount > 0) {

    res.status(400).json({ error: 'Folder must be empty before deleting' })

    return

  }



  await prisma.portalFolder.delete({ where: { id: req.params.id } })

  res.status(204).send()

})



export default router


