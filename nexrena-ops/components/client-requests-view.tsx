'use client'

import { useState } from 'react'
import type { PortalInvoice, PortalProject, PortalProposal, PortalServiceRequest } from '@/lib/portal-types'
import { Btn } from '@/components/ui'
import { portalSectionTitleClass } from '@/lib/portal-a11y'
import { ClientWorkStatusSection } from '@/components/client-work-status-section'
import { ClientRequestsEstimates } from '@/components/client-requests-estimates'
import { RequestsSheetWizard } from '@/components/requests-sheet-wizard'

type Props = {
  proposals: PortalProposal[]
  activeProjects: PortalProject[]
  serviceRequests: PortalServiceRequest[]
  invoices: PortalInvoice[]
  onRequestCreated: (request: PortalServiceRequest) => void
  onNavigateToMessages: () => void
}

export function ClientRequestsView({
  proposals,
  activeProjects,
  serviceRequests,
  invoices,
  onRequestCreated,
  onNavigateToMessages,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false)

  return (
    <div className="space-y-6 md:space-y-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="font-serif text-2xl text-white sm:text-3xl">Requests</h1>
        <Btn size="md" onClick={() => setSheetOpen(true)}>
          + New Request
        </Btn>
      </header>

      <ClientRequestsEstimates
        proposals={proposals}
        onApproveViaMessage={onNavigateToMessages}
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-3">
          <h3 className={portalSectionTitleClass}>Active projects</h3>
          <ClientWorkStatusSection
            activeProjects={activeProjects}
            serviceRequests={serviceRequests}
            invoices={invoices}
            variant="projects"
          />
        </section>

        <section className="space-y-3">
          <h3 className={portalSectionTitleClass}>Recent requests</h3>
          <ClientWorkStatusSection
            activeProjects={activeProjects}
            serviceRequests={serviceRequests}
            invoices={invoices}
            variant="requests"
          />
        </section>
      </div>

      <RequestsSheetWizard
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onCreated={onRequestCreated}
      />
    </div>
  )
}
