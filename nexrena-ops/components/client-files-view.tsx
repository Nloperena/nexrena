'use client'

import { PortalAssetsManager } from '@/components/portal-assets-manager'
import { SectionHeader } from '@/components/design-system'

export function ClientFilesView() {
  return (
    <section className="space-y-8 md:space-y-10">
      <div>
        <SectionHeader
          title="Your uploads"
          hint="Logos, documents, and anything you share with the Nexrena team — separate from your live site media (see Website tab)"
        />
        <PortalAssetsManager />
      </div>
    </section>
  )
}
