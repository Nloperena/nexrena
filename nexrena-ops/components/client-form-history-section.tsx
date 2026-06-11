'use client'

import { formatDate } from '@/lib/store'
import type { PortalFormSubmission } from '@/lib/portal-types'

const SITE_LABELS: Record<string, string> = {
  ttag: 'Your website',
}

type Props = {
  submissions: PortalFormSubmission[]
}

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

export function ClientFormHistorySection({ submissions }: Props) {
  if (submissions.length === 0) {
    return (
      <div className={card}>
        <h3 className="text-sm uppercase tracking-widest text-slate-400 font-medium mb-2">Website form history</h3>
        <p className="text-sm text-slate-500">
          Inquiries submitted through your site contact form will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm uppercase tracking-widest text-slate-400 font-medium">Website form history</h3>
      <ul className="space-y-3">
        {submissions.map(sub => {
          const fields = sub.fields as Record<string, unknown>
          const message = typeof fields.message === 'string' ? fields.message : ''
          const topic = typeof fields.topic === 'string' ? fields.topic : null
          return (
            <li key={sub.id} className={card}>
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="font-serif text-lg text-white">{sub.submitterName}</p>
                  <p className="text-sm text-slate-400">{sub.submitterEmail}</p>
                  {topic && <p className="text-xs text-gold mt-1">{topic}</p>}
                </div>
                <p className="text-xs text-slate-500">{formatDate(sub.createdAt)}</p>
              </div>
              {message && (
                <p className="mt-3 text-sm text-slate-300 whitespace-pre-wrap line-clamp-4">{message}</p>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
