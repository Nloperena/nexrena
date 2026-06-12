'use client'

import { useMemo, useState } from 'react'
import { useContacts, usePortalAssets, formatDate } from '@/lib/store'
import { categoryLabel, formatFileBytes, isImageAsset } from '@/lib/portal-file-utils'
import { SignedAssetLink, SignedAssetThumb } from '@/components/signed-asset-thumb'
import { WebsiteMediaBrowser } from '@/components/website-media-browser'
import { PageHeader, SectionCard, EmptyState, selectCls } from '@/components/ui'
import { Card } from '@/components/design-system'
import type { PortalFolderRecord } from '@/lib/types'

function folderPath(folders: PortalFolderRecord[], folderId: string | null): string {
  if (!folderId) return 'Root'
  const chain: string[] = []
  let cursor = folders.find((f) => f.id === folderId) ?? null
  while (cursor) {
    chain.unshift(cursor.name)
    cursor = cursor.parentId ? folders.find((f) => f.id === cursor!.parentId) ?? null : null
  }
  return chain.join(' / ') || 'Root'
}

const WEBSITE_MEDIA_CONTACTS = new Set([
  'joe-loperena-furniture-packages',
  'warren-daughtridge-ttag',
])

export default function ClientFilesPage() {
  const { contacts } = useContacts()
  const [contactFilter, setContactFilter] = useState('')
  const { assets, folders } = usePortalAssets(contactFilter || undefined)

  const sortedContacts = useMemo(
    () => [...contacts].sort((a, b) => (a.company || a.name).localeCompare(b.company || b.name)),
    [contacts],
  )

  const websiteMediaContactId =
    contactFilter && WEBSITE_MEDIA_CONTACTS.has(contactFilter) ? contactFilter : ''

  const clientFolders = useMemo(
    () => folders.filter((f) => !contactFilter || f.contactId === contactFilter),
    [folders, contactFilter],
  )

  return (
    <div className="w-full min-w-0 overflow-x-hidden">
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

      <SectionCard className="mb-6">
        <WebsiteMediaBrowser variant="ops" contactId={websiteMediaContactId} />
      </SectionCard>

      {clientFolders.length > 0 && (
        <SectionCard>
          <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Folder structure</p>
          <ul className="text-sm text-slate-400 space-y-1 mb-2">
            {clientFolders.map((folder) => (
              <li key={folder.id}>
                <span className="text-white">{folder.contactCompany || folder.contactName}</span>
                {' · '}{folderPath(clientFolders, folder.id)}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      <SectionCard>
        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">Client uploads</p>

        <div className="lg:hidden space-y-3">
          {assets.length === 0 ? (
            <EmptyState message="No client uploads yet." />
          ) : (
            assets.map((asset) => (
              <Card key={asset.id} className="flex items-start gap-3">
                {isImageAsset(asset) ? (
                  <SignedAssetThumb
                    assetId={asset.id}
                    variant="ops"
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover bg-slate-800 shrink-0"
                  />
                ) : (
                  <span className="w-12 h-12 rounded-lg bg-slate-800/60 flex items-center justify-center text-xl shrink-0">📄</span>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-white font-medium truncate">{asset.filename}</p>
                  <p className="text-sm text-slate-400 truncate">{asset.contactName ?? 'Unknown'}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {formatFileBytes(asset.sizeBytes)} · {formatDate(asset.createdAt)}
                  </p>
                  <SignedAssetLink assetId={asset.id} variant="ops" className="inline-block mt-2 text-sm text-gold hover:underline">
                    Open file
                  </SignedAssetLink>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="hidden lg:block">
        <table className="nx-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Folder</th>
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
                <td className="text-slate-400 text-sm">
                  {folderPath(clientFolders.filter((f) => f.contactId === asset.contactId), asset.folderId ?? null)}
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    {isImageAsset(asset) ? (
                      <SignedAssetThumb
                        assetId={asset.id}
                        variant="ops"
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
                  <SignedAssetLink
                    assetId={asset.id}
                    variant="ops"
                    className="text-xs text-gold hover:underline"
                  >
                    Open
                  </SignedAssetLink>
                </td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <EmptyState message="No client uploads yet. Files appear here when clients use Upload files in the portal." />
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </SectionCard>
    </div>
  )
}
