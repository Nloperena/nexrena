'use client'

import type { PortalInvoice, PortalProject, PortalServiceRequest } from '@/lib/portal-types'
import { getProjectPaymentStatus } from '@/lib/portal-dashboard-utils'
import { StatusChip, projectStatusChip, requestStatusChip } from '@/components/status-chip'
import { portalCardClass, portalMutedClass, portalSectionHintClass } from '@/lib/portal-a11y'

function requestDisplay(description: string, projectType: string): { label: string; body: string } {
  const match = description.match(/^\[([^\]]+)\]\s*([\s\S]*)$/)
  if (match) return { label: match[1], body: match[2] || description }
  return { label: projectType, body: description }
}

const card = portalCardClass

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
  return <p className={`${portalMutedClass} mt-2`}>{status}</p>
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
        <div className={`${card} space-y-3 text-center py-6`}>
          <p className="font-serif text-lg text-white">No active projects yet</p>
          <p className={portalSectionHintClass}>When work begins, you&apos;ll see status and next steps here.</p>
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
                  <p className="font-serif text-xl text-white">{p.name}</p>
                  <p className={`${portalMutedClass} mt-2`}>{p.type}</p>
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
          <p className={portalMutedClass}>No requests yet.</p>
          <p className={portalSectionHintClass}>Use the request form above — we will track status here.</p>
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
                <p className="font-serif text-xl text-white">{label}</p>
                {chip && <StatusChip variant={chip} />}
              </div>
              <p className={`${portalMutedClass} mt-2 line-clamp-3`}>{body}</p>
              <p className={`${portalMutedClass} mt-2`}>
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
        <p className={portalMutedClass}>No active projects or requests yet.</p>
        <p className={portalSectionHintClass}>Send a request above to get started.</p>
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
                <p className={`${portalMutedClass} mt-2 line-clamp-3`}>{body}</p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
