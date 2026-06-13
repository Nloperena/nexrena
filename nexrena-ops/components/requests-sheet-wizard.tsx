'use client'

import { Sheet, SheetContent } from '@/components/ui/sheet'
import { ServiceRequestForm } from '@/components/service-request-form'
import type { PortalServiceRequest } from '@/lib/portal-types'

type Props = {
  open: boolean
  onClose: () => void
  onCreated: (request: PortalServiceRequest) => void
}

export function RequestsSheetWizard({ open, onClose, onCreated }: Props) {
  return (
    <Sheet open={open} onOpenChange={(next) => { if (!next) onClose() }}>
      <SheetContent title="New request" description="Step through the wizard to send your request." onClose={onClose} wide>
        <ServiceRequestForm
          embedded
          onCreated={onCreated}
          onSuccess={() => {
            setTimeout(onClose, 900)
          }}
        />
      </SheetContent>
    </Sheet>
  )
}
