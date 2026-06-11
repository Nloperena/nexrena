'use client'

import type { PortalFolder } from '@/lib/portal-types'

type Props = {
  folders: PortalFolder[]
  currentFolderId: string | null
  onSelect: (folderId: string | null) => void
}

export function PortalFolderBreadcrumb({ folders, currentFolderId, onSelect }: Props) {
  if (!currentFolderId) return null

  const chain: PortalFolder[] = []
  let cursor = folders.find((f) => f.id === currentFolderId) ?? null
  while (cursor) {
    chain.unshift(cursor)
    cursor = cursor.parentId ? folders.find((f) => f.id === cursor!.parentId) ?? null : null
  }

  return (
    <nav className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
      <button type="button" className="hover:text-gold" onClick={() => onSelect(null)}>
        All files
      </button>
      {chain.map((folder) => (
        <span key={folder.id} className="flex items-center gap-1">
          <span>/</span>
          <button type="button" className="hover:text-gold" onClick={() => onSelect(folder.id)}>
            {folder.name}
          </button>
        </span>
      ))}
    </nav>
  )
}
