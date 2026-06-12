import type { ReactNode } from 'react'
import { typography, surfaces } from '@/lib/design-tokens'

type Props = {
  title: string
  subtitle?: string
  badge?: ReactNode
  action?: ReactNode
  compact?: boolean
}

export function MobileHeader({ title, subtitle, badge, action, compact }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-700/40 bg-[#111418]/92 backdrop-blur-md">
      <div className={`flex items-center justify-between gap-3 px-4 ${compact ? 'py-3' : 'py-3.5'} md:px-8 md:py-4`}>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gold/70 md:hidden">Nexrena</p>
          <div className="flex items-center gap-2 min-w-0">
            <h1 className={`${typography.pageTitle} truncate`}>{title}</h1>
            {badge}
          </div>
          {subtitle && (
            <p className={`${typography.hint} mt-0.5 truncate hidden sm:block`}>{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </header>
  )
}

type ShellProps = {
  children: ReactNode
  variant?: 'client' | 'team'
  className?: string
}

export function PageShell({ children, variant = 'team', className = '' }: ShellProps) {
  const portalClass = variant === 'client' ? 'client-portal' : 'team-ops'
  return (
    <div className={`${portalClass} min-h-screen overflow-x-hidden ${surfaces.page} ${className}`}>
      {children}
    </div>
  )
}
