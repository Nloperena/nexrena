const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://nexrena-api-5dc54effaa9f.herokuapp.com'

export type OAuthIntent = 'client' | 'team'

export type OAuthProviders = {
  google: boolean
  microsoft: boolean
  teamOAuth: boolean
}

export function oauthStartUrl(provider: 'google' | 'microsoft', intent: OAuthIntent = 'client'): string {
  return `${API_BASE}/api/portal/oauth/${provider}?intent=${intent}`
}

export async function fetchOAuthProviders(): Promise<OAuthProviders> {
  const res = await fetch(`${API_BASE}/api/portal/oauth/providers`, { cache: 'no-store' })
  if (!res.ok) {
    return { google: false, microsoft: false, teamOAuth: false }
  }
  return res.json()
}

export type OAuthFinishResult =
  | { role: 'client'; token: string }
  | { role: 'team'; displayName: string; email: string }

export async function finishOAuthSession(auth: string): Promise<OAuthFinishResult> {
  const res = await fetch(`${API_BASE}/api/portal/oauth/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ auth }),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Could not complete sign-in')
  }
  return data as OAuthFinishResult
}
