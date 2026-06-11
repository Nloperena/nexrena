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
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="text-slate-500 tabular-nums shrink-0">{formatDate(item.date)}</span>
                <span className="text-slate-300">—</span>
                <span className="text-white flex-1 min-w-0">{item.label}</span>
                {item.chip && <StatusChip variant={item.chip} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
