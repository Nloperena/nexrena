'use client'

import { portalFocusRing, portalNavLabelClass, PORTAL_MOBILE_TAB_MIN_H } from '@/lib/portal-a11y'

export type ClientPortalView =
  | 'home'
  | 'billing'
  | 'messages'
  | 'schedule'
  | 'files'
  | 'websites'
  | 'forms'
  | 'requests'
  | 'settings'

type NavItem = {
  id: ClientPortalView
  label: string
  icon: string
  badge?: 'messages' | 'forms'
}

export const CLIENT_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'messages', label: 'Message Nico', icon: '✉', badge: 'messages' },
  { id: 'schedule', label: 'Book a call', icon: '📅' },
  { id: 'billing', label: 'Billing & invoices', icon: '▤' },
  { id: 'files', label: 'Your files', icon: '📁' },
  { id: 'websites', label: 'Your website', icon: '◈' },
  { id: 'forms', label: 'Website form leads', icon: '▣', badge: 'forms' },
  { id: 'requests', label: 'Request help', icon: '✦' },
  { id: 'settings', label: 'Account settings', icon: '⚙' },
]

export const MOBILE_TAB_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: '⌂' },
  { id: 'messages', label: 'Nico', icon: '✉', badge: 'messages' },
  { id: 'billing', label: 'Billing', icon: '▤' },
  { id: 'files', label: 'Assets', icon: '📁' },
]

export const MOBILE_DRAWER_ITEMS: NavItem[] = CLIENT_NAV_ITEMS.filter(
  (item) => !MOBILE_TAB_ITEMS.some((tab) => tab.id === item.id),
)

type NavButtonProps = {
  item: NavItem
  active: boolean
  messageUnread?: number
  formsNewCount?: number
  onClick: () => void
  compact?: boolean
}

export function ClientNavButton({
  item,
  active,
  messageUnread = 0,
  formsNewCount = 0,
  onClick,
  compact,
}: NavButtonProps) {
  const badgeCount =
    item.badge === 'messages' ? messageUnread : item.badge === 'forms' ? formsNewCount : 0
  const showBadge = item.badge && badgeCount > 0

  return (
    <button
      type="button"
      onClick={onClick}
      title={item.label}
      aria-current={active ? 'page' : undefined}
      className={`group relative flex items-center gap-3 rounded-xl transition-all duration-200 ${portalFocusRing} ${
        compact
          ? `flex-col gap-2 px-2 py-3 min-w-0 flex-1 ${PORTAL_MOBILE_TAB_MIN_H} justify-center`
          : 'w-full px-4 py-4 min-h-[56px] text-left'
      } ${
        active
          ? compact
            ? 'text-gold-light bg-gold/15'
            : 'bg-slate-800/80 text-gold-light border-2 border-gold/40'
          : compact
            ? 'text-slate-200 hover:text-white'
            : 'text-slate-100 hover:text-white hover:bg-slate-800/50 border-2 border-transparent'
      }`}
    >
      <span className={`relative leading-none ${compact ? 'text-3xl' : 'text-2xl'} ${active ? 'text-gold-light' : ''}`}>
        {item.icon}
        {showBadge && compact && (
          <span className="absolute -top-2 -right-3 min-w-[1.5rem] h-6 px-1.5 rounded-full bg-gold text-obsidian text-sm font-bold flex items-center justify-center tabular-nums">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </span>
      <span className={`leading-tight ${compact ? `${portalNavLabelClass} text-center text-base` : portalNavLabelClass}`}>
        {item.label}
      </span>
      {showBadge && !compact && (
        <span className="min-w-[1.75rem] h-7 px-2 rounded-full bg-gold text-obsidian text-base font-bold flex items-center justify-center tabular-nums">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
      {active && !compact && (
        <span className="absolute right-3 w-1.5 h-7 bg-gold rounded-full" aria-hidden />
      )}
    </button>
  )
}
