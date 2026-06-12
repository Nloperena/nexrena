'use client'

import type { ReactNode } from 'react'
import { PageHeader } from '@/components/ui'

type Props = {
  title: string
  sub?: string
  action?: ReactNode
  children: ReactNode
}

/** Consistent mobile-first wrapper for team portal pages. */
export function TeamPageLayout({ title, sub, action, children }: Props) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-hidden">
      <PageHeader title={title} sub={sub} action={action} />
      <div className="space-y-6">{children}</div>
    </div>
  )
}
