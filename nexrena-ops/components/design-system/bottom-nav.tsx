import type { ReactNode } from 'react'
import { touch } from '@/lib/design-tokens'

export type BottomNavItem = {
  id: string
  label: string
  icon: string
  badge?: number
  active?: boolean
  onClick?: () => void
  href?: string
}

type Props = {
  items: BottomNavItem[]
  moreActive?: boolean
  onMore?: () => void
  moreLabel?: string
  ariaLabel?: string
}

function NavItemButton({
  item,
  compact,
}: {
  item: BottomNavItem
  compact?: boolean
}) {
  const active = item.active
  const showBadge = item.badge != null && item.badge > 0

  const className = `flex flex-col items-center justify-center gap-1 flex-1 min-w-0 rounded-xl transition-colors ${touch.nav} ${
    active ? 'text-gold bg-gold/12' : 'text-slate-300 hover:text-white'
  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#111418]`

  const inner = (
    <>
      <span className="relative text-2xl leading-none">
        {item.icon}
        {showBadge && (
          <span className="absolute -top-1.5 -right-2.5 min-w-[1.25rem] h-5 px-1 rounded-full bg-gold text-obsidian text-[10px] font-bold flex items-center justify-center tabular-nums">
            {item.badge! > 9 ? '9+' : item.badge}
          </span>
        )}
      </span>
      <span className="text-xs sm:text-sm font-medium text-center leading-tight truncate max-w-full px-0.5">
        {item.label}
      </span>
    </>
  )

  if (item.href) {
    return (
      <a href={item.href} aria-current={active ? 'page' : undefined} className={className}>
        {inner}
      </a>
    )
  }

  return (
    <button type="button" onClick={item.onClick} aria-current={active ? 'page' : undefined} className={className}>
      {inner}
    </button>
  )
}

export function BottomNav({ items, moreActive, onMore, moreLabel = 'More', ariaLabel = 'Navigation' }: Props) {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-700/50 bg-[#141820]/98 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.45)] pb-[max(0.35rem,env(safe-area-inset-bottom))]"
      aria-label={ariaLabel}
    >
      <div className="flex items-stretch px-1.5 pt-1 gap-0.5">
        {items.map((item) => (
          <NavItemButton key={item.id} item={item} compact />
        ))}
        {onMore && (
          <button
            type="button"
            aria-label={`Open ${moreLabel.toLowerCase()} menu`}
            onClick={onMore}
            className={`flex flex-col items-center justify-center gap-1 flex-1 min-w-0 rounded-xl transition-colors ${touch.nav} ${
              moreActive ? 'text-gold bg-gold/12' : 'text-slate-300'
            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold`}
          >
            <span className="text-2xl leading-none" aria-hidden>☰</span>
            <span className="text-xs sm:text-sm font-medium">{moreLabel}</span>
          </button>
        )}
      </div>
    </nav>
  )
}
