'use client'

import { ClientFormHistorySection } from '@/components/client-form-history-section'
import type { PortalFormSubmission } from '@/lib/portal-types'
import { portalSectionHintClass } from '@/lib/portal-a11y'

type Props = {
  submissions: PortalFormSubmission[]
}

export function ClientFormsView({ submissions }: Props) {
  return (
    <div className="space-y-6 pt-2">
      <p className={portalSectionHintClass}>
        Contact form leads from your website — names, emails, and messages from visitors.
      </p>
      <ClientFormHistorySection submissions={submissions} />
    </div>
  )
}
