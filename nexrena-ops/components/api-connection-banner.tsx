'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

type Status = 'ok' | 'no-url' | 'unreachable' | 'unauthorized' | null

export function ApiConnectionBanner() {
  const [status, setStatus] = useState<Status>(null)

  useEffect(() => {
    const base = process.env.NEXT_PUBLIC_API_URL || ''
    if (!base) {
      setStatus('no-url')
      return
    }
    // Health is public; then try a protected route to check key
    fetch(`${base.replace(/\/$/, '')}/api/health`)
      .then((res) => {
        if (!res.ok) {
          setStatus('unreachable')
          return
        }
        return api.get('/contacts').then(() => setStatus('ok'))
      })
      .catch((err) => {
        const msg = err?.message ?? ''
        setStatus(msg.includes('401') || msg.includes('Unauthorized') ? 'unauthorized' : 'unreachable')
      })
  }, [])

  if (status === null || status === 'ok') return null

  const config = {
    'no-url': {
      title: 'API URL not set',
      text: 'Set NEXT_PUBLIC_API_URL in .env.local (local) or in your hosting env (e.g. https://nexrena-api-5dc54effaa9f.herokuapp.com).',
    },
    unreachable: {
      title: 'Cannot reach API',
      text: 'Check NEXT_PUBLIC_API_URL and CORS: add your Ops URL to CORS_ORIGINS on Heroku (e.g. https://nexrena-ops.vercel.app).',
    },
    unauthorized: {
      title: 'Invalid API key',
      text: 'Set NEXT_PUBLIC_API_KEY to match the API_KEY config var on your Heroku app.',
    },
  }[status]

  return (
    <div className="mb-6 px-5 py-4 rounded-xl bg-amber-950/50 border border-amber-800/50 text-amber-200">
      <p className="font-semibold text-sm">{config.title}</p>
      <p className="text-xs mt-1.5 text-amber-200/90">{config.text}</p>
    </div>
  )
}
