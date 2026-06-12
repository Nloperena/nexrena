'use client'

import { formatThreadTime, getInitials } from '@/lib/message-chat-utils'
import { portalFocusRing } from '@/lib/portal-a11y'

type Props = {
  active: boolean
  title: string
  subtitle?: string | null
  preview?: string | null
  updatedAt: string
  unread?: number
  avatarLabel: string
  avatarClassName?: string
  onClick: () => void
  focusRing?: boolean
  size?: 'portal' | 'ops'
}

export function MessageThreadListItem({
  active,
  title,
  subtitle,
  preview,
  updatedAt,
  unread = 0,
  avatarLabel,
  avatarClassName = 'bg-gold/25 text-gold-light',
  onClick,
  focusRing = false,
  size = 'ops',
}: Props) {
  const initials = getInitials(avatarLabel)
  const isPortal = size === 'portal'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full text-left rounded-xl px-4 py-3 transition-colors ${
        isPortal ? 'min-h-[76px]' : 'min-h-[68px]'
      } ${focusRing ? portalFocusRing : 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50'} ${
        active ? 'bg-slate-800/80 border-2 border-gold/30' : 'hover:bg-slate-800/50 border-2 border-transparent'
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${
            isPortal ? 'h-12 w-12 text-lg' : 'h-11 w-11 text-sm'
          } ${avatarClassName}`}
          aria-hidden
        >
          {initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className={`truncate font-semibold text-white ${isPortal ? 'text-lg' : 'text-sm'}`}>
              {title}
            </p>
            <span className={`shrink-0 text-slate-300 ${isPortal ? 'text-base' : 'text-xs'}`}>
              {formatThreadTime(updatedAt)}
            </span>
          </div>
          {subtitle && (
            <p className={`truncate text-slate-300 mt-0.5 ${isPortal ? 'text-base' : 'text-xs'}`}>{subtitle}</p>
          )}
          {preview && (
            <p className={`truncate text-slate-400 mt-1 ${isPortal ? 'text-base' : 'text-xs'}`}>{preview}</p>
          )}
        </div>
        {unread > 0 && (
          <span
            className={`mt-1 flex shrink-0 items-center justify-center rounded-full bg-gold font-bold text-slate-950 ${
              isPortal ? 'h-7 min-w-7 px-2 text-sm' : 'h-5 min-w-5 px-1.5 text-[10px]'
            }`}
            aria-label={`${unread} unread`}
          >
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </div>
    </button>
  )
}
