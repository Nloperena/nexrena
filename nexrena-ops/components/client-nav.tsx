'use client'

export type ClientPortalView =
  | 'home'
  | 'billing'
  | 'messages'
  | 'schedule'
  | 'files'
  | 'websites'
  | 'requests'
  | 'settings'

type NavItem = {
  id: ClientPortalView
  label: string
  icon: string
  badge?: boolean
}

export const CLIENT_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'messages', label: 'Messages', icon: '✉', badge: true },
  { id: 'schedule', label: 'Book a call', icon: '📅' },
  { id: 'billing', label: 'Billing', icon: '▤' },
  { id: 'files', label: 'Files', icon: '📁' },
  { id: 'websites', label: 'Websites', icon: '◈' },
  { id: 'requests', label: 'Requests', icon: '✦' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

/** Primary bottom tabs on mobile — Messages always one tap away */
export const MOBILE_TAB_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'messages', label: 'Messages', icon: '✉', badge: true },
  { id: 'billing', label: 'Billing', icon: '▤' },
  { id: 'files', label: 'Files', icon: '📁' },
]

export const MOBILE_DRAWER_ITEMS: NavItem[] = CLIENT_NAV_ITEMS.filter(
  (item) => !MOBILE_TAB_ITEMS.some((tab) => tab.id === item.id),
)

type NavButtonProps = {
  item: NavItem
  active: boolean
  unreadCount?: number
  onClick: () => void
  compact?: boolean
}

export function ClientNavButton({ item, active, unreadCount = 0, onClick, compact }: NavButtonProps) {
  const showBadge = item.badge && unreadCount > 0

  return (
    <button
      type="button"
      onClick={onClick}
      title={item.label}
      className={`group relative flex items-center gap-3 rounded-xl transition-all duration-200 ${
        compact
          ? 'flex-col gap-1 px-2 py-2 min-w-0 flex-1'
          : 'w-full px-3 py-2.5 text-left'
      } ${
        active
          ? compact
            ? 'text-gold'
            : 'bg-slate-800/60 text-gold'
          : compact
            ? 'text-slate-500 hover:text-slate-300'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
      }`}
    >
      <span className={`relative leading-none ${compact ? 'text-xl' : 'text-base'} ${active ? 'text-gold' : ''}`}>
        {item.icon}
        {showBadge && compact && (
          <span className="absolute -top-1.5 -right-2 min-w-[1rem] h-4 px-1 rounded-full bg-gold text-obsidian text-[9px] font-bold flex items-center justify-center tabular-nums">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </span>
      <span className={`font-medium tracking-wide ${compact ? 'text-[10px]' : 'text-sm flex-1'}`}>
        {item.label}
      </span>
      {showBadge && !compact && (
        <span className="min-w-[1.25rem] h-5 px-1.5 rounded-full bg-gold text-obsidian text-[10px] font-bold flex items-center justify-center tabular-nums">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
      {active && !compact && (
        <span className="absolute right-2 w-1 h-5 bg-gold rounded-full shadow-[0_0_8px_rgba(201,169,110,0.4)]" />
      )}
    </button>
  )
}
