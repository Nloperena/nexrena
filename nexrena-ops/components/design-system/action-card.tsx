import type { ReactNode } from 'react'
import { Card } from '@/components/design-system/card'
import { typography, touch } from '@/lib/design-tokens'

type Props = {
  icon: ReactNode
  title: string
  subtitle?: string
  primary?: boolean
  onClick: () => void
}

export function ActionCard({ icon, title, subtitle, primary, onClick }: Props) {
  return (
    <Card
      variant="client"
      onClick={onClick}
      className={`text-left w-full ${primary ? 'border-gold/40 ring-1 ring-gold/15' : ''}`}
    >
      <div className={`flex items-start gap-4 ${touch.min}`}>
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${primary ? 'bg-gold/20 text-gold-light' : 'bg-slate-800/80 text-slate-200'}`}>
          {icon}
        </span>
        <div className="min-w-0">
          <p className={`${typography.sectionTitle} text-base sm:text-lg`}>{title}</p>
          {subtitle && <p className={`${typography.hint} mt-1`}>{subtitle}</p>}
        </div>
      </div>
    </Card>
  )
}
