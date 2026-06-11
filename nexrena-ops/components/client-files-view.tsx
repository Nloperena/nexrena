'use client'

import { Btn } from '@/components/ui'
import { portalSectionTitleClass } from '@/lib/portal-dashboard-utils'
import { PortalFileList } from '@/components/portal-file-list'
import type { PortalAsset } from '@/lib/portal-types'

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

type Props = {
  assets: PortalAsset[]
  onUpload: () => void
}

export function ClientFilesView({ assets, onUpload }: Props) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={portalSectionTitleClass}>Your files</h2>
          <p className="text-sm text-slate-400 mt-1">
            Everything you&apos;ve shared with us — logos, photos, documents, and more.
          </p>
        </div>
        <Btn size="sm" onClick={onUpload}>Upload files</Btn>
      </div>
      <div className={card}>
        <PortalFileList
          assets={assets}
          emptyMessage="No files yet. Upload logos, photos, copy, or PDFs whenever you're ready."
        />
      </div>
    </section>
  )
}
