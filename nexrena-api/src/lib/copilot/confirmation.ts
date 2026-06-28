import { createHmac, timingSafeEqual } from 'crypto'
import type { HighRiskConfirmationPayload } from './types'

const TTL_MS = 5 * 60 * 1000

function getSecret(): string {
  const secret = process.env.COPILOT_CONFIRM_SECRET?.trim() || process.env.API_KEY?.trim()
  if (!secret) throw new Error('COPILOT_CONFIRM_SECRET or API_KEY must be configured')
  return secret
}

function signBody(toolName: string, args: Record<string, unknown>, expiresAt: number): string {
  const body = `${toolName}:${JSON.stringify(args)}:${expiresAt}`
  return createHmac('sha256', getSecret()).update(body).digest('hex')
}

export function signConfirmationPayload(
  toolName: string,
  args: Record<string, unknown>,
): HighRiskConfirmationPayload {
  const expiresAt = Date.now() + TTL_MS
  const signature = signBody(toolName, args, expiresAt)
  return { toolName, args, expiresAt, signature }
}

export function verifyConfirmationPayload(payload: HighRiskConfirmationPayload): boolean {
  if (Date.now() > payload.expiresAt) return false
  const expected = signBody(payload.toolName, payload.args, payload.expiresAt)
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(payload.signature))
  } catch {
    return false
  }
}

export function encodeConfirmationToken(payload: HighRiskConfirmationPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

export function decodeConfirmationToken(token: string): HighRiskConfirmationPayload | null {
  try {
    const json = Buffer.from(token, 'base64url').toString('utf8')
    const parsed = JSON.parse(json) as HighRiskConfirmationPayload
    if (!parsed?.toolName || !parsed?.signature || typeof parsed.expiresAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}
