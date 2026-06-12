'use client'

import { PortalStatCard } from '@/components/portal-stat-card'
import { formatCurrency, formatDate } from '@/lib/store'
import type { PortalDashboardStats } from '@/lib/portal-dashboard-utils'

type Props = { stats: PortalDashboardStats }

export function ClientDashboardStats({ stats }: Props) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <PortalStatCard
        label="Amount you owe"
        value={formatCurrency(stats.outstandingBalance)}
        sub={stats.outstandingBalance > 0 ? 'Open invoices' : 'Nothing due right now'}
        gold={stats.outstandingBalance > 0}
        photo="billing"
      />
      <PortalStatCard
        label="Work in progress"
        value={stats.activeProjectName ?? 'Nothing active'}
        sub={stats.activeProjectName ? 'We are working on this now' : 'We will update you when work starts'}
        photo="request"
      />
      <PortalStatCard
        label="Next payment due"
        value={stats.nextDueDate ? formatDate(stats.nextDueDate) : 'None'}
        sub={stats.nextDueDate ? 'Upcoming invoice date' : 'You are all caught up'}
        photo="schedule"
      />
    </div>
  )
}