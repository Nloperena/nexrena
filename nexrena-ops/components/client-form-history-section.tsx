'use client'

import { useState } from 'react'
import { formatDate } from '@/lib/store'
import type { PortalFormSubmission } from '@/lib/portal-types'
import { portalCardClass, portalFocusRing, portalSectionHintClass, portalSectionTitleClass } from '@/lib/portal-a11y'

const SITE_LABELS: Record<string, string> = {
  ttag: 'Two Azalea Group',
  fpusa: 'Furniture Packages USA',
  nicoloperena: 'NicoLoperena.com',
}

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

function actionBtnClass(variant: 'default' | 'danger' = 'default') {
  const base = `min-h-[44px] rounded-xl px-3 py-2 text-base transition-colors ${portalFocusRing} disabled:opacity-50`
  return variant === 'danger'
    ? `${base} text-red-400 hover:bg-red-500/10`
    : `${base} text-slate-300 hover:text-gold hover:bg-gold/10`
}

type Props = {
  submissions: PortalFormSubmission[]
  view: 'active' | 'archived'
  busyId: string | null
  onMarkRead: (sub: PortalFormSubmission) => void
  onArchive: (sub: PortalFormSubmission) => void
  onRestore: (sub: PortalFormSubmission) => void
  onDeletePermanently: (sub: PortalFormSubmission) => void
}

export function ClientFormHistorySection({
  submissions,
  view,
  busyId,
  onMarkRead,
  onArchive,
  onRestore,
  onDeletePermanently,
}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const newCount = submissions.filter((s) => s.status === 'new').length
  const isArchive = view === 'archived'

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-3 pt-2">
        <div>
          <h3 className={portalSectionTitleClass}>
            {isArchive ? 'Archived leads' : 'Website form leads'}
          </h3>
          <p className={`${portalSectionHintClass} mt-2`}>
            {isArchive
              ? 'Archived leads stay here until you restore or delete them permanently.'
              : 'Messages from people who filled out your website contact form.'}
          </p>
        </div>
        {!isArchive && submissions.length > 0 && (
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
            {isArchive
              ? 'No archived leads. When you move a lead to archive, it will appear here.'
              : 'No submissions yet. When someone fills out your website form, you will see their message here.'}
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
            const busy = busyId === sub.id

            return (
              <li key={sub.id} className={`${card} ${isArchive ? 'opacity-80' : ''}`}>
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-serif text-xl text-white">{sub.submitterName}</p>
                      {sub.status === 'new' && !isArchive && (
                        <span className="text-sm font-medium text-gold bg-gold/10 px-3 py-1 rounded-lg">
                          New
                        </span>
                      )}
                      {isArchive && (
                        <span className="text-sm font-medium text-slate-500 bg-slate-800/60 px-3 py-1 rounded-lg">
                          Archived
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

                <div className="mt-4 flex flex-wrap gap-2">
                  {(message.length > 180 || extraFields.length > 0 || sub.pageUrl) && (
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : sub.id)}
                      className={actionBtnClass()}
                      disabled={busy}
                    >
                      {isExpanded ? 'Show less' : 'View details'}
                    </button>
                  )}
                  {!isArchive && sub.status !== 'archived' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onMarkRead(sub)}
                        className={actionBtnClass()}
                        disabled={busy}
                      >
                        {sub.status === 'new' ? 'Mark read' : 'Mark new'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onArchive(sub)}
                        className={actionBtnClass()}
                        disabled={busy}
                      >
                        Move to archive
                      </button>
                    </>
                  )}
                  {isArchive && (
                    <>
                      <button
                        type="button"
                        onClick={() => onRestore(sub)}
                        className={actionBtnClass()}
                        disabled={busy}
                      >
                        Restore
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeletePermanently(sub)}
                        className={actionBtnClass('danger')}
                        disabled={busy}
                      >
                        Delete permanently
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
