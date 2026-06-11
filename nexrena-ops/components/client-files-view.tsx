'use client'

import { PortalAssetsManager } from '@/components/portal-assets-manager'
import { portalSectionTitleClass } from '@/lib/portal-dashboard-utils'

export function ClientFilesView() {
  return (
    <section className="space-y-4">
      <div>
        <h2 className={portalSectionTitleClass}>Business assets</h2>
      </div>
      <PortalAssetsManager />
    </section>
  )
}
