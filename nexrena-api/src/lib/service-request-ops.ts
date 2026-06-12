import { prisma } from './prisma'

export const SERVICE_REQUEST_STATUSES = [
  'new',
  'reviewing',
  'quoted',
  'accepted',
  'declined',
  'closed',
] as const

export type ServiceRequestStatus = (typeof SERVICE_REQUEST_STATUSES)[number]

const WRITABLE_FIELDS = [
  'contactId',
  'projectType',
  'description',
  'budget',
  'timeline',
  'status',
  'internalNotes',
  'source',
] as const

type WritableField = (typeof WRITABLE_FIELDS)[number]

type ServiceRequestRow = Awaited<
  ReturnType<typeof prisma.serviceRequest.findFirst>
> & {
  assets?: {
    id: string
    filename: string
    contentType: string
    sizeBytes: number
    blobUrl: string
    createdAt: Date
  }[]
}

type ContactLite = {
  id: string
  name: string
  company: string | null
  email: string
}

export function isServiceRequestStatus(value: string): value is ServiceRequestStatus {
  return (SERVICE_REQUEST_STATUSES as readonly string[]).includes(value)
}

export function pickServiceRequestData(body: Record<string, unknown>) {
  const data: Partial<Record<WritableField, unknown>> = {}
  for (const key of WRITABLE_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key]
  }
  return data
}

function toIso(value: Date | string) {
  return value instanceof Date ? value.toISOString() : value
}

export function serializeServiceRequest(
  row: NonNullable<ServiceRequestRow>,
  contact?: ContactLite,
) {
  return {
    id: row.id,
    contactId: row.contactId,
    contactName: contact?.name ?? 'Unknown',
    contactCompany: contact?.company ?? '',
    contactEmail: contact?.email ?? '',
    portalAccountId: row.portalAccountId,
    projectType: row.projectType,
    description: row.description,
    budget: row.budget,
    timeline: row.timeline,
    status: row.status,
    source: row.source,
    internalNotes: row.internalNotes ?? null,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    assets: row.assets?.map((asset) => ({
      id: asset.id,
      filename: asset.filename,
      contentType: asset.contentType,
      sizeBytes: asset.sizeBytes,
      blobUrl: asset.blobUrl,
      createdAt: toIso(asset.createdAt),
    })),
  }
}

export async function hydrateServiceRequests(
  rows: NonNullable<ServiceRequestRow>[],
) {
  const contactIds = [...new Set(rows.map((row) => row.contactId))]
  const contacts = await prisma.contact.findMany({
    where: { id: { in: contactIds } },
    select: { id: true, name: true, company: true, email: true },
  })
  const contactMap = Object.fromEntries(contacts.map((contact) => [contact.id, contact]))
  return rows.map((row) => serializeServiceRequest(row, contactMap[row.contactId]))
}

export async function fetchHydratedServiceRequest(id: string) {
  const row = await prisma.serviceRequest.findUnique({
    where: { id },
    include: { assets: { orderBy: { createdAt: 'desc' } } },
  })
  if (!row) return null

  const contact = await prisma.contact.findUnique({
    where: { id: row.contactId },
    select: { id: true, name: true, company: true, email: true },
  })

  return serializeServiceRequest(row, contact ?? undefined)
}

export function validateServiceRequestWrite(data: Partial<Record<WritableField, unknown>>) {
  if (data.status !== undefined && typeof data.status === 'string' && !isServiceRequestStatus(data.status)) {
    return 'Invalid status'
  }
  if (data.contactId !== undefined && typeof data.contactId !== 'string') {
    return 'contactId must be a string'
  }
  if (data.projectType !== undefined && typeof data.projectType === 'string' && !data.projectType.trim()) {
    return 'projectType cannot be empty'
  }
  if (data.description !== undefined && typeof data.description === 'string' && !data.description.trim()) {
    return 'description cannot be empty'
  }
  return null
}

export async function assertContactExists(contactId: string) {
  const contact = await prisma.contact.findUnique({ where: { id: contactId }, select: { id: true } })
  return Boolean(contact)
}
