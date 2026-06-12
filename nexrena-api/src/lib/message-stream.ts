import type { Request, Response } from 'express'
import { verifyPortalToken } from './portal-token'
import { publishMessageEvent, startMessageStreamHeartbeat, subscribeOps, subscribePortal } from './message-events'
import { serializeMessage, type MessageRow } from './message-serialize'

export function opsStreamAuth(req: Request, res: Response): boolean {
  const token =
    req.headers.authorization?.replace('Bearer ', '') ||
    (typeof req.query.token === 'string' ? req.query.token : null)
  if (!token || token !== process.env.API_KEY) {
    res.status(401).json({ error: 'Unauthorized' })
    return false
  }
  return true
}

export function portalStreamAuth(req: Request, res: Response): { accountId: string } | null {
  const token =
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null) ||
    (typeof req.query.token === 'string' ? req.query.token : null)
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  const user = verifyPortalToken(token)
  if (!user) {
    res.status(401).json({ error: 'Invalid or expired session' })
    return null
  }
  return { accountId: user.accountId }
}

export function handleOpsMessageStream(req: Request, res: Response) {
  if (!opsStreamAuth(req, res)) return

  const contactId =
    typeof req.query.contactId === 'string' && req.query.contactId.trim()
      ? req.query.contactId.trim()
      : undefined

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders?.()

  const unsubscribe = subscribeOps(res, contactId)
  startMessageStreamHeartbeat(res, unsubscribe)
  res.write(': connected\n\n')
}

export function handlePortalMessageStream(req: Request, res: Response) {
  const auth = portalStreamAuth(req, res)
  if (!auth) return

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')
  res.flushHeaders?.()

  const unsubscribe = subscribePortal(res, auth.accountId)
  startMessageStreamHeartbeat(res, unsubscribe)
  res.write(': connected\n\n')
}

export function emitMessageCreated(row: MessageRow) {
  publishMessageEvent({
    type: 'message.created',
    contactId: row.contactId,
    portalAccountId: row.portalAccountId,
    message: serializeMessage(row),
  })
}

export function emitThreadRead(payload: {
  threadId: string
  reader: 'admin' | 'client'
  contactId: string | null
  portalAccountId: string | null
}) {
  publishMessageEvent({
    type: 'thread.read',
    contactId: payload.contactId,
    portalAccountId: payload.portalAccountId,
    threadId: payload.threadId,
    reader: payload.reader,
  })
}
