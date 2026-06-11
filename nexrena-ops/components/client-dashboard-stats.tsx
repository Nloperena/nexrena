'use client'

import { StatCard } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/store'
import type { PortalDashboardStats } from '@/lib/portal-dashboard-utils'

type Props = { stats: PortalDashboardStats }

export function ClientDashboardStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard
        label="Outstanding balance"
        value={formatCurrency(stats.outstandingBalance)}
        gold={stats.outstandingBalance > 0}
      />
      <StatCard
        label="Active project"
        value={stats.activeProjectName ?? 'No active project'}
        sub={stats.activeProjectName ? 'In progress' : 'Start a request when you\u2019re ready.'}
      />
      <StatCard
        label="Pending approval"
        value={stats.pendingApprovalCount > 0 ? String(stats.pendingApprovalCount) : 'Nothing pending'}
        sub={stats.pendingApprovalCount > 0 ? 'Estimates awaiting you' : 'No estimates need approval.'}
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
