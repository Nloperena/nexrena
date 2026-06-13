'use client'

import { RequestsSheetWizard } from '@/components/requests-sheet-wizard'
import type { PortalServiceRequest } from '@/lib/portal-types'

type Props = {
  open: boolean
  onClose: () => void
  onCreated: (request: PortalServiceRequest) => void
}

/** Opens the service request wizard in a right-side sheet (home quick action + legacy name). */
export function ClientRequestModal({ open, onClose, onCreated }: Props) {
  return (
    <RequestsSheetWizard
      open={open}
      onClose={onClose}
      onCreated={onCreated}
    />
  )
}
