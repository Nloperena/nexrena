'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  fetchOpsWebsiteMedia,
  fetchPortalWebsiteMedia,
} from '@/lib/portal-client'
import {
  portalCaptionClass,
  portalCardClass,
  portalMutedClass,
  portalSectionHintClass,
  portalSectionTitleClass,
} from '@/lib/portal-a11y'
import type { WebsiteMediaCatalog, WebsiteMediaFolder, WebsiteMediaItem } from '@/lib/website-media-types'

type Props = {
  variant?: 'portal' | 'ops'
  contactId?: string
  showTitle?: boolean
}

function MediaFolderSidebar({
  folders,
  currentFolderId,
  onSelect,
}: {
  folders: WebsiteMediaFolder[]
  currentFolderId: string | null
  onSelect: (folderId: string | null) => void
}) {
  const childrenByParent = useMemo(() => {
    const map = new Map<string | null, WebsiteMediaFolder[]>()
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

  const renderTree = (parentId: string | null, depth = 0) => {
    const items = childrenByParent.get(parentId) ?? []
    return items.map((folder) => (
      <div key={folder.id}>
        <button
          type="button"
          className={`w-full text-left rounded-md py-1.5 text-sm truncate ${
            currentFolderId === folder.id
              ? 'bg-gold/15 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
          }`}
          style={{ paddingLeft: `${8 + depth * 12}px`, paddingRight: '8px' }}
          onClick={() => onSelect(folder.id)}
        >
          📁 {folder.name}
          <span className="text-slate-500 ml-1">({folder.itemCount})</span>
        </button>
        {renderTree(folder.id, depth + 1)}
      </div>
    ))
  }

  return (
    <aside className="w-full md:w-56 shrink-0 space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-slate-500">Folders</p>
      <button
        type="button"
        className={`w-full text-left rounded-md px-2 py-1.5 text-sm ${
          currentFolderId === null
            ? 'bg-gold/15 text-white'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
        }`}
        onClick={() => onSelect(null)}
      >
        All media
      </button>
      {renderTree(null)}
    </aside>
  )
}

function MediaBreadcrumb({
  folders,
  currentFolderId,
  onSelect,
}: {
  folders: WebsiteMediaFolder[]
  currentFolderId: string | null
  onSelect: (folderId: string | null) => void
}) {
  if (!currentFolderId) return null

  const chain: WebsiteMediaFolder[] = []
  let cursor = folders.find((f) => f.id === currentFolderId) ?? null
  while (cursor) {
    chain.unshift(cursor)
    cursor = cursor.parentId ? folders.find((f) => f.id === cursor!.parentId) ?? null : null
  }

  return (
    <nav className={`flex flex-wrap items-center gap-1 ${portalCaptionClass}`}>
      <button type="button" className="hover:text-gold" onClick={() => onSelect(null)}>
        All media
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

function MediaGrid({ items }: { items: WebsiteMediaItem[] }) {
  if (items.length === 0) {
    return <p className={portalMutedClass}>No files in this folder.</p>
  }

  return (
    <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-panel rounded-lg border border-slate-800/60 overflow-hidden hover:border-gold/40 transition-colors group block"
          >
            <div className="aspect-square bg-slate-900/60 flex items-center justify-center overflow-hidden">
              {item.kind === 'video' ? (
                <span className="text-4xl text-gold" aria-hidden>
                  ▶
                </span>
              ) : item.kind === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.thumbUrl ?? item.url}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform"
                  loading="lazy"
                />
              ) : (
                <span className="text-3xl text-slate-500" aria-hidden>
                  📄
                </span>
              )}
            </div>
            <p className="px-2 py-2 text-xs text-slate-300 truncate group-hover:text-gold transition-colors">
              {item.name}
            </p>
          </a>
        </li>
      ))}
    </ul>
  )
}

export function WebsiteMediaBrowser({
  variant = 'portal',
  contactId,
  showTitle = true,
}: Props) {
  const [catalog, setCatalog] = useState<WebsiteMediaCatalog | null>(null)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data =
        variant === 'ops'
          ? await fetchOpsWebsiteMedia(contactId ?? '')
          : await fetchPortalWebsiteMedia()
      setCatalog(data)
      setCurrentFolderId(null)
    } catch (err) {
      setCatalog(null)
      setError(err instanceof Error ? err.message : 'Could not load website media.')
    } finally {
      setLoading(false)
    }
  }, [variant, contactId])

  useEffect(() => {
    if (variant === 'ops' && !contactId) {
      setCatalog(null)
      setLoading(false)
      return
    }
    load()
  }, [load, variant, contactId])

  const visibleItems = useMemo(() => {
    if (!catalog) return []
    if (currentFolderId === null) return catalog.items
    const childFolderIds = new Set<string>([currentFolderId])
    let added = true
    while (added) {
      added = false
      for (const folder of catalog.folders) {
        if (folder.parentId && childFolderIds.has(folder.parentId) && !childFolderIds.has(folder.id)) {
          childFolderIds.add(folder.id)
          added = true
        }
      }
    }
    return catalog.items.filter((item) => childFolderIds.has(item.folderId))
  }, [catalog, currentFolderId])

  if (variant === 'ops' && !contactId) {
    return (
      <p className={portalMutedClass}>
        Select a client above to browse their website media.
      </p>
    )
  }

  if (loading) {
    return <p className={`${portalMutedClass} animate-pulse`}>Loading website media…</p>
  }

  if (error) {
    return <p className="text-base text-red-300">{error}</p>
  }

  if (!catalog?.items.length) {
    return (
      <div className={portalCardClass}>
        {showTitle && (
          <>
            <h2 className={portalSectionTitleClass}>Your website media</h2>
            <p className={`${portalSectionHintClass} mb-4`}>
              Photos, logos, and videos from your live website appear here automatically.
            </p>
          </>
        )}
        <p className={portalMutedClass}>No website media found for this account yet.</p>
      </div>
    )
  }

  return (
    <div className={`${portalCardClass} space-y-4`}>
      {showTitle && (
        <div>
          <h2 className={portalSectionTitleClass}>Your website media</h2>
          <p className={portalSectionHintClass}>
            Photos, logos, and videos from{' '}
            {catalog.label ? (
              <span className="text-white">{catalog.label}</span>
            ) : (
              'your live website'
            )}{' '}
            — indexed automatically from{' '}
            {catalog.baseUrl ? (
              <a
                href={catalog.baseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:underline"
              >
                {catalog.baseUrl.replace(/^https?:\/\//, '')}
              </a>
            ) : (
              'your site'
            )}
            .
          </p>
          <p className={`${portalCaptionClass} mt-2`}>
            {catalog.items.length} files · updated {new Date(catalog.indexedAt).toLocaleString()}
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-5">
        <MediaFolderSidebar
          folders={catalog.folders}
          currentFolderId={currentFolderId}
          onSelect={setCurrentFolderId}
        />
        <div className="min-w-0 flex-1 space-y-3">
          <MediaBreadcrumb
            folders={catalog.folders}
            currentFolderId={currentFolderId}
            onSelect={setCurrentFolderId}
          />
          <MediaGrid items={visibleItems} />
        </div>
      </div>
    </div>
  )
}
