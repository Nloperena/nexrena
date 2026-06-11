'use client'

import { formatDate } from '@/lib/store'
import { categoryLabel, formatFileBytes, isImageAsset } from '@/lib/portal-file-utils'
import type { PortalAsset } from '@/lib/portal-types'
import type { ReactNode } from 'react'

type Props = {
  assets: PortalAsset[]
  emptyMessage?: string
  renderActions?: (asset: PortalAsset) => ReactNode
}

export function PortalFileList({ assets, emptyMessage = 'No files yet.', renderActions }: Props) {
  if (assets.length === 0) {
    return <p className="text-sm text-slate-500">{emptyMessage}</p>
  }

  return (
    <ul className="space-y-3">
      {assets.map((asset) => (
        <li
          key={asset.id}
          className="flex items-start gap-4 rounded-lg border border-slate-800/50 bg-slate-900/30 p-3"
        >
          <div className="w-12 h-12 shrink-0 rounded-md overflow-hidden bg-slate-800/60 flex items-center justify-center">
            {isImageAsset(asset) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={asset.blobUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg text-slate-500">📄</span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm text-white truncate">{asset.filename}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {formatFileBytes(asset.sizeBytes)} · {formatDate(asset.createdAt)}
              {categoryLabel(asset.category) ? ` · ${categoryLabel(asset.category)}` : ''}
            </p>
            {asset.note && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{asset.note}</p>}
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <a
              href={asset.blobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gold hover:underline pt-1"
            >
              Open
            </a>
            {renderActions?.(asset)}
          </div>
        </li>
      ))}
    </ul>
  )
}
