'use client'

import { formatDate } from '@/lib/store'
import type { PortalActivityItem } from '@/lib/activity-utils'
import { StatusChip } from '@/components/status-chip'

type Props = {
  items: PortalActivityItem[]
}

export function ClientActivityFeed({ items }: Props) {
  return (
    <section>
      <h2 className="text-sm text-slate-400 mb-4 font-medium">Latest activity</h2>
      <div className="glass-panel rounded-xl border border-slate-800/60 p-5">
        {items.length === 0 ? (
          <p className="text-sm text-slate-500">No recent activity yet — your updates will show up here.</p>
        ) : (
          <ul className="space-y-0">
            {items.map((item, index) => (
              <li
                key={item.id}
                className={`relative flex gap-4 py-3 ${
                  index < items.length - 1 ? 'border-b border-slate-800/50' : ''
                }`}
              >
                <div className="flex flex-col items-center pt-1.5 shrink-0">
                  <span className="h-2 w-2 rounded-full bg-gold/80 ring-4 ring-gold/10" />
                  {index < items.length - 1 && (
                    <span className="mt-1 w-px flex-1 min-h-[1rem] bg-slate-800" />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm pb-1">
                  <span className="text-slate-500 tabular-nums shrink-0">{formatDate(item.date)}</span>
                  <span className="text-white flex-1 min-w-0">{item.label}</span>
                  {item.chip && <StatusChip variant={item.chip} />}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
