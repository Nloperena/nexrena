import type { ReactNode } from 'react'
import { Card } from '@/components/design-system/card'
import { typography } from '@/lib/design-tokens'

type Props = {
  label: string
  value: string
  sub?: ReactNode
  gold?: boolean
  variant?: 'client' | 'team'
}

export function StatCard({ label, value, sub, gold, variant = 'team' }: Props) {
  return (
    <Card variant={variant} className={`relative ${gold ? 'border-gold/30' : ''}`}>
      {gold && (
        <div className="absolute top-0 right-0 h-20 w-20 rounded-bl-full bg-gradient-to-bl from-gold/10 to-transparent" />
      )}
      <p className={`${typography.label} text-slate-400 mb-2`}>{label}</p>
      <p className={`font-serif text-2xl sm:text-3xl font-semibold tracking-tight ${gold ? 'text-gold-light' : 'text-white'}`}>
        {value}
      </p>
      {sub && <p className={`${typography.hint} mt-2`}>{sub}</p>}
    </Card>
  )
}
