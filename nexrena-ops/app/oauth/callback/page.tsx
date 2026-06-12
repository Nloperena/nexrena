'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { NexrenaLogo } from '@/components/nexrena-logo'
import { finishOAuthSession } from '@/lib/oauth'
import { setPortalToken, logoutPortal } from '@/lib/portal-client'

const ADMIN_SESSION_KEY = 'nx-ops-unlocked'
const ADMIN_DISPLAY_NAME_KEY = 'nx-ops-display-name'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const [message, setMessage] = useState('Completing sign-in…')

  useEffect(() => {
    const hash = window.location.hash.startsWith('#')
      ? window.location.hash.slice(1)
      : window.location.hash
    const params = new URLSearchParams(hash)
    const error = params.get('error')
    const auth = params.get('auth')

    if (error) {
      setMessage(decodeURIComponent(error))
      return
    }
    if (!auth) {
      setMessage('Missing sign-in response. Please try again from the login page.')
      return
    }

    finishOAuthSession(auth)
      .then((result) => {
        if (result.role === 'client') {
          localStorage.removeItem(ADMIN_SESSION_KEY)
          sessionStorage.removeItem(ADMIN_SESSION_KEY)
          setPortalToken(result.token)
          window.location.replace('/')
          return
        }
        logoutPortal()
        localStorage.setItem(ADMIN_SESSION_KEY, 'true')
        sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
        localStorage.setItem(ADMIN_DISPLAY_NAME_KEY, result.displayName)
        sessionStorage.setItem(ADMIN_DISPLAY_NAME_KEY, result.displayName)
        window.location.replace('/')
      })
      .catch((err) => {
        setMessage(err instanceof Error ? err.message : 'Sign-in failed.')
      })
  }, [router])

  return (
    <div className="client-portal min-h-screen flex items-center justify-center bg-[#111418] px-6">
      <div className="w-full max-w-md text-center space-y-4">
        <NexrenaLogo size="lg" className="justify-center" />
        <p className="text-lg text-slate-200">{message}</p>
        {message !== 'Completing sign-in…' && (
          <button
            type="button"
            onClick={() => router.replace('/')}
            className="text-gold hover:underline text-base"
          >
            Back to sign in
          </button>
        )}
      </div>
    </div>
  )
}
