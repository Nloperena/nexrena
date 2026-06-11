export type MessageAttachmentRow = {
  id: string
  messageId: string
  blobUrl: string
  pathname: string
  filename: string
  mimeType: string
  sizeBytes: number
  createdAt: Date
}

export type MessageRow = {
  id: string
  portalAccountId: string | null
  contactId: string | null
  clientName: string | null
  clientEmail: string | null
  companyName: string | null
  subject: string
  message: string
  status: string
  threadId: string | null
  replyToMessageId: string | null
  direction: string
  readByClient: boolean
  readByAdmin: boolean
  createdAt: Date
  attachments?: MessageAttachmentRow[]
}

export function serializeAttachment(row: MessageAttachmentRow) {
  return {
    id: row.id,
    messageId: row.messageId,
    filename: row.filename,
    mimeType: row.mimeType,
    sizeBytes: row.sizeBytes,
    pathname: row.pathname,
    createdAt: row.createdAt.toISOString(),
  }
}

export function effectiveThreadId(row: MessageRow): string {
  return row.threadId ?? row.id
}

export function serializeMessage(row: MessageRow) {
  return {
    id: row.id,
    portalAccountId: row.portalAccountId,
    contactId: row.contactId,
    clientName: row.clientName,
    clientEmail: row.clientEmail,
    companyName: row.companyName,
    subject: row.subject,
    message: row.message,
    status: row.status as 'unread' | 'read',
    threadId: effectiveThreadId(row),
    replyToMessageId: row.replyToMessageId,
    direction: row.direction as 'client' | 'admin',
    readByClient: row.readByClient,
    readByAdmin: row.readByAdmin,
    createdAt: row.createdAt.toISOString(),
    attachments: (row.attachments ?? []).map(serializeAttachment),
  }
}

export function serializePortalMessage(row: MessageRow) {
  return {
    id: row.id,
    subject: row.subject,
    message: row.message,
    status: row.status,
    threadId: effectiveThreadId(row),
    replyToMessageId: row.replyToMessageId,
    direction: row.direction as 'client' | 'admin',
    readByClient: row.readByClient,
    readByAdmin: row.readByAdmin,
    createdAt: row.createdAt.toISOString(),
    attachments: (row.attachments ?? []).map(serializeAttachment),
  }
}

export function groupThreads<T extends {
  threadId: string
  createdAt: string
  direction: string
  readByClient: boolean
  readByAdmin: boolean
  subject: string
  message: string
  clientName?: string | null
  clientEmail?: string | null
  companyName?: string | null
  contactId?: string | null
}>(messages: T[]) {
  const map = new Map<string, T[]>()
  for (const msg of messages) {
    const list = map.get(msg.threadId) ?? []
    list.push(msg)
    map.set(msg.threadId, list)
  }

  return [...map.entries()]
    .map(([threadId, threadMessages]) => {
      const sorted = [...threadMessages].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      )
      const root = sorted[0]
      const last = sorted[sorted.length - 1]
      const unreadByClient = sorted.filter((m) => m.direction === 'admin' && !m.readByClient).length
      const unreadByAdmin = sorted.filter((m) => m.direction === 'client' && !m.readByAdmin).length
      return {
        threadId,
        subject: root.subject,
        clientName: root.clientName ?? null,
        clientEmail: root.clientEmail ?? null,
        companyName: root.companyName ?? null,
        contactId: root.contactId ?? null,
        updatedAt: last.createdAt,
        lastMessagePreview: last.message.trim() || 'Attachment',
        unreadByClient,
        unreadByAdmin,
        messages: sorted,
      }
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}

export const messageSelect = {
  id: true,
  portalAccountId: true,
  contactId: true,
  clientName: true,
  clientEmail: true,
  companyName: true,
  subject: true,
  message: true,
  status: true,
  threadId: true,
  replyToMessageId: true,
  direction: true,
  readByClient: true,
  readByAdmin: true,
  createdAt: true,
  attachments: {
    select: {
      id: true,
      messageId: true,
      blobUrl: true,
      pathname: true,
      filename: true,
      mimeType: true,
      sizeBytes: true,
      createdAt: true,
    },
  },
} as const

export const portalMessageSelect = {
  id: true,
  subject: true,
  message: true,
  status: true,
  threadId: true,
  replyToMessageId: true,
  direction: true,
  readByClient: true,
  readByAdmin: true,
  createdAt: true,
  attachments: {
    select: {
      id: true,
      messageId: true,
      blobUrl: true,
      pathname: true,
      filename: true,
      mimeType: true,
      sizeBytes: true,
      createdAt: true,
    },
  },
} as const
