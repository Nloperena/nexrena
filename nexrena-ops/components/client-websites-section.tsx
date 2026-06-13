'use client'

import { useEffect, useMemo, useState } from 'react'
import type { PortalResource } from '@/lib/client-resource-utils'
import {
  isEmbeddableResource,
  resourceActionLabel,
  resourceBrowseUrl,
  resourceDisplayDomain,
} from '@/lib/client-resource-utils'
import { WebsiteMediaBrowser } from '@/components/website-media-browser'
import {
  WebsiteExpandedPreview,
  WebsiteSitePreviewCard,
  type PreviewViewport,
} from '@/components/website-site-preview'
import { Btn } from '@/components/ui'
import { portalFocusRing, portalSectionHintClass, portalMutedClass } from '@/lib/portal-a11y'

const cardBody = 'px-5 py-5 bg-slate-900/80'

type SiteFilter = 'all' | string

type Props = {
  resources: PortalResource[]
}

function SiteSelector({
  resources,
  value,
  onChange,
}: {
  resources: PortalResource[]
  value: SiteFilter
  onChange: (value: SiteFilter) => void
}) {
  if (resources.length <= 1) return null

  return (
    <div
      className="flex flex-wrap gap-2"
      role="tablist"
      aria-label="Select website"
    >
      <button
        type="button"
        role="tab"
        aria-selected={value === 'all'}
        onClick={() => onChange('all')}
        className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors border ${portalFocusRing} ${
          value === 'all'
            ? 'bg-gold/15 text-gold border-gold/40'
            : 'text-slate-400 border-slate-700/60 hover:text-white hover:border-slate-600'
        }`}
      >
        All sites
      </button>
      {resources.map((resource) => (
        <button
          key={resource.id}
          type="button"
          role="tab"
          aria-selected={value === resource.id}
          onClick={() => onChange(resource.id)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors border max-w-full truncate ${portalFocusRing} ${
            value === resource.id
              ? 'bg-gold/15 text-gold border-gold/40'
              : 'text-slate-400 border-slate-700/60 hover:text-white hover:border-slate-600'
          }`}
        >
          {resource.title}
          <span className="hidden sm:inline text-slate-500 font-normal">
            {' '}· {resourceDisplayDomain(resource.url)}
          </span>
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

  const [siteFilter, setSiteFilter] = useState<SiteFilter>(
    embeddable.length > 1 ? 'all' : embeddable[0]?.id ?? 'all',
  )
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [expandedViewport, setExpandedViewport] = useState<PreviewViewport>('desktop')

  const visibleEmbeddable = useMemo(() => {
    if (siteFilter === 'all') return embeddable
    return embeddable.filter((r) => r.id === siteFilter)
  }, [embeddable, siteFilter])

  const expanded = embeddable.find((r) => r.id === expandedId) ?? null

  useEffect(() => {
    if (!expandedId) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpandedId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
      <div className="space-y-10 pt-2">
        <div className="space-y-4">
          <p className={portalSectionHintClass}>
            Your live sites appear below in desktop monitor view. Switch between sites, expand for
            full-screen preview, or browse and upload site media.
          </p>
          {embeddable.length > 0 && (
            <SiteSelector
              resources={embeddable}
              value={siteFilter}
              onChange={setSiteFilter}
            />
          )}
        </div>

        {visibleEmbeddable.length > 0 && (
          <section className="space-y-6">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500">
              {siteFilter === 'all' && embeddable.length > 1
                ? `${embeddable.length} websites`
                : 'Website preview'}
            </h3>
            <ul className="flex flex-col gap-8 max-w-4xl">
              {visibleEmbeddable.map((resource) => (
                <WebsiteSitePreviewCard
                  key={resource.id}
                  resource={resource}
                  onExpand={() => {
                    setExpandedId(resource.id)
                    setExpandedViewport('desktop')
                  }}
                />
              ))}
            </ul>
          </section>
        )}

        {other.length > 0 && (
          <section className="space-y-4">
            <h3 className="text-[10px] uppercase tracking-widest text-slate-500">Other links</h3>
            <ul className="space-y-4 max-w-4xl">
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
          </section>
        )}

        <section className="pt-6 border-t border-slate-800/60">
          <WebsiteMediaBrowser variant="portal" embedded showTitle />
        </section>
      </div>

      {expanded && (
        <WebsiteExpandedPreview
          resource={expanded}
          viewport={expandedViewport}
          onViewportChange={setExpandedViewport}
          onClose={() => setExpandedId(null)}
        />
      )}
    </>
  )
}
