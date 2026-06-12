'use client'

import { PortalAssetsManager } from '@/components/portal-assets-manager'
import { WebsiteMediaBrowser } from '@/components/website-media-browser'
import { SectionHeader } from '@/components/design-system'

export function ClientFilesView() {
  return (
    <section className="space-y-8 md:space-y-10">
      <div>
        <SectionHeader
          title="Business assets"
          hint="Your brand files, site media, and shared deliverables"
        />
        <WebsiteMediaBrowser variant="portal" />
      </div>

      <div className="space-y-4 pt-6 border-t border-slate-800/60">
        <SectionHeader
          title="Your uploads"
          hint="Logos, documents, and anything you share with the Nexrena team"
          compact
        />
        <PortalAssetsManager />
      </div>
    </section>
  )
}
