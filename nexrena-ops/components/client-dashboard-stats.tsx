'use client'

import { StatCard } from '@/components/ui'
import { formatCurrency, formatDate } from '@/lib/store'
import type { PortalDashboardStats } from '@/lib/portal-dashboard-utils'

type Props = { stats: PortalDashboardStats }

export function ClientDashboardStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <StatCard
        label="Outstanding balance"
        value={formatCurrency(stats.outstandingBalance)}
        gold={stats.outstandingBalance > 0}
      />
      <StatCard
        label="Current work"
        value={stats.activeProjectName ?? 'Nothing active'}
        sub={stats.activeProjectName ? 'In progress' : 'We\u2019ll update you when work starts.'}
      />
      <StatCard
        label="Next due"
        value={stats.nextDueDate ? formatDate(stats.nextDueDate) : 'None'}
        sub={stats.nextDueDate ? 'Upcoming payment' : 'All caught up'}
      />
    </div>
  )
}
