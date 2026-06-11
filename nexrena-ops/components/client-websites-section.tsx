'use client'

import type { PortalResource } from '@/lib/client-resource-utils'
import { resourceActionLabel, resourceBrowseUrl } from '@/lib/client-resource-utils'
import { Btn } from '@/components/ui'

const card = 'glass-panel rounded-xl border border-slate-800/60 p-5'

type Props = {
  resources: PortalResource[]
}

export function ClientWebsitesSection({ resources }: Props) {
  if (resources.length === 0) return null

  return (
    <div className="space-y-4 pt-4">
      <p className="text-sm text-slate-400">
        Access your website code and live site links shared by Nexrena.
      </p>
      <ul className="space-y-3">
        {resources.map((resource) => (
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
                onClick={() => window.open(resourceBrowseUrl(resource.url, resource.type), '_blank', 'noopener,noreferrer')}
              >
                {resourceActionLabel(resource.type)}
              </Btn>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
