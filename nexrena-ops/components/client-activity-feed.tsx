'use client'

import type { PortalActivityItem } from '@/lib/activity-utils'
import { Card, SectionHeader, ActivityItem } from '@/components/design-system'
import { typography } from '@/lib/design-tokens'

type Props = {
  items: PortalActivityItem[]
  compact?: boolean
}

export function ClientActivityFeed({ items, compact = false }: Props) {
  const list = items.slice(0, compact ? 6 : 6)

  if (compact) {
    if (list.length === 0) {
      return <p className="text-sm text-slate-500">Nothing here yet.</p>
    }
    return (
      <ul>
        {list.map((item, index) => (
          <ActivityItem
            key={item.id}
            date={item.date}
            label={item.label}
            chip={item.chip}
            isLast={index === list.length - 1}
          />
        ))}
      </ul>
    )
  }

  return (
    <section>
      <SectionHeader title="Recent activity" hint="Updates from your account" compact />
      <Card variant="client">
        {list.length === 0 ? (
          <p className={typography.hint}>
            Nothing here yet — invoices, messages, and project updates will appear as they happen.
          </p>
        ) : (
          <ul>
            {list.map((item, index) => (
              <ActivityItem
                key={item.id}
                date={item.date}
                label={item.label}
                chip={item.chip}
                isLast={index === list.length - 1}
              />
            ))}
          </ul>
        )}
      </Card>
    </section>
  )
}
