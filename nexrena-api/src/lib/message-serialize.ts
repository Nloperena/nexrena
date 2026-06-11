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
  }
}

export function groupThreads<T extends {
  threadId: string
  createdAt: string
  direction: string
  readByClient: boolean
  readByAdmin: boolean
  subject: string
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
      const unreadByClient = sorted.filter((m) => m.direction === 'admin' && !m.readByClient).length
      const unreadByAdmin = sorted.filter((m) => m.direction === 'client' && !m.readByAdmin).length
      return {
        threadId,
        subject: root.subject,
        clientName: root.clientName ?? null,
        clientEmail: root.clientEmail ?? null,
        companyName: root.companyName ?? null,
        contactId: root.contactId ?? null,
        updatedAt: sorted[sorted.length - 1].createdAt,
        unreadByClient,
        unreadByAdmin,
        messages: sorted,
      }
    })
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
}
