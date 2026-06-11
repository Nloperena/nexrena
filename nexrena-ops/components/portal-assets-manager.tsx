'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Btn } from '@/components/ui'
import { PortalFolderSidebar } from '@/components/portal-folder-sidebar'
import { PortalFolderBreadcrumb } from '@/components/portal-folder-breadcrumb'
import { PortalFileList } from '@/components/portal-file-list'
import { UploadFilesModal } from '@/components/upload-files-modal'
import {
  createPortalFolder,
  deletePortalFolder,
  fetchPortalAssets,
  fetchPortalFolders,
  movePortalAsset,
  renamePortalFolder,
} from '@/lib/portal-client'
import type { PortalAsset, PortalFolder } from '@/lib/portal-types'

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

export function PortalAssetsManager() {
  const [folders, setFolders] = useState<PortalFolder[]>([])
  const [assets, setAssets] = useState<PortalAsset[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [movingId, setMovingId] = useState<string | null>(null)
  const [uploadOpen, setUploadOpen] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const folderRows = await fetchPortalFolders()
      const assetRows = await fetchPortalAssets(
        currentFolderId === null ? undefined : currentFolderId,
      )
      setFolders(folderRows)
      setAssets(assetRows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not load files.')
    } finally {
      setLoading(false)
    }
  }, [currentFolderId])

  useEffect(() => { load() }, [load])

  const folderOptions = useMemo(
    () => [{ id: '', label: 'Root (no folder)' }, ...folders.map((f) => ({ id: f.id, label: f.name }))],
    [folders],
  )

  const handleMove = async (assetId: string, folderId: string | null) => {
    setMovingId(assetId)
    try {
      const updated = await movePortalAsset(assetId, folderId)
      setAssets((prev) => prev.filter((a) => {
        if (currentFolderId === null) return true
        return a.id === assetId ? updated.folderId === currentFolderId : a.folderId === currentFolderId
      }).map((a) => (a.id === assetId ? updated : a)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not move file.')
    } finally {
      setMovingId(null)
    }
  }

  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm text-slate-400">
        Organize logos, photos, copy, and documents in folders — upload or download anytime.
      </p>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <PortalFolderBreadcrumb
          folders={folders}
          currentFolderId={currentFolderId}
          onSelect={setCurrentFolderId}
        />
        <Btn size="sm" onClick={() => setUploadOpen(true)}>Upload here</Btn>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <PortalFolderSidebar
          folders={folders}
          currentFolderId={currentFolderId}
          onSelect={setCurrentFolderId}
          onCreate={async (name, parentId) => {
            await createPortalFolder(name, parentId)
            await load()
          }}
          onRename={async (id, name) => {
            await renamePortalFolder(id, name)
            await load()
          }}
          onDelete={async (id) => {
            await deletePortalFolder(id)
            if (currentFolderId === id) setCurrentFolderId(null)
            await load()
          }}
        />

        <div className={`${card} flex-1 min-w-0`}>
          {error && <p className="text-sm text-red-400 mb-3">{error}</p>}
          {loading ? (
            <p className="text-sm text-slate-500 animate-pulse">Loading…</p>
          ) : (
            <PortalFileList
              assets={assets}
              emptyMessage="No files in this location yet."
              renderActions={(asset) => (
                <select
                  className="text-xs bg-slate-900 border border-slate-700 rounded px-2 py-1 text-slate-300 max-w-[120px]"
                  value={asset.folderId ?? ''}
                  disabled={movingId === asset.id}
                  onChange={(e) => handleMove(asset.id, e.target.value || null)}
                  aria-label="Move to folder"
                >
                  {folderOptions.map((opt) => (
                    <option key={opt.id || 'root'} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              )}
            />
          )}
        </div>
      </div>

      {uploadOpen && (
        <UploadFilesModal
          open={uploadOpen}
          folderId={currentFolderId}
          onClose={() => setUploadOpen(false)}
          onUploaded={(asset) => {
            if (currentFolderId === null || asset.folderId === currentFolderId) {
              setAssets((prev) => [asset, ...prev])
            }
          }}
        />
      )}
    </div>
  )
}
