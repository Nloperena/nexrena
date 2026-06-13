'use client'

import { PortalAssetsManager } from '@/components/portal-assets-manager'
import { WebsiteMediaBrowser } from '@/components/website-media-browser'
import { SectionHeader } from '@/components/design-system'

export function ClientFilesView() {
  return (
    <section className="space-y-8 md:space-y-10">
      <div>
        <SectionHeader
          title="Your uploads"
          hint="Logos, documents, and anything you share with the Nexrena team — not published to your live site"
        />
        <PortalAssetsManager />
      </div>

      <div className="pt-6 border-t border-slate-800/60">
        <WebsiteMediaBrowser variant="portal" embedded showTitle />
      </div>
    </section>
  )
}
