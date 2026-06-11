'use client'

import { useEffect, useMemo, useState } from 'react'
import type { PortalResource } from '@/lib/client-resource-utils'
import {
  isEmbeddableResource,
  resourceActionLabel,
  resourceBrowseUrl,
  resourceDisplayDomain,
  resourceEmbedUrl,
} from '@/lib/client-resource-utils'
import { Btn } from '@/components/ui'

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

type Props = {
  resources: PortalResource[]
}

export function ClientWebsitesSection({ resources }: Props) {
  const embeddable = useMemo(
    () => resources.filter((r) => isEmbeddableResource(r.type)),
    [resources],
  )
  const other = useMemo(
    () => resources.filter((r) => !isEmbeddableResource(r.type)),
    [resources],
  )

  const [previewId, setPreviewId] = useState<string | null>(null)
  const preview = embeddable.find((r) => r.id === previewId) ?? null

  useEffect(() => {
    if (!previewId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPreviewId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewId])

  useEffect(() => {
    document.body.style.overflow = previewId ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [previewId])

  if (resources.length === 0) return null

  return (
    <>
      <div className="space-y-4 pt-4">
        <p className="text-sm text-slate-400">
          Preview your live website here or open it in a new tab. Source repos and staging links are
          listed below when available.
        </p>

        {embeddable.length > 0 && (
          <ul className="space-y-3">
            {embeddable.map((resource) => {
              const domain = resourceDisplayDomain(resource.url)
              const isActive = previewId === resource.id
              return (
                <li key={resource.id} className={card}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-lg text-white">{resource.title}</p>
                      <p className="text-sm text-gold/90 mt-1">{domain}</p>
                      {resource.description && (
                        <p className="text-sm text-slate-400 mt-1">{resource.description}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 shrink-0">
                      <Btn size="sm" onClick={() => setPreviewId(resource.id)}>
                        {isActive ? 'Viewing' : 'Preview site'}
                      </Btn>
                      <Btn
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          window.open(
                            resourceBrowseUrl(resource.url, resource.type),
                            '_blank',
                            'noopener,noreferrer',
                          )
                        }
                      >
                        {resourceActionLabel(resource.type, resource.url)}
                      </Btn>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {other.length > 0 && (
          <ul className="space-y-3">
            {other.map((resource) => (
              <li key={resource.id} className={card}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-serif text-lg text-white">{resource.title}</p>
                    {resource.description && (
                      <p className="text-sm text-slate-400 mt-1">{resource.description}</p>
                    )}
                  </div>
                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      window.open(
                        resourceBrowseUrl(resource.url, resource.type),
                        '_blank',
                        'noopener,noreferrer',
                      )
                    }
                  >
                    {resourceActionLabel(resource.type, resource.url)}
                  </Btn>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {preview && (
        <div
          className="fixed inset-0 md:left-[220px] z-[70] flex flex-col bg-[#111418]"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${preview.title}`}
        >
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-800/60 bg-[#111418]/95 backdrop-blur-md px-4 py-3 shrink-0">
            <Btn type="button" size="sm" variant="ghost" onClick={() => setPreviewId(null)}>
              ← Back to websites
            </Btn>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{preview.title}</p>
              <p className="text-xs text-slate-500 truncate">
                {resourceDisplayDomain(preview.url)}
              </p>
            </div>
            <Btn
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                window.open(
                  resourceBrowseUrl(preview.url, preview.type),
                  '_blank',
                  'noopener,noreferrer',
                )
              }
            >
              Open in new tab ↗
            </Btn>
          </div>

          <iframe
            key={preview.id}
            src={resourceEmbedUrl(preview.url)}
            title={preview.title}
            className="flex-1 w-full min-h-0 border-0 bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
            referrerPolicy="no-referrer-when-downgrade"
          />

          <p className="shrink-0 px-4 py-2 text-[11px] text-slate-600 border-t border-slate-800/40 text-center">
            Press Esc or use Back to return to your portal. Some pages may not embed — use Open in
            new tab if the preview is blank.
          </p>
        </div>
      )}
    </>
  )
}
