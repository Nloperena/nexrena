'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { useMessages } from '@/lib/store'
import { useFormSubmissions } from '@/lib/form-submissions-context'
import { teamFocusRing, teamNavLabelClass } from '@/lib/team-a11y'
import {
  isTeamMoreRouteActive,
  isTeamNavActive,
  TEAM_MOBILE_TABS,
  TEAM_NAV_SECTIONS,
  type TeamNavItem,
} from '@/lib/team-nav'
import { isCopilotEnabled } from '@/lib/copilot-config'
import { useCopilotOptional } from '@/components/copilot/copilot-provider'

type NavContextValue = {
  menuOpen: boolean
  openMenu: () => void
  closeMenu: () => void
}

const TeamMobileNavContext = createContext<NavContextValue | null>(null)

function useTeamMobileNav() {
  const ctx = useContext(TeamMobileNavContext)
  if (!ctx) throw new Error('TeamMobileNav components must be used within TeamMobileNavProvider')
  return ctx
}

export function TeamMobileNavProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const openMenu = useCallback(() => setMenuOpen(true), [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  return (
    <TeamMobileNavContext.Provider value={{ menuOpen, openMenu, closeMenu }}>
      {children}
      <TeamMobileBottomBar />
      <TeamFullScreenMenu />
    </TeamMobileNavContext.Provider>
  )
}

function navBadgeCount(item: TeamNavItem, messageUnread: number, formsNewCount: number) {
  if (item.badge === 'messages') return messageUnread
  if (item.badge === 'forms') return formsNewCount
  return 0
}

function TabLink({
  item,
  active,
  badgeCount,
}: {
  item: TeamNavItem
  active: boolean
  badgeCount: number
}) {
  const showBadge = badgeCount > 0

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={`relative flex flex-1 min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 min-h-[60px] transition-colors ${teamFocusRing} ${
        active ? 'text-gold bg-gold/12' : 'text-slate-400 active:bg-slate-800/50'
      }`}
    >
      <span className="relative text-[1.65rem] leading-none">
        {item.icon}
        {showBadge && (
          <span className="absolute -top-1.5 -right-2.5 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-gold text-obsidian text-[10px] font-bold flex items-center justify-center">
            {badgeCount > 9 ? '9+' : badgeCount}
          </span>
        )}
      </span>
      <span className="text-[11px] font-medium leading-none truncate max-w-full px-0.5">
        {item.label}
      </span>
    </Link>
  )
}

function TeamMobileBottomBar() {
  const path = usePathname()
  const { unreadCount } = useMessages()
  const { newCount: formsNewCount } = useFormSubmissions()
  const { openMenu } = useTeamMobileNav()
  const moreActive = isTeamMoreRouteActive(path)
  const copilot = useCopilotOptional()

  if (path === '/messages' || path === '/ai-chats' || copilot?.viewMode === 'copilot') return null

  const mobileTabs = isCopilotEnabled()
    ? TEAM_MOBILE_TABS
    : TEAM_MOBILE_TABS.filter((t) => t.href !== '/copilot')

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-700/60 bg-[#0f1218]/98 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.55)] pb-[max(0.35rem,env(safe-area-inset-bottom))]"
      aria-label="Team navigation"
    >
      <div className="flex items-stretch gap-0.5 px-1.5 pt-1">
        {mobileTabs.map((item) => (
          <TabLink
            key={item.href}
            item={item}
            active={isTeamNavActive(path, item.href)}
            badgeCount={navBadgeCount(item, unreadCount, formsNewCount)}
          />
        ))}
        <button
          type="button"
          aria-label="Open all pages"
          onClick={openMenu}
          className={`relative flex flex-1 min-w-0 flex-col items-center justify-center gap-1 rounded-xl py-2 min-h-[60px] transition-colors ${teamFocusRing} ${
            moreActive ? 'text-gold bg-gold/12' : 'text-slate-400 active:bg-slate-800/50'
          }`}
        >
          <span className="text-[1.65rem] leading-none" aria-hidden>
            ☰
          </span>
          <span className="text-[11px] font-medium leading-none">More</span>
        </button>
      </div>
    </nav>
  )
}

function MenuLink({
  item,
  active,
  badgeCount,
  onNavigate,
}: {
  item: TeamNavItem
  active: boolean
  badgeCount: number
  onNavigate: () => void
}) {
  const showBadge = badgeCount > 0

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 min-h-[52px] transition-colors ${teamFocusRing} ${
        active
          ? 'border-gold/45 bg-gold/10 text-gold'
          : 'border-slate-700/50 bg-[#1a1f27] text-slate-100 active:bg-slate-800/60'
      }`}
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-800/80 text-xl">
        {item.icon}
      </span>
      <span className={`${teamNavLabelClass} flex-1`}>{item.label}</span>
      {showBadge && (
        <span className="min-w-[1.5rem] h-6 px-2 rounded-full bg-gold text-obsidian text-xs font-bold flex items-center justify-center tabular-nums">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </Link>
  )
}

function TeamFullScreenMenu() {
  const path = usePathname()
  const { unreadCount } = useMessages()
  const { newCount: formsNewCount } = useFormSubmissions()
  const { menuOpen, closeMenu } = useTeamMobileNav()

  if (!menuOpen) return null

  return (
    <div
      className="lg:hidden fixed inset-0 z-[100] flex flex-col bg-[#111418]"
      role="dialog"
      aria-modal="true"
      aria-label="All team pages"
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-700/50 px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div>
          <p className="font-serif text-xl text-white">All pages</p>
          <p className="text-sm text-slate-400">Jump anywhere in Nexrena Ops</p>
        </div>
        <button
          type="button"
          onClick={closeMenu}
          className={`shrink-0 rounded-xl border-2 border-slate-600 px-4 py-2.5 min-h-[48px] text-sm font-medium text-white ${teamFocusRing}`}
        >
          Done
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto overscroll-contain px-4 py-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] space-y-6">
        {TEAM_NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
              {section.title}
            </p>
            <div className="grid grid-cols-1 gap-2">
              {section.items.map((item) => (
                <MenuLink
                  key={item.href}
                  item={item}
                  active={isTeamNavActive(path, item.href)}
                  badgeCount={navBadgeCount(item, unreadCount, formsNewCount)}
                  onNavigate={closeMenu}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>
    </div>
  )
}

/** @deprecated */
export function TeamMobileMenuButton() {
  return null
}

/** @deprecated */
export function TeamMobileNav() {
  return null
}
