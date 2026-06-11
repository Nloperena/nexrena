import { createHmac, timingSafeEqual } from 'crypto'

const TTL_MS = 7 * 24 * 60 * 60 * 1000

export type PortalTokenPayload = {
  accountId: string
  contactId: string
  email: string
}

function secret(): string {
  return process.env.PORTAL_JWT_SECRET || process.env.API_KEY || 'dev-portal-secret'
}

function encodePayload(payload: PortalTokenPayload & { exp: number }): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decodePayload(raw: string): (PortalTokenPayload & { exp: number }) | null {
  try {
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

export function signPortalToken(payload: PortalTokenPayload): string {
  const body = encodePayload({ ...payload, exp: Date.now() + TTL_MS })
  const sig = createHmac('sha256', secret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyPortalToken(token: string): PortalTokenPayload | null {
  const [body, sig] = token.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', secret()).update(body).digest('base64url')
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null
  const payload = decodePayload(body)
  if (!payload || payload.exp < Date.now()) return null
  return { accountId: payload.accountId, contactId: payload.contactId, email: payload.email }
}
