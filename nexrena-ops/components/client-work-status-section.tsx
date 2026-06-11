'use client'

import type { PortalProject, PortalServiceRequest } from '@/lib/portal-types'
import { Btn } from '@/components/ui'
import { StatusChip, projectStatusChip, requestStatusChip } from '@/components/status-chip'

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

type Props = {
  activeProjects: PortalProject[]
  serviceRequests: PortalServiceRequest[]
  onStartRequest: () => void
  variant?: 'projects' | 'requests' | 'all'
}

export function ClientWorkStatusSection({
  activeProjects,
  serviceRequests,
  onStartRequest,
  variant = 'all',
}: Props) {
  const recentRequests = serviceRequests.slice(0, 5)
  const showProjects = variant === 'projects' || variant === 'all'
  const showRequests = variant === 'requests' || variant === 'all'

  if (showProjects && !showRequests) {
    if (activeProjects.length === 0) {
      return (
        <div className={`${card} space-y-2`}>
          <p className="text-sm text-slate-400">
            No active projects right now.
          </p>
          <p className="text-sm text-slate-500">
            When we start your next request, it will show up here.
          </p>
        </div>
      )
    }
    return (
      <ul className="space-y-3">
        {activeProjects.map((p) => {
          const chip = projectStatusChip(p.status)
          return (
            <li key={p.id} className={card}>
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-serif text-lg text-white">{p.name}</p>
                  <p className="text-sm text-slate-400 mt-1">{p.type}</p>
                </div>
                {chip && <StatusChip variant={chip} />}
              </div>
            </li>
          )
        })}
      </ul>
    )
  }

  if (showRequests && !showProjects) {
    if (recentRequests.length === 0) {
      return (
        <div className={`${card} space-y-3`}>
          <p className="text-sm text-slate-400">
            No recent requests.
          </p>
          <p className="text-sm text-slate-500">
            Need a website update or new page? Start a request.
          </p>
          <Btn size="sm" onClick={onStartRequest}>Start a new request</Btn>
        </div>
      )
    }
    return (
      <ul className="space-y-3">
        {recentRequests.map((r) => {
          const chip = requestStatusChip(r.status)
          return (
            <li key={r.id} className={card}>
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-serif text-lg text-white capitalize">{r.projectType}</p>
                {chip && <StatusChip variant={chip} />}
              </div>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">{r.description}</p>
              <p className="text-xs text-slate-500 mt-2">
                {r.budget ? `${r.budget} · ` : ''}
                Submitted {new Date(r.createdAt).toLocaleDateString()}
              </p>
            </li>
          )
        })}
      </ul>
    )
  }

  const isEmpty = activeProjects.length === 0 && recentRequests.length === 0
  if (isEmpty) {
    return (
      <div className={`${card} space-y-3`}>
        <p className="text-sm text-slate-400">No active projects or recent requests yet.</p>
        <Btn size="sm" onClick={onStartRequest}>Start a new request</Btn>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {activeProjects.length > 0 && (
        <ul className="space-y-3">
          {activeProjects.map((p) => {
            const chip = projectStatusChip(p.status)
            return (
              <li key={p.id} className={card}>
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-serif text-lg text-white">{p.name}</p>
                    <p className="text-sm text-slate-400 mt-1">{p.type}</p>
                  </div>
                  {chip && <StatusChip variant={chip} />}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {recentRequests.length > 0 && (
        <ul className="space-y-3">
          {recentRequests.map((r) => {
            const chip = requestStatusChip(r.status)
            return (
              <li key={r.id} className={card}>
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-serif text-lg text-white capitalize">{r.projectType}</p>
                  {chip && <StatusChip variant={chip} />}
                </div>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{r.description}</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
