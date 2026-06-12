import type { OAuthProvider } from './oauth'
import { oauthRedirectUri } from './oauth'

export type OAuthProfile = {
  subjectId: string
  email: string
  name: string
  emailVerified: boolean
}

type TokenResponse = {
  access_token?: string
  id_token?: string
  error?: string
  error_description?: string
}

async function exchangeCode(
  tokenUrl: string,
  body: Record<string, string>,
): Promise<string> {
  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body),
  })
  const data = (await res.json()) as TokenResponse
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'OAuth token exchange failed')
  }
  return data.access_token
}

export function googleAuthorizeUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: oauthRedirectUri('google'),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
    access_type: 'online',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function googleProfileFromCode(code: string): Promise<OAuthProfile> {
  const accessToken = await exchangeCode('https://oauth2.googleapis.com/token', {
    code,
    client_id: process.env.GOOGLE_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CLIENT_SECRET!,
    redirect_uri: oauthRedirectUri('google'),
    grant_type: 'authorization_code',
  })

  const res = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = (await res.json()) as {
    sub?: string
    email?: string
    name?: string
    email_verified?: boolean
  }
  if (!res.ok || !data.sub || !data.email) {
    throw new Error('Could not load Google profile')
  }
  return {
    subjectId: data.sub,
    email: data.email.toLowerCase(),
    name: data.name?.trim() || data.email.split('@')[0],
    emailVerified: data.email_verified !== false,
  }
}

export function microsoftAuthorizeUrl(state: string): string {
  const tenant = process.env.MICROSOFT_TENANT_ID || 'common'
  const params = new URLSearchParams({
    client_id: process.env.MICROSOFT_CLIENT_ID!,
    redirect_uri: oauthRedirectUri('microsoft'),
    response_type: 'code',
    scope: 'openid email profile User.Read',
    state,
    response_mode: 'query',
  })
  return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params}`
}

export async function microsoftProfileFromCode(code: string): Promise<OAuthProfile> {
  const tenant = process.env.MICROSOFT_TENANT_ID || 'common'
  const accessToken = await exchangeCode(
    `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`,
    {
      code,
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
      redirect_uri: oauthRedirectUri('microsoft'),
      grant_type: 'authorization_code',
    },
  )

  const res = await fetch('https://graph.microsoft.com/v1.0/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = (await res.json()) as {
    id?: string
    mail?: string | null
    userPrincipalName?: string
    displayName?: string
  }
  if (!res.ok || !data.id) {
    throw new Error('Could not load Microsoft profile')
  }
  const email = (data.mail || data.userPrincipalName || '').toLowerCase()
  if (!email) throw new Error('Microsoft account has no email address')
  return {
    subjectId: data.id,
    email,
    name: data.displayName?.trim() || email.split('@')[0],
    emailVerified: true,
  }
}

export async function oauthProfileFromCode(
  provider: OAuthProvider,
  code: string,
): Promise<OAuthProfile> {
  if (provider === 'google') return googleProfileFromCode(code)
  return microsoftProfileFromCode(code)
}
