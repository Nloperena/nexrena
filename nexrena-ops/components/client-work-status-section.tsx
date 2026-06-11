'use client'

import type { PortalProject, PortalServiceRequest } from '@/lib/portal-types'
import { portalSectionTitleClass } from '@/lib/portal-dashboard-utils'
import { Btn } from '@/components/ui'

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

type Props = {
  activeProjects: PortalProject[]
  serviceRequests: PortalServiceRequest[]
  onStartRequest: () => void
}

export function ClientWorkStatusSection({
  activeProjects,
  serviceRequests,
  onStartRequest,
}: Props) {
  const recentRequests = serviceRequests.slice(0, 5)
  const hasProjects = activeProjects.length > 0
  const hasRequests = recentRequests.length > 0
  const isEmpty = !hasProjects && !hasRequests

  return (
    <section>
      <h3 className={portalSectionTitleClass}>Work Status</h3>

      {isEmpty ? (
        <div className={`${card} space-y-3`}>
          <p className="text-sm text-slate-500">
            No active projects or recent requests yet.
          </p>
          <p className="text-sm text-slate-500">
            Start a request and we&apos;ll scope your first sprint after intake.
          </p>
          <Btn size="sm" onClick={onStartRequest}>Start a new request</Btn>
        </div>
      ) : (
        <div className="space-y-8">
          {hasProjects && (
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-3 font-medium">
                Active Projects
              </p>
              <ul className="space-y-3">
                {activeProjects.map((p) => (
                  <li key={p.id} className={card}>
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-serif text-lg text-white">{p.name}</p>
                        <p className="text-sm text-slate-400">{p.type} · {p.status.replace('_', ' ')}</p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-gold shrink-0">
                        {p.status.replace('_', ' ')}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {hasRequests && (
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-500 mb-3 font-medium">
                Recent Requests
              </p>
              <ul className="space-y-3">
                {recentRequests.map((r) => (
                  <li key={r.id} className={card}>
                    <p className="font-serif text-lg text-white capitalize">{r.projectType}</p>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-2">{r.description}</p>
                    <p className="text-xs text-slate-500 mt-2">
                      {r.status}{r.budget ? ` · ${r.budget}` : ''}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
