'use client'

import { Modal } from '@/components/ui'
import { ServiceRequestForm } from '@/components/service-request-form'
import type { PortalServiceRequest } from '@/lib/portal-types'

type Props = {
  open: boolean
  onClose: () => void
  onCreated: (request: PortalServiceRequest) => void
}

export function ClientRequestModal({ open, onClose, onCreated }: Props) {
  if (!open) return null

  return (
    <Modal title="Start a request" onClose={onClose}>
      <ServiceRequestForm
        variant="modal"
        onCreated={(row) => {
          onCreated(row)
        }}
        onSuccess={() => {
          setTimeout(onClose, 900)
        }}
      />
    </Modal>
  )
}
