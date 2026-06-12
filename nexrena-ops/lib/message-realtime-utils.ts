type ChatMessage = {
  id: string
  threadId: string
  subject: string
  message: string
  direction: 'client' | 'admin'
  readByClient: boolean
  readByAdmin: boolean
  createdAt: string
  status?: string
  clientName?: string | null
  clientEmail?: string | null
  companyName?: string | null
  contactId?: string | null
  attachments?: unknown[]
}

export type ChatThread = {
  threadId: string
  subject: string
  updatedAt: string
  lastMessagePreview?: string
  unreadByClient: number
  unreadByAdmin: number
  messages: ChatMessage[]
  clientName?: string | null
  clientEmail?: string | null
  companyName?: string | null
  contactId?: string | null
}

export type MessageStreamEvent =
  | {
      type: 'message.created'
      message: ChatMessage
    }
  | {
      type: 'thread.read'
      threadId: string
      reader: 'admin' | 'client'
    }

function messagePreview(message: ChatMessage) {
  return message.message.trim() || 'Attachment'
}

export function mergeMessageIntoThreads<T extends ChatThread>(
  threads: T[],
  message: ChatMessage,
  viewer: 'admin' | 'client',
): T[] {
  const preview = messagePreview(message)
  const existing = threads.find((t) => t.threadId === message.threadId)

  if (existing?.messages.some((m) => m.id === message.id)) {
    return sortThreads(
      threads.map((t) =>
        t.threadId === message.threadId
          ? { ...t, updatedAt: message.createdAt, lastMessagePreview: preview }
          : t,
      ),
    )
  }

  if (existing) {
    const unreadByClient =
      existing.unreadByClient +
      (viewer === 'client' && message.direction === 'admin' && !message.readByClient ? 1 : 0)
    const unreadByAdmin =
      existing.unreadByAdmin +
      (viewer === 'admin' && message.direction === 'client' && !message.readByAdmin ? 1 : 0)

    const updated: T = {
      ...existing,
      updatedAt: message.createdAt,
      lastMessagePreview: preview,
      unreadByClient,
      unreadByAdmin,
      messages: [...existing.messages, message],
    }
    return sortThreads([updated, ...threads.filter((t) => t.threadId !== message.threadId)])
  }

  const unreadByClient = message.direction === 'admin' && !message.readByClient ? 1 : 0
  const unreadByAdmin = message.direction === 'client' && !message.readByAdmin ? 1 : 0

  const newThread = {
    threadId: message.threadId,
    subject: message.subject,
    updatedAt: message.createdAt,
    lastMessagePreview: preview,
    unreadByClient,
    unreadByAdmin,
    clientName: message.clientName ?? null,
    clientEmail: message.clientEmail ?? null,
    companyName: message.companyName ?? null,
    contactId: message.contactId ?? null,
    messages: [message],
  } as T

  return sortThreads([newThread, ...threads])
}

export function applyThreadRead<T extends ChatThread>(
  threads: T[],
  threadId: string,
  reader: 'admin' | 'client',
): T[] {
  return threads.map((t) => {
    if (t.threadId !== threadId) return t
    if (reader === 'admin') {
      return {
        ...t,
        unreadByAdmin: 0,
        messages: t.messages.map((m) =>
          m.direction === 'client'
            ? { ...m, readByAdmin: true, status: 'read' }
            : m,
        ),
      }
    }
    return {
      ...t,
      unreadByClient: 0,
      messages: t.messages.map((m) =>
        m.direction === 'admin' ? { ...m, readByClient: true } : m,
      ),
    }
  })
}

export function countUnreadForViewer(threads: ChatThread[], viewer: 'admin' | 'client') {
  return threads.reduce(
    (sum, t) => sum + (viewer === 'admin' ? t.unreadByAdmin : t.unreadByClient),
    0,
  )
}

export function applyMessageStreamEvent<T extends ChatThread>(
  threads: T[],
  event: MessageStreamEvent,
  viewer: 'admin' | 'client',
): T[] {
  if (event.type === 'message.created') {
    return mergeMessageIntoThreads(threads, event.message, viewer)
  }
  return applyThreadRead(threads, event.threadId, event.reader)
}

function sortThreads<T extends ChatThread>(threads: T[]): T[] {
  return [...threads].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  )
}

export function parseMessageStreamEvent(raw: string): MessageStreamEvent | null {
  try {
    const data = JSON.parse(raw) as MessageStreamEvent
    if (data.type === 'message.created' && data.message?.id) return data
    if (data.type === 'thread.read' && data.threadId && data.reader) return data
    return null
  } catch {
    return null
  }
}
