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
import { portalSectionHintClass, portalMutedClass } from '@/lib/portal-a11y'

const cardBody = 'px-5 py-5 bg-slate-900/80'

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

function LiveSitePreview({
  resource,
  viewport,
  expanded = false,
}: {
  resource: PortalResource
  viewport: PreviewViewport
  expanded?: boolean
}) {
  const embedUrl = resourceEmbedUrl(resource.url)
  const heightClass = expanded
    ? 'h-full min-h-0'
    : viewport === 'mobile'
      ? 'h-[520px]'
      : 'h-[min(420px,55vh)]'

  return (
    <div
      className={`flex items-center justify-center bg-slate-950/80 ${
        expanded ? 'flex-1 min-h-0 p-4 md:p-6' : 'p-3 md:p-4 border-b border-slate-800/60'
      }`}
    >
      <div
        className={
          viewport === 'mobile'
            ? `w-full max-w-[390px] ${heightClass} rounded-[1.75rem] border-[8px] border-slate-800 bg-slate-900 shadow-xl overflow-hidden ring-1 ring-white/5`
            : `w-full ${heightClass} rounded-xl border border-slate-700/60 overflow-hidden bg-white shadow-inner`
        }
      >
        <iframe
          key={`${resource.id}-${viewport}-${expanded}`}
          src={embedUrl}
          title={`Live preview of ${resource.title}`}
          className="w-full h-full border-0 bg-white"
          loading="lazy"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>
  )
}

function EmbeddableSiteCard({
  resource,
  onExpand,
}: {
  resource: PortalResource
  onExpand: () => void
}) {
  const [viewport, setViewport] = useState<PreviewViewport>('desktop')
  const domain = resourceDisplayDomain(resource.url)

  return (
    <li className="overflow-hidden rounded-2xl border-2 border-slate-600/80 bg-[#0e1218] flex flex-col">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-800/60 bg-slate-900/50 shrink-0">
        <div className="min-w-0 flex-1">
          <p className="font-serif text-lg text-white truncate">{resource.title}</p>
          <p className="text-sm text-gold-light/90 truncate">{domain}</p>
        </div>
        <ViewportToggle value={viewport} onChange={setViewport} />
      </div>

      <LiveSitePreview resource={resource} viewport={viewport} />

      <div className={cardBody}>
        {resource.description && (
          <p className={`${portalMutedClass} mb-4`}>{resource.description}</p>
        )}
        <div className="flex flex-wrap gap-3">
          <Btn size="lg" variant="ghost" onClick={onExpand}>
            Expand preview
          </Btn>
          <Btn
            size="lg"
            variant="ghost"
            onClick={() =>
              window.open(
                resourceBrowseUrl(resource.url, resource.type),
                '_blank',
                'noopener,noreferrer',
              )
            }
          >
            {resourceActionLabel(resource.type, resource.url)} ↗
          </Btn>
        </div>
        <p className="mt-3 text-[11px] text-slate-600">
          Live embed — if the preview is blank, the site may block embedding. Use open in new tab.
        </p>
      </div>
    </li>
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

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedViewport, setExpandedViewport] = useState<PreviewViewport>('desktop')
  const expanded = embeddable.find((r) => r.id === expandedId) ?? null

  useEffect(() => {
    if (!expandedId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expandedId])

  useEffect(() => {
    document.body.style.overflow = expandedId ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [expandedId])

  if (resources.length === 0) {
    return (
      <p className={portalMutedClass}>
        No websites linked to your account yet. Your Nexrena sites will appear here with live previews.
      </p>
    )
  }

  return (
    <>
      <div className="space-y-8 pt-2">
        <p className={portalSectionHintClass}>
          Your live sites are embedded below — switch desktop or mobile view on each card, or expand
          for a full-screen preview.
        </p>

        {embeddable.length > 0 && (
          <ul className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {embeddable.map((resource) => (
              <EmbeddableSiteCard
                key={resource.id}
                resource={resource}
                onExpand={() => {
                  setExpandedId(resource.id)
                  setExpandedViewport('desktop')
                }}
              />
            ))}
          </ul>
        )}

        {other.length > 0 && (
          <ul className="space-y-4">
            {other.map((resource) => (
              <li key={resource.id} className="overflow-hidden rounded-2xl border-2 border-slate-600/80">
                <div className={cardBody}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-xl text-white">{resource.title}</p>
                      {resource.description && (
                        <p className={`${portalMutedClass} mt-2`}>{resource.description}</p>
                      )}
                    </div>
                    <Btn
                      size="lg"
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
            ))}
          </ul>
        )}
      </div>

      {expanded && (
        <div
          className="fixed inset-0 md:left-[4.5rem] z-[70] flex flex-col bg-[#111418]"
          role="dialog"
          aria-modal="true"
          aria-label={`Expanded preview ${expanded.title}`}
        >
          <div className="flex flex-wrap items-center gap-3 border-b border-slate-800/60 bg-[#111418]/95 backdrop-blur-md px-4 py-3 shrink-0">
            <Btn type="button" size="sm" variant="ghost" onClick={() => setExpandedId(null)}>
              ← Close
            </Btn>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{expanded.title}</p>
              <p className="text-xs text-slate-500 truncate">
                {resourceDisplayDomain(expanded.url)}
              </p>
            </div>
            <ViewportToggle value={expandedViewport} onChange={setExpandedViewport} />
            <Btn
              type="button"
              size="sm"
              variant="ghost"
              onClick={() =>
                window.open(
                  resourceBrowseUrl(expanded.url, expanded.type),
                  '_blank',
                  'noopener,noreferrer',
                )
              }
            >
              Open in new tab ↗
            </Btn>
          </div>

          <LiveSitePreview resource={expanded} viewport={expandedViewport} expanded />

          <p className="shrink-0 px-4 py-2 text-[11px] text-slate-600 border-t border-slate-800/40 text-center">
            Press Esc to close · Toggle desktop or mobile · Open in new tab if preview is blank
          </p>
        </div>
      )}
    </>
  )
}
