import type { Response } from 'express'

export type MessageCreatedPayload = {
  type: 'message.created'
  contactId: string | null
  portalAccountId: string | null
  message: Record<string, unknown>
}

export type ThreadReadPayload = {
  type: 'thread.read'
  contactId: string | null
  portalAccountId: string | null
  threadId: string
  reader: 'admin' | 'client'
}

export type MessageStreamPayload = MessageCreatedPayload | ThreadReadPayload

type OpsSubscriber = {
  kind: 'ops'
  contactId?: string
  res: Response
}

type PortalSubscriber = {
  kind: 'portal'
  accountId: string
  res: Response
}

type Subscriber = OpsSubscriber | PortalSubscriber

const subscribers = new Set<Subscriber>()

function writeEvent(res: Response, payload: MessageStreamPayload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`)
}

function matchesOps(sub: OpsSubscriber, event: MessageStreamPayload): boolean {
  if (sub.contactId && event.contactId !== sub.contactId) return false
  return true
}

function matchesPortal(sub: PortalSubscriber, event: MessageStreamPayload): boolean {
  return event.portalAccountId === sub.accountId
}

export function publishMessageEvent(event: MessageStreamPayload) {
  for (const sub of subscribers) {
    if (sub.kind === 'ops') {
      if (matchesOps(sub, event)) writeEvent(sub.res, event)
    } else if (matchesPortal(sub, event)) {
      writeEvent(sub.res, event)
    }
  }
}

export function subscribeOps(res: Response, contactId?: string) {
  const sub: OpsSubscriber = { kind: 'ops', contactId, res }
  subscribers.add(sub)
  return () => subscribers.delete(sub)
}

export function subscribePortal(res: Response, accountId: string) {
  const sub: PortalSubscriber = { kind: 'portal', accountId, res }
  subscribers.add(sub)
  return () => subscribers.delete(sub)
}

export function startMessageStreamHeartbeat(res: Response, unsubscribe: () => void) {
  const heartbeat = setInterval(() => {
    res.write(': ping\n\n')
  }, 25000)

  res.on('close', () => {
    clearInterval(heartbeat)
    unsubscribe()
  })
}
