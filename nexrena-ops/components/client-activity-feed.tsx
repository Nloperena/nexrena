'use client'



import type { PortalActivityItem } from '@/lib/activity-utils'

import { Card, SectionHeader, ActivityItem } from '@/components/design-system'

import { typography } from '@/lib/design-tokens'



type Props = {

  items: PortalActivityItem[]

}



export function ClientActivityFeed({ items }: Props) {

  return (

    <section>

      <SectionHeader title="Recent activity" hint="Updates from your account" compact />

      <Card variant="client">

        {items.length === 0 ? (

          <p className={typography.hint}>Nothing here yet — invoices, messages, and project updates will appear as they happen.</p>

        ) : (

          <ul>

            {items.slice(0, 6).map((item, index) => (

              <ActivityItem

                key={item.id}

                date={item.date}

                label={item.label}

                chip={item.chip}

                isLast={index === Math.min(items.length, 6) - 1}

              />

            ))}

          </ul>

        )}

      </Card>

    </section>

  )

}


