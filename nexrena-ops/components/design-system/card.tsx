import type { ReactNode } from 'react'
import { spacing, surfaces, motion } from '@/lib/design-tokens'

type Props = {
  children: ReactNode
  className?: string
  variant?: 'client' | 'team'
  padding?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', variant = 'team', padding = true, onClick }: Props) {
  const surface = variant === 'client' ? surfaces.cardClient : surfaces.card
  const pad = padding ? spacing.cardPad : ''
  const interactive = onClick
    ? `cursor-pointer ${motion.press} hover:border-gold/25`
    : ''

  const Tag = onClick ? 'button' : 'div'

  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`${surface} ${pad} ${interactive} overflow-hidden ${className}`}
    >
      {children}
    </Tag>
  )
}
