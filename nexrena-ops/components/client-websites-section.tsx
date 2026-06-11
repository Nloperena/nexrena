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

type PreviewViewport = 'desktop' | 'mobile'

type Props = {
  resources: PortalResource[]
}

function ViewportToggle({
  value,
  onChange,
}: {
  value: PreviewViewport
  onChange: (value: PreviewViewport) => void
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-slate-700/80 bg-slate-900/60 p-0.5"
      role="group"
      aria-label="Preview viewport"
    >
      {(['desktop', 'mobile'] as const).map((mode) => (
        <button
          key={mode}
          type="button"
          onClick={() => onChange(mode)}
          className={`px-3 py-1.5 text-[11px] uppercase tracking-wider rounded-md transition-colors ${
            value === mode
              ? 'bg-gold/15 text-gold'
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {mode}
        </button>
      ))}
    </div>
  )
}

export function ClientWebsitesSection({ resources }: Props) {
  const embeddable = useMemo(
    () => resources.filter((r) => isEmbeddableResource(r.type)),
    [resources],
  )
  const other = useMemo(
    () => resources.filter((r) => !isEmbeddableResource(r.type) && r.type !== 'github'),
    [resources],
  )

  const [previewId, setPreviewId] = useState<string | null>(null)
  const [viewport, setViewport] = useState<PreviewViewport>('desktop')
  const preview = embeddable.find((r) => r.id === previewId) ?? null

  const openPreview = (id: string) => {
    setPreviewId(id)
    setViewport('desktop')
  }

  const closePreview = () => {
    setPreviewId(null)
    setViewport('desktop')
  }

  useEffect(() => {
    if (!previewId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreview()
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
      <div className="space-y-8 pt-4">
        <div className="space-y-4">
            <p className="text-sm text-slate-400">
              Preview your live website here or open it in a new tab. Use desktop or mobile view when
              previewing.
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
                          <Btn size="sm" onClick={() => openPreview(resource.id)}>
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
      </div>

      {preview && (
        <div
          className="fixed inset-0 md:left-[220px] z-[70] flex flex-col bg-[#111418]"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${preview.title}`}
        >
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-800/60 bg-[#111418]/95 backdrop-blur-md px-4 py-3 shrink-0">
            <Btn type="button" size="sm" variant="ghost" onClick={closePreview}>
              ← Back to websites
            </Btn>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{preview.title}</p>
              <p className="text-xs text-slate-500 truncate">
                {resourceDisplayDomain(preview.url)}
              </p>
            </div>
            <ViewportToggle value={viewport} onChange={setViewport} />
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

          <div
            className={`flex-1 min-h-0 flex items-center justify-center ${
              viewport === 'mobile' ? 'bg-slate-950 p-4 md:p-8' : 'bg-white'
            }`}
          >
            <div
              className={
                viewport === 'mobile'
                  ? 'w-full max-w-[390px] h-full max-h-[min(844px,calc(100dvh-8rem))] rounded-[2rem] border-[10px] border-slate-800 bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-white/5'
                  : 'w-full h-full'
              }
            >
              <iframe
                key={`${preview.id}-${viewport}`}
                src={resourceEmbedUrl(preview.url)}
                title={preview.title}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>

          <p className="shrink-0 px-4 py-2 text-[11px] text-slate-600 border-t border-slate-800/40 text-center">
            Toggle desktop or mobile view · Press Esc or Back to return · Use Open in new tab if the
            preview is blank
          </p>
        </div>
      )}
    </>
  )
}
