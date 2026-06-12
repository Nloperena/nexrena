'use client'

import { ServiceRequestWizard } from '@/components/service-request-wizard'
import type { PortalServiceRequest } from '@/lib/portal-types'

type Props = {
  onCreated: (request: PortalServiceRequest) => void
  onSuccess?: () => void
  variant?: 'modal' | 'inline'
}

/** TurboTax-style step wizard — replaces the old card picker flow. */
export function ServiceRequestForm({ onCreated, onSuccess }: Props) {
  return <ServiceRequestWizard onCreated={onCreated} onSuccess={onSuccess} />
}
