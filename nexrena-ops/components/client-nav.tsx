'use client'

import { portalFocusRing } from '@/lib/portal-a11y'
import { CLIENT_NAV_ICON } from '@/components/client-nav-icons'

export type ClientPortalView =
  | 'home'
  | 'shop'
  | 'billing'
  | 'messages'
  | 'schedule'
  | 'files'
  | 'websites'
  | 'forms'
  | 'requests'
  | 'settings'

export type NavItem = {
  id: ClientPortalView
  label: string
  badge?: 'messages' | 'forms'
}

export const CLIENT_NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home' },
  { id: 'shop', label: 'Shop' },
  { id: 'messages', label: 'Messages', badge: 'messages' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'billing', label: 'Billing' },
  { id: 'files', label: 'Files' },
  { id: 'websites', label: 'Website' },
  { id: 'forms', label: 'Form leads', badge: 'forms' },
  { id: 'requests', label: 'Requests' },
  { id: 'settings', label: 'Settings' },
]

type NavButtonProps = {
  item: NavItem
  active: boolean
  messageUnread?: number
  formsNewCount?: number
  onClick: () => void
  iconOnly?: boolean
  showTooltip?: boolean
}

export function ClientNavButton({
  item,
  active,
  messageUnread = 0,
  formsNewCount = 0,
  onClick,
  iconOnly = false,
  showTooltip = false,
}: NavButtonProps) {
  const Icon = CLIENT_NAV_ICON[item.id]
  const badgeCount =
    item.badge === 'messages' ? messageUnread : item.badge === 'forms' ? formsNewCount : 0
  const showBadge = item.badge && badgeCount > 0

  if (iconOnly) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={item.label}
        aria-label={item.label}
        aria-current={active ? 'page' : undefined}
        className={`group relative flex shrink-0 items-center justify-center rounded-xl transition-all duration-200 ${portalFocusRing} w-11 h-11 ${
          active
            ? 'bg-gold/15 text-gold-light shadow-[inset_0_0_0_1px_rgba(201,169,110,0.45)]'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
        }`}
      >
        <Icon className="w-5 h-5" />
        {showBadge && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-gold text-obsidian text-[10px] font-bold flex items-center justify-center tabular-nums">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-gold rounded-full -ml-0.5" aria-hidden />
        )}
        {showTooltip && (
          <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg border border-slate-700/80 bg-[#141820] px-2.5 py-1.5 text-xs font-medium text-white opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity z-50 shadow-lg">
            {item.label}
          </span>
        )}
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-col items-center gap-1 shrink-0 px-2 py-2 min-w-[4.25rem] ${portalFocusRing} ${
        active ? 'text-gold-light' : 'text-slate-400 hover:text-white'
      }`}
    >
      <span className="relative">
        <Icon className="w-6 h-6" />
        {showBadge && (
          <span className="absolute -top-1.5 -right-2 min-w-[1.125rem] h-[1.125rem] px-1 rounded-full bg-gold text-obsidian text-[10px] font-bold flex items-center justify-center tabular-nums">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </span>
      <span className="text-[10px] font-medium leading-tight text-center max-w-[4.5rem] truncate">
        {item.label.split(' ')[0]}
      </span>
    </button>
  )
}
