'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/store'
import type { PortalFormSubmission } from '@/lib/portal-types'

const SITE_LABELS: Record<string, string> = {
  ttag: 'Two Azalea Group',
  fpusa: 'Furniture Packages USA',
  nicoloperena: 'NicoLoperena.com',
}

import { portalCardClass, portalFocusRing, portalSectionHintClass, portalSectionTitleClass } from '@/lib/portal-a11y'

const card = portalCardClass

function fieldLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/[_-]/g, ' ')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim()
}

function formatFieldValue(value: unknown): string {
  if (value == null || value === '') return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value, null, 2)
}

type Props = {
  submissions: PortalFormSubmission[]
}

export function ClientFormHistorySection({ submissions }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const newCount = submissions.filter((s) => s.status === 'new').length

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
        <div>
          <h3 className={portalSectionTitleClass}>Website form leads</h3>
          <p className={`${portalSectionHintClass} mt-2`}>
            Messages from people who filled out your website contact form.
          </p>
        </div>
        {submissions.length > 0 && (
          <p className="text-base text-slate-400 tabular-nums">
            {submissions.length} total
            {newCount > 0 && (
              <span className="ml-2 text-gold font-medium">{newCount} new</span>
            )}
          </p>
        )}
      </div>

      {submissions.length === 0 ? (
        <div className={card}>
          <p className="text-base text-slate-300 leading-relaxed">
            No submissions yet. When someone fills out your website form, you will see their
            message here.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {submissions.map((sub) => {
            const fields = sub.fields as Record<string, unknown>
            const message = typeof fields.message === 'string' ? fields.message : ''
            const topic = typeof fields.topic === 'string' ? fields.topic : null
            const isExpanded = expandedId === sub.id
            const extraFields = Object.entries(fields).filter(
              ([key]) => !['message', 'topic', 'name', 'email'].includes(key),
            )

            return (
              <li key={sub.id} className={card}>
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-serif text-xl text-white">{sub.submitterName}</p>
                      {sub.status === 'new' && (
                        <span className="text-sm font-medium text-gold bg-gold/10 px-3 py-1 rounded-lg">
                          New
                        </span>
                      )}
                    </div>
                    <p className="text-base text-slate-300">{sub.submitterEmail}</p>
                    <p className="text-base text-slate-400 mt-1">
                      {SITE_LABELS[sub.siteKey] ?? sub.formName}
                      {topic ? ` · ${topic}` : ''}
                    </p>
                  </div>
                  <p className="text-base text-slate-400 shrink-0">{formatDate(sub.createdAt)}</p>
                </div>

                {message && (
                  <p
                    className={`mt-3 text-base text-slate-200 whitespace-pre-wrap leading-relaxed ${
                      isExpanded ? '' : 'line-clamp-3'
                    }`}
                  >
                    {message}
                  </p>
                )}

                {isExpanded && extraFields.length > 0 && (
                  <dl className="mt-4 space-y-2 border-t border-slate-800/60 pt-4">
                    {extraFields.map(([key, value]) => (
                      <div key={key}>
                        <dt className="text-base font-medium text-slate-400">
                          {fieldLabel(key)}
                        </dt>
                        <dd className="text-base text-slate-200 whitespace-pre-wrap mt-1 leading-relaxed">
                          {formatFieldValue(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}

                {isExpanded && sub.pageUrl && (
                  <p className="mt-3 text-base text-slate-500 truncate">From: {sub.pageUrl}</p>
                )}

                {(message.length > 180 || extraFields.length > 0 || sub.pageUrl) && (
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                    className={`mt-4 text-base text-slate-300 hover:text-gold transition-colors min-h-[44px] ${portalFocusRing}`}
                  >
                    {isExpanded ? 'Show less' : 'View details'}
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
