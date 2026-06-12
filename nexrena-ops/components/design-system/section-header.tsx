import type { ReactNode } from 'react'
import { typography } from '@/lib/design-tokens'

type Props = {
  title: string
  hint?: string
  action?: ReactNode
  compact?: boolean
}

export function SectionHeader({ title, hint, action, compact }: Props) {
  return (
    <div className={`flex items-start justify-between gap-3 ${compact ? 'mb-4' : 'mb-5'}`}>
      <div className="min-w-0">
        <h2 className={typography.sectionTitle}>{title}</h2>
        {hint && <p className={`${typography.hint} mt-1`}>{hint}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
