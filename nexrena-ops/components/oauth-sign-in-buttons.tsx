'use client'

import { useEffect, useState } from 'react'
import { fetchOAuthProviders, oauthStartUrl, type OAuthIntent } from '@/lib/oauth'
import { portalFocusRing } from '@/lib/portal-a11y'

type Props = {
  intent?: OAuthIntent
  disabled?: boolean
}

export function OAuthSignInButtons({ intent = 'client', disabled = false }: Props) {
  const [providers, setProviders] = useState({ google: false, microsoft: false })

  useEffect(() => {
    fetchOAuthProviders().then((p) => {
      setProviders({ google: p.google, microsoft: p.microsoft })
    })
  }, [])

  if (!providers.google && !providers.microsoft) return null

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-700/60" />
        <span className="text-sm text-slate-400">or continue with</span>
        <div className="h-px flex-1 bg-slate-700/60" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {providers.google && (
          <OAuthButton
            label="Google"
            sublabel="Gmail"
            disabled={disabled}
            onClick={() => { window.location.href = oauthStartUrl('google', intent) }}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                <path fill="#EA4335" d="M12 11.2v3.6h5.1c-.2 1.2-1.6 3.6-5.1 3.6-3.1 0-5.6-2.5-5.6-5.6S8.9 7.2 12 7.2c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.8 4.6 14.6 3.6 12 3.6 7 3.6 3 7.6 3 12.6s4 9 9 9c5.2 0 8.6-3.6 8.6-8.7 0-.6-.1-1-.2-1.7H12z" />
              </svg>
            }
          />
        )}
        {providers.microsoft && (
          <OAuthButton
            label="Microsoft"
            sublabel="Outlook"
            disabled={disabled}
            onClick={() => { window.location.href = oauthStartUrl('microsoft', intent) }}
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden>
                <rect x="3" y="3" width="8" height="8" fill="#F25022" />
                <rect x="13" y="3" width="8" height="8" fill="#7FBA00" />
                <rect x="3" y="13" width="8" height="8" fill="#00A4EF" />
                <rect x="13" y="13" width="8" height="8" fill="#FFB900" />
              </svg>
            }
          />
        )}
      </div>
    </div>
  )
}

function OAuthButton({
  label,
  sublabel,
  icon,
  onClick,
  disabled,
}: {
  label: string
  sublabel: string
  icon: React.ReactNode
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-3 w-full rounded-xl border-2 border-slate-600 bg-[#1a2332] px-4 py-3.5 min-h-[56px] text-white hover:border-slate-500 hover:bg-slate-800/60 transition-colors disabled:opacity-50 ${portalFocusRing}`}
    >
      {icon}
      <span className="text-base font-medium">
        {label}
        <span className="text-slate-400 font-normal"> · {sublabel}</span>
      </span>
    </button>
  )
}
