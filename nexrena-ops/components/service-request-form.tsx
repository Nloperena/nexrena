'use client'



import { ServiceRequestWizard } from '@/components/service-request-wizard'

import type { PortalServiceRequest } from '@/lib/portal-types'



type Props = {
  onCreated: (request: PortalServiceRequest) => void
  onSuccess?: () => void
  /** @deprecated Use embedded instead */
  variant?: 'modal' | 'inline'
  embedded?: boolean
}

/** TurboTax-style step wizard — replaces the old card picker flow. */
export function ServiceRequestForm({ onCreated, onSuccess, embedded }: Props) {
  return (
    <ServiceRequestWizard
      onCreated={onCreated}
      onSuccess={onSuccess}
      embedded={embedded}
    />
  )
}

