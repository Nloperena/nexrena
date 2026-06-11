'use client'

import { StatCard } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/store'
import type { PortalDashboardStats } from '@/lib/portal-dashboard-utils'

type Props = { stats: PortalDashboardStats }

export function ClientDashboardStats({ stats }: Props) {
  const pendingLabel =
    stats.pendingApprovalCount > 0
      ? String(stats.pendingApprovalCount)
      : 'None'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        label="Outstanding balance"
        value={formatCurrency(stats.outstandingBalance)}
        gold={stats.outstandingBalance > 0}
      />
      <StatCard
        label="Active project"
        value={stats.activeProjectName ?? 'None'}
        sub={stats.activeProjectName ? 'In progress' : undefined}
      />
      <StatCard
        label="Pending approval"
        value={pendingLabel}
        sub={stats.pendingApprovalCount > 0 ? 'Estimates awaiting you' : undefined}
        gold={stats.pendingApprovalCount > 0}
      />
      <StatCard
        label="Next due invoice"
        value={stats.nextDueDate ? formatDate(stats.nextDueDate) : 'None'}
        sub={stats.nextDueDate ? 'Upcoming payment' : 'All caught up'}
      />
    </div>
  )
}
