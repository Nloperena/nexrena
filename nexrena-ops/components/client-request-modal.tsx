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
    <Modal title="Start a New Request" onClose={onClose} wide>
      <p className="text-sm text-slate-400 mb-5">
        Tell us about your next website update, landing page, SEO sprint, or maintenance need.
      </p>
      <ServiceRequestForm
        onCreated={(row) => {
          onCreated(row)
        }}
        onSuccess={() => {
          setTimeout(onClose, 1200)
        }}
      />
    </Modal>
  )
}
