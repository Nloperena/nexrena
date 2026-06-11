'use client'

import { useEffect, useState } from 'react'
import { fetchPortalResources } from '@/lib/portal-client'
import {
  resourceBrowseUrl,
  resourceRepoFolderPath,
  type PortalResource,
} from '@/lib/client-resource-utils'

const card =
  'glass-panel rounded-xl border border-slate-800/60 p-4 hover:border-gold/30 transition-colors'

export function WebsiteSourceFolders() {
  const [sources, setSources] = useState<PortalResource[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPortalResources()
      .then((rows) => setSources(rows.filter((r) => r.type === 'github')))
      .catch(() => setSources([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <p className="text-sm text-slate-500 animate-pulse">Loading website source…</p>
    )
  }

  if (sources.length === 0) return null

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[10px] uppercase tracking-widest text-slate-500">Website source</h3>
        <p className="text-sm text-slate-400 mt-1">
          The repo folder your live site is built and deployed from.
        </p>
      </div>
      <ul className="space-y-2">
        {sources.map((resource) => {
          const folderPath = resourceRepoFolderPath(resource.url)
          return (
            <li key={resource.id}>
              <a
                href={resourceBrowseUrl(resource.url, resource.type)}
                target="_blank"
                rel="noopener noreferrer"
                className={`${card} flex items-start gap-4 group`}
              >
                <span
                  className="text-2xl shrink-0 leading-none mt-0.5"
                  aria-hidden
                >
                  📂
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-base text-white group-hover:text-gold transition-colors">
                    {resource.title}
                  </p>
                  {folderPath && (
                    <p className="font-mono text-sm text-gold/90 mt-1 break-all">{folderPath}</p>
                  )}
                  {resource.description && (
                    <p className="text-xs text-slate-500 mt-1">{resource.description}</p>
                  )}
                </div>
                <span className="text-xs text-slate-500 shrink-0 group-hover:text-gold transition-colors">
                  GitHub ↗
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
