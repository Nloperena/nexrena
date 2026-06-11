'use client'

import type { PortalInvoice, PortalProject, PortalServiceRequest } from '@/lib/portal-types'
import { getProjectPaymentStatus } from '@/lib/portal-dashboard-utils'
import { StatusChip, projectStatusChip, requestStatusChip } from '@/components/status-chip'

function requestDisplay(description: string, projectType: string): { label: string; body: string } {
  const match = description.match(/^\[([^\]]+)\]\s*([\s\S]*)$/)
  if (match) return { label: match[1], body: match[2] || description }
  return { label: projectType, body: description }
}

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

type Props = {
  activeProjects: PortalProject[]
  serviceRequests: PortalServiceRequest[]
  invoices?: PortalInvoice[]
  variant?: 'projects' | 'requests' | 'all'
}

function ProjectPaymentLine({
  project,
  invoices,
}: {
  project: PortalProject
  invoices: PortalInvoice[]
}) {
  const status = getProjectPaymentStatus(project.id, invoices)
  if (!status) return null
  return <p className="text-sm text-slate-400 mt-2">{status}</p>
}

export function ClientWorkStatusSection({
  activeProjects,
  serviceRequests,
  invoices = [],
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
                  <ProjectPaymentLine project={p} invoices={invoices} />
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
        <div className={`${card} space-y-2`}>
          <p className="text-sm text-slate-400">No requests yet.</p>
          <p className="text-sm text-slate-500">
            Use the quick request form above — we will track status here.
          </p>
        </div>
      )
    }
    return (
      <ul className="space-y-3">
        {recentRequests.map((r) => {
          const chip = requestStatusChip(r.status)
          const { label, body } = requestDisplay(r.description, r.projectType)
          return (
            <li key={r.id} className={card}>
              <div className="flex flex-wrap justify-between gap-2">
                <p className="font-serif text-lg text-white">{label}</p>
                {chip && <StatusChip variant={chip} />}
              </div>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">{body}</p>
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
      <div className={`${card} space-y-2`}>
        <p className="text-sm text-slate-400">No active projects or requests yet.</p>
        <p className="text-sm text-slate-500">Send a quick request above to get started.</p>
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
                    <ProjectPaymentLine project={p} invoices={invoices} />
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
            const { label, body } = requestDisplay(r.description, r.projectType)
            return (
              <li key={r.id} className={card}>
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="font-serif text-lg text-white">{label}</p>
                  {chip && <StatusChip variant={chip} />}
                </div>
                <p className="text-sm text-slate-400 mt-1 line-clamp-2">{body}</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
