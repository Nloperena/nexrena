import { Router, type Request, type Response } from 'express'
import {
  isOAuthProviderConfigured,
  oauthErrorRedirectUrl,
  oauthSuccessRedirectUrl,
  signOAuthRedirect,
  signOAuthState,
  teamOAuthEmails,
  verifyOAuthRedirect,
  verifyOAuthState,
  type OAuthIntent,
  type OAuthProvider,
} from '../lib/oauth'
import {
  googleAuthorizeUrl,
  microsoftAuthorizeUrl,
  oauthProfileFromCode,
} from '../lib/oauth-providers'
import { findOrCreateOAuthPortalAccount } from '../lib/portal-oauth-account'

const router = Router()

function parseIntent(value: unknown): OAuthIntent {
  return value === 'team' ? 'team' : 'client'
}

function startOAuth(provider: OAuthProvider, intent: OAuthIntent) {
  if (!isOAuthProviderConfigured(provider)) {
    throw new Error(`${provider === 'google' ? 'Google' : 'Microsoft'} sign-in is not configured yet.`)
  }
  const state = signOAuthState(provider, intent)
  return provider === 'google' ? googleAuthorizeUrl(state) : microsoftAuthorizeUrl(state)
}

router.get('/google', (req, res) => {
  try {
    const intent = parseIntent(req.query.intent)
    res.redirect(startOAuth('google', intent))
  } catch (err) {
    res.redirect(oauthErrorRedirectUrl(err instanceof Error ? err.message : 'Google sign-in unavailable'))
  }
})

router.get('/microsoft', (req, res) => {
  try {
    const intent = parseIntent(req.query.intent)
    res.redirect(startOAuth('microsoft', intent))
  } catch (err) {
    res.redirect(oauthErrorRedirectUrl(err instanceof Error ? err.message : 'Microsoft sign-in unavailable'))
  }
})

async function handleCallback(provider: OAuthProvider, req: Request, res: Response) {
  const { code, state, error, error_description: errorDescription } = req.query as {
    code?: string
    state?: string
    error?: string
    error_description?: string
  }

  if (error) {
    res.redirect(oauthErrorRedirectUrl(errorDescription || error))
    return
  }
  if (!code || !state) {
    res.redirect(oauthErrorRedirectUrl('Missing OAuth response from provider.'))
    return
  }

  const intent = verifyOAuthState(state, provider)
  if (!intent) {
    res.redirect(oauthErrorRedirectUrl('Sign-in session expired. Please try again.'))
    return
  }

  try {
    const profile = await oauthProfileFromCode(provider, code)

    if (intent === 'team') {
      const allowed = teamOAuthEmails()
      if (!allowed.has(profile.email)) {
        res.redirect(oauthErrorRedirectUrl('This Google or Microsoft account is not authorized for team access.'))
        return
      }
      const auth = signOAuthRedirect({
        role: 'team',
        email: profile.email,
        displayName: profile.name,
      })
      res.redirect(oauthSuccessRedirectUrl(auth))
      return
    }

    const session = await findOrCreateOAuthPortalAccount(provider, profile)
    const auth = signOAuthRedirect({ role: 'client', token: session.token })
    res.redirect(oauthSuccessRedirectUrl(auth))
  } catch (err) {
    res.redirect(oauthErrorRedirectUrl(err instanceof Error ? err.message : 'Sign-in failed'))
  }
}

router.get('/google/callback', (req, res) => {
  handleCallback('google', req, res)
})

router.get('/microsoft/callback', (req, res) => {
  handleCallback('microsoft', req, res)
})

/** POST /api/portal/oauth/finish — exchange signed redirect auth for session details */
router.post('/finish', (req, res) => {
  const { auth } = req.body as { auth?: string }
  if (!auth) {
    res.status(400).json({ error: 'auth is required' })
    return
  }
  const payload = verifyOAuthRedirect(auth)
  if (!payload) {
    res.status(401).json({ error: 'Sign-in link expired. Please try again.' })
    return
  }
  if (payload.role === 'team') {
    res.json({ role: 'team', displayName: payload.displayName, email: payload.email })
    return
  }
  res.json({ role: 'client', token: payload.token })
})

/** GET /api/portal/oauth/providers — which providers are enabled */
router.get('/providers', (_req, res) => {
  res.json({
    google: isOAuthProviderConfigured('google'),
    microsoft: isOAuthProviderConfigured('microsoft'),
    teamOAuth: teamOAuthEmails().size > 0,
  })
})

export default router
