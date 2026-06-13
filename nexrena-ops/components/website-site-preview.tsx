'use client'

import { useState } from 'react'
import type { PortalResource } from '@/lib/client-resource-utils'
import {
  resourceActionLabel,
  resourceBrowseUrl,
  resourceDisplayDomain,
  resourceEmbedUrl,
} from '@/lib/client-resource-utils'
import { WebsitePreviewFrame } from '@/components/website-preview-frame'
import { Btn } from '@/components/ui'
import { portalFocusRing, portalMutedClass } from '@/lib/portal-a11y'

export type PreviewViewport = 'desktop' | 'mobile'

const cardBody = 'px-5 py-5 bg-slate-900/80'

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

  if (expanded) {
    const heightClass = 'h-full min-h-0'
    return (
      <div className="flex items-center justify-center bg-slate-950/80 flex-1 min-h-0 p-4 md:p-8">
        <div
          className={
            viewport === 'mobile'
              ? `w-full max-w-[390px] ${heightClass} rounded-[1.75rem] border-[8px] border-slate-800 bg-slate-900 shadow-xl overflow-hidden ring-1 ring-white/5`
              : `w-full max-w-none ${heightClass} rounded-xl border border-slate-700/60 overflow-hidden bg-slate-900 shadow-2xl ring-1 ring-white/5`
          }
        >
          {viewport === 'mobile' ? (
            <iframe
              key={`${resource.id}-mobile-expanded`}
              src={embedUrl}
              title={`Live preview of ${resource.title}`}
              className="w-full h-full border-0 bg-white"
              loading="lazy"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <WebsitePreviewFrame
              src={embedUrl}
              title={`Live preview of ${resource.title}`}
              iframeKey={`${resource.id}-desktop-expanded`}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="p-3 md:p-5 border-b border-slate-800/60 bg-slate-950/80">
      {viewport === 'mobile' ? (
        <div className="mx-auto w-full max-w-[390px] h-[520px] rounded-[1.75rem] border-[8px] border-slate-800 bg-slate-900 shadow-xl overflow-hidden ring-1 ring-white/5">
          <iframe
            key={`${resource.id}-mobile`}
            src={embedUrl}
            title={`Mobile preview of ${resource.title}`}
            className="w-full h-full border-0 bg-white"
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-downloads"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="w-full">
          <div className="relative rounded-xl border border-slate-700/60 bg-slate-900 shadow-2xl overflow-hidden ring-1 ring-white/5">
            <div className="h-8 bg-slate-800/90 border-b border-slate-700/60 flex items-center gap-1.5 px-4">
              <span className="w-3 h-3 rounded-full bg-slate-600" aria-hidden />
              <span className="w-3 h-3 rounded-full bg-slate-600" aria-hidden />
              <span className="w-3 h-3 rounded-full bg-slate-600" aria-hidden />
              <span className="ml-2 text-[11px] text-slate-500 truncate">
                {resourceDisplayDomain(resource.url)}
              </span>
              <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-600">
                XL · 1920×1080
              </span>
            </div>
            <WebsitePreviewFrame
              src={embedUrl}
              title={`Desktop preview of ${resource.title}`}
              iframeKey={`${resource.id}-desktop`}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export function WebsiteSitePreviewCard({
  resource,
  onExpand,
}: {
  resource: PortalResource
  onExpand: () => void
}) {
  const [viewport, setViewport] = useState<PreviewViewport>('desktop')
  const domain = resourceDisplayDomain(resource.url)
  const typeLabel = resource.type === 'staging' ? 'Preview' : 'Live'

  return (
    <li className="overflow-hidden rounded-2xl border-2 border-slate-600/80 bg-[#0e1218] flex flex-col">
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-slate-800/60 bg-slate-900/50 shrink-0">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-serif text-lg text-white truncate">{resource.title}</p>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-gold/10 text-gold border border-gold/20">
              {typeLabel}
            </span>
          </div>
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
          XL desktop monitor (1920×1080) · if blank, the site may block embedding — open in a new tab
        </p>
      </div>
    </li>
  )
}

export function WebsiteExpandedPreview({
  resource,
  viewport,
  onViewportChange,
  onClose,
}: {
  resource: PortalResource
  viewport: PreviewViewport
  onViewportChange: (value: PreviewViewport) => void
  onClose: () => void
}) {
  return (
    <div
      className="portal-immersive-overlay flex flex-col bg-[#111418]"
      role="dialog"
      aria-modal="true"
      aria-label={`Expanded preview ${resource.title}`}
    >
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-800/60 bg-[#111418]/95 backdrop-blur-md px-4 py-3 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className={`inline-flex items-center gap-2 rounded-xl border-2 border-slate-500 bg-slate-800/80 px-4 py-2.5 text-base font-medium text-white hover:border-gold/60 hover:bg-slate-700/80 ${portalFocusRing}`}
        >
          ← Close preview
        </button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white truncate">{resource.title}</p>
          <p className="text-xs text-slate-500 truncate">
            {resourceDisplayDomain(resource.url)}
          </p>
        </div>
        <ViewportToggle value={viewport} onChange={onViewportChange} />
        <Btn
          type="button"
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
          Open in new tab ↗
        </Btn>
      </div>

      <LiveSitePreview resource={resource} viewport={viewport} expanded />

      <p className="shrink-0 px-4 py-2 text-[11px] text-slate-600 border-t border-slate-800/40 text-center">
        Press Esc to close · Toggle desktop or mobile · Open in new tab if preview is blank
      </p>
    </div>
  )
}

export { ViewportToggle }
