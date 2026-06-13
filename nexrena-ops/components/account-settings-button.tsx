'use client'

import { portalFocusRing } from '@/lib/portal-a11y'
import { IconSettings } from '@/components/client-nav-icons'

type Props = {
  active?: boolean
  onClick: () => void
  className?: string
  size?: 'sm' | 'md'
}

export function AccountSettingsButton({ active = false, onClick, className = '', size = 'md' }: Props) {
  const dim = size === 'sm' ? 'h-10 w-10' : 'h-11 w-11'
  const icon = size === 'sm' ? 'w-5 h-5' : 'w-5 h-5'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Account settings"
      aria-current={active ? 'page' : undefined}
      title="Account settings"
      className={`flex shrink-0 items-center justify-center rounded-xl border transition-colors ${portalFocusRing} ${dim} ${
        active
          ? 'border-gold/45 bg-gold/15 text-gold-light'
          : 'border-slate-600/80 bg-slate-800/40 text-slate-300 hover:border-slate-500 hover:bg-slate-800/60 hover:text-white'
      } ${className}`}
    >
      <IconSettings className={icon} />
    </button>
  )
}
