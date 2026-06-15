'use client'
import { useState, useEffect } from 'react'
import { api } from '@/lib/api'

type Status = 'ok' | 'unreachable' | 'unauthorized' | 'misconfigured' | null

export function ApiConnectionBanner() {
  const [status, setStatus] = useState<Status>(null)

  useEffect(() => {
    api.get('/contacts')
      .then(() => setStatus('ok'))
      .catch((err) => {
        const msg = err?.message ?? ''
        if (msg.includes('503') || msg.includes('API_KEY is not configured')) {
          setStatus('misconfigured')
          return
        }
        setStatus(
          msg.includes('401') || msg.includes('Unauthorized') ? 'unauthorized' : 'unreachable',
        )
      })
  }, [])

  if (status === null || status === 'ok') return null

  const config = {
    misconfigured: {
      title: 'API key not configured on server',
      text: 'Set API_KEY (or NEXT_PUBLIC_API_KEY) in Vercel env for nexrena-ops, then redeploy. It must match Heroku API_KEY.',
    },
    unreachable: {
      title: 'Cannot reach API',
      text: 'Check NEXT_PUBLIC_API_URL on Vercel and that the Heroku API is running.',
    },
    unauthorized: {
      title: 'Invalid API key',
      text: 'API_KEY on Vercel must match API_KEY on the Heroku nexrena-api app.',
    },
  }[status]

  return (
    <div className="mb-6 px-5 py-4 rounded-xl bg-amber-950/50 border border-amber-800/50 text-amber-200">
      <p className="font-semibold text-sm">{config.title}</p>
      <p className="text-xs mt-1.5 text-amber-200/90">{config.text}</p>
    </div>
  )
}
