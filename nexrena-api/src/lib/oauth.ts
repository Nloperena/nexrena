import { createHmac, randomBytes, timingSafeEqual } from 'crypto'

export type OAuthIntent = 'client' | 'team'

export type OAuthProvider = 'google' | 'microsoft'

type StatePayload = {
  provider: OAuthProvider
  intent: OAuthIntent
  nonce: string
  exp: number
}

function secret(): string {
  return process.env.PORTAL_JWT_SECRET || process.env.API_KEY || 'dev-portal-secret'
}

function encode(payload: StatePayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decode(raw: string): StatePayload | null {
  try {
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

export function signOAuthState(provider: OAuthProvider, intent: OAuthIntent): string {
  const payload: StatePayload = {
    provider,
    intent,
    nonce: randomBytes(16).toString('hex'),
    exp: Date.now() + 10 * 60 * 1000,
  }
  const body = encode(payload)
  const sig = createHmac('sha256', secret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyOAuthState(state: string, provider: OAuthProvider): OAuthIntent | null {
  const [body, sig] = state.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', secret()).update(body).digest('base64url')
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null
  const payload = decode(body)
  if (!payload || payload.exp < Date.now() || payload.provider !== provider) return null
  return payload.intent
}

export type OAuthRedirectPayload =
  | { role: 'client'; token: string; exp: number }
  | { role: 'team'; email: string; displayName: string; exp: number }

function encodeRedirect(payload: OAuthRedirectPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString('base64url')
}

function decodeRedirect(raw: string): OAuthRedirectPayload | null {
  try {
    return JSON.parse(Buffer.from(raw, 'base64url').toString('utf8'))
  } catch {
    return null
  }
}

export function signOAuthRedirect(
  payload: { role: 'client'; token: string } | { role: 'team'; email: string; displayName: string },
): string {
  const body = encodeRedirect({ ...payload, exp: Date.now() + 5 * 60 * 1000 } as OAuthRedirectPayload)
  const sig = createHmac('sha256', secret()).update(body).digest('base64url')
  return `${body}.${sig}`
}

export function verifyOAuthRedirect(auth: string): OAuthRedirectPayload | null {
  const [body, sig] = auth.split('.')
  if (!body || !sig) return null
  const expected = createHmac('sha256', secret()).update(body).digest('base64url')
  const sigBuf = Buffer.from(sig)
  const expBuf = Buffer.from(expected)
  if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null
  const payload = decodeRedirect(body)
  if (!payload || payload.exp < Date.now()) return null
  return payload
}

export function oauthSuccessRedirectUrl(auth: string): string {
  const base = process.env.OAUTH_SUCCESS_REDIRECT || process.env.PORTAL_URL || 'http://localhost:3001'
  return `${base.replace(/\/$/, '')}/oauth/callback#auth=${encodeURIComponent(auth)}`
}

export function oauthErrorRedirectUrl(message: string): string {
  const base = process.env.OAUTH_SUCCESS_REDIRECT || process.env.PORTAL_URL || 'http://localhost:3001'
  return `${base.replace(/\/$/, '')}/oauth/callback#error=${encodeURIComponent(message)}`
}

export function teamOAuthEmails(): Set<string> {
  const raw = process.env.TEAM_OAUTH_EMAILS || ''
  return new Set(
    raw
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function isOAuthProviderConfigured(provider: OAuthProvider): boolean {
  if (provider === 'google') {
    return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
  }
  return Boolean(process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET)
}

export function apiPublicUrl(): string {
  if (process.env.API_PUBLIC_URL) return process.env.API_PUBLIC_URL.replace(/\/$/, '')
  if (process.env.HEROKU_APP_NAME) {
    return `https://${process.env.HEROKU_APP_NAME}.herokuapp.com`
  }
  return 'http://localhost:4000'
}

export function oauthRedirectUri(provider: OAuthProvider): string {
  const override =
    provider === 'google'
      ? process.env.GOOGLE_OAUTH_REDIRECT_URI
      : process.env.MICROSOFT_OAUTH_REDIRECT_URI
  if (override) return override
  return `${apiPublicUrl()}/api/portal/oauth/${provider}/callback`
}
