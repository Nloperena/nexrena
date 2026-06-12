import type { ReactNode } from 'react'
import { Button } from '@/components/design-system/button'
import { typography } from '@/lib/design-tokens'

type Props = {
  icon?: ReactNode
  title: string
  message?: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: Props) {
  return (
    <div className="py-12 px-4 text-center animate-fade-in">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold/20 bg-gold/10">
        {icon ?? <span className="text-gold text-xl" aria-hidden>◇</span>}
      </div>
      <p className={`${typography.sectionTitle} mb-2`}>{title}</p>
      {message && <p className={`${typography.hint} max-w-sm mx-auto`}>{message}</p>}
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button onClick={onAction}>{actionLabel}</Button>
        </div>
      )}
    </div>
  )
}
