'use client'

import { SafetyWarningReports } from '@/components/safety-warning-reports'
import { PageHeader } from '@/components/ui'

export default function SafetyWarningsPage() {
  return (
    <div className="w-full min-w-0 overflow-x-hidden space-y-6">
      <PageHeader
        title="Safety notices"
        sub="On-site hazard warnings and scope-limitation letters for clients"
      />
      <SafetyWarningReports />
    </div>
  )
}
