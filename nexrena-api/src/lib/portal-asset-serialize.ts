export function serializePortalAsset(row: {

  id: string

  contactId: string

  serviceRequestId: string | null

  projectId: string | null

  folderId: string | null

  filename: string

  contentType: string

  sizeBytes: number

  blobUrl: string

  pathname: string

  category: string | null

  note: string | null

  createdAt: Date

}) {

  return {

    id: row.id,

    contactId: row.contactId,

    serviceRequestId: row.serviceRequestId,

    projectId: row.projectId,

    folderId: row.folderId,

    filename: row.filename,

    contentType: row.contentType,

    sizeBytes: row.sizeBytes,

    blobUrl: row.blobUrl,

    pathname: row.pathname,

    category: row.category,

    note: row.note,

    createdAt: row.createdAt.toISOString(),

  }

}


