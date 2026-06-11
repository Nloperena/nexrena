'use client'

import { useMemo, useState } from 'react'
import { useContacts, usePortalAssets, formatDate } from '@/lib/store'
import { categoryLabel, formatFileBytes, isImageAsset } from '@/lib/portal-file-utils'
import { PageHeader, SectionCard, EmptyState, selectCls } from '@/components/ui'

export default function ClientFilesPage() {
  const { contacts } = useContacts()
  const [contactFilter, setContactFilter] = useState('')
  const { assets } = usePortalAssets(contactFilter || undefined)

  const sortedContacts = useMemo(
    () => [...contacts].sort((a, b) => (a.company || a.name).localeCompare(b.company || b.name)),
    [contacts],
  )

  return (
    <div>
      <PageHeader
        title="Business assets"
        sub={`${assets.length} client uploads — logos, photos, documents, and more`}
      />

      <div className="mb-6 max-w-xs">
        <label className="block text-[10px] text-slate-400 tracking-[0.15em] uppercase mb-2 font-medium">
          Filter by client
        </label>
        <select
          className={selectCls}
          value={contactFilter}
          onChange={(e) => setContactFilter(e.target.value)}
        >
          <option value="">All clients</option>
          {sortedContacts.map((c) => (
            <option key={c.id} value={c.id}>
              {c.company || c.name}
            </option>
          ))}
        </select>
      </div>

      <SectionCard>
        <table className="nx-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>File</th>
              <th>Category</th>
              <th>Note</th>
              <th>Size</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.id}>
                <td>
                  <p className="text-white font-medium">{asset.contactName ?? 'Unknown'}</p>
                  <p className="text-xs text-slate-500">{asset.contactCompany || asset.contactEmail}</p>
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    {isImageAsset(asset) ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={asset.blobUrl}
                        alt=""
                        className="w-10 h-10 rounded object-cover bg-slate-800"
                      />
                    ) : (
                      <span className="w-10 h-10 rounded bg-slate-800/60 flex items-center justify-center text-slate-500">📄</span>
                    )}
                    <span className="text-sm text-white truncate max-w-[200px]">{asset.filename}</span>
                  </div>
                </td>
                <td className="text-slate-400 text-sm">{categoryLabel(asset.category) ?? '—'}</td>
                <td className="text-slate-400 text-sm max-w-[180px] truncate">{asset.note || '—'}</td>
                <td className="text-slate-400 text-xs tabular-nums">{formatFileBytes(asset.sizeBytes)}</td>
                <td className="text-slate-400 text-xs">{formatDate(asset.createdAt)}</td>
                <td>
                  <a
                    href={asset.blobUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-gold hover:underline"
                  >
                    Open
                  </a>
                </td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan={7}>
                  <EmptyState message="No client uploads yet. Files appear here when clients use Upload files in the portal." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </SectionCard>
    </div>
  )
}
