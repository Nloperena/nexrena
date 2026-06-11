'use client'

import { useMemo } from 'react'
import type { PortalFolder } from '@/lib/portal-types'

type Props = {
  folders: PortalFolder[]
  currentFolderId: string | null
  onSelect: (folderId: string | null) => void
  onCreate: (name: string, parentId: string | null) => Promise<void>
  onRename: (id: string, name: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function PortalFolderSidebar({
  folders,
  currentFolderId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
}: Props) {
  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, PortalFolder[]>()
    for (const folder of folders) {
      const key = folder.parentId
      const list = map.get(key) ?? []
      list.push(folder)
      map.set(key, list)
    }
    for (const list of Array.from(map.values())) {
      list.sort((a, b) => a.name.localeCompare(b.name))
    }
    return map
  }, [folders])

  const promptName = (label: string, initial = '') => {
    const value = window.prompt(label, initial)?.trim()
    return value || null
  }

  const renderTree = (parentId: string | null, depth = 0) => {
    const items = childrenByParent.get(parentId) ?? []
    return items.map((folder) => (
      <div key={folder.id}>
        <div
          className={`group flex items-center gap-1 rounded-md pr-1 ${
            currentFolderId === folder.id ? 'bg-gold/15 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
          style={{ paddingLeft: `${8 + depth * 12}px` }}
        >
          <button
            type="button"
            className="flex-1 text-left py-1.5 text-sm truncate"
            onClick={() => onSelect(folder.id)}
          >
            📁 {folder.name}
          </button>
          <button
            type="button"
            title="Rename"
            className="opacity-0 group-hover:opacity-100 text-[10px] px-1 hover:text-gold"
            onClick={async () => {
              const name = promptName('Rename folder', folder.name)
              if (name) await onRename(folder.id, name)
            }}
          >
            ✎
          </button>
          <button
            type="button"
            title="Delete"
            className="opacity-0 group-hover:opacity-100 text-[10px] px-1 hover:text-red-400"
            onClick={async () => {
              if (window.confirm(`Delete folder "${folder.name}"? It must be empty.`)) {
                await onDelete(folder.id)
              }
            }}
          >
            ×
          </button>
        </div>
        {renderTree(folder.id, depth + 1)}
      </div>
    ))
  }

  return (
    <aside className="w-full md:w-52 shrink-0 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[10px] uppercase tracking-widest text-slate-500">Folders</p>
        <button
          type="button"
          className="text-[10px] text-gold hover:underline"
          onClick={async () => {
            const name = promptName('New folder name')
            if (name) await onCreate(name, currentFolderId)
          }}
        >
          + New
        </button>
      </div>
      <button
        type="button"
        className={`w-full text-left rounded-md px-2 py-1.5 text-sm ${
          currentFolderId === null ? 'bg-gold/15 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
        }`}
        onClick={() => onSelect(null)}
      >
        All files
      </button>
      {renderTree(null)}
    </aside>
  )
}
