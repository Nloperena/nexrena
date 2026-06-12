'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMessages } from '@/lib/store'
import { useFormSubmissions } from '@/lib/form-submissions-context'
import {
  teamFocusRing,
  teamNavItemClass,
  teamNavLabelClass,
} from '@/lib/team-a11y'
import {
  TEAM_ADMIN_NAV,
  TEAM_BILLING_NAV,
  TEAM_CLIENTS_NAV,
  TEAM_DASHBOARD_NAV,
  TEAM_WORK_NAV,
  isTeamNavActive,
} from '@/lib/team-nav'
import { NexrenaLogo } from '@/components/nexrena-logo'

type NavItem = { href: string; label: string; icon: string; badge?: 'messages' | 'forms' }

function navBadgeCount(item: NavItem, messageUnread: number, formsNewCount: number) {
  if (item.badge === 'messages') return messageUnread
  if (item.badge === 'forms') return formsNewCount
  return 0
}

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  const path = usePathname()
  const { unreadCount } = useMessages()
  const { newCount: formsNewCount } = useFormSubmissions()

  return (
    <div className="mb-6">
      <p className="px-4 mb-2 text-xs font-semibold text-slate-400 tracking-wide">{title}</p>
      <div className="space-y-1">
        {items.map(({ href, label, icon, badge }) => {
          const active = isTeamNavActive(path, href)
          const count = navBadgeCount({ href, label, icon, badge }, unreadCount, formsNewCount)
          const showBadge = count > 0
          return (
            <Link
              key={href}
              href={href}
              className={`${teamNavItemClass} ${teamFocusRing} ${
                active
                  ? 'bg-slate-800/70 text-gold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <span
                className={`text-lg leading-none transition-transform duration-200 group-hover:scale-110 ${
                  active ? 'text-gold' : 'text-slate-400'
                }`}
              >
                {icon}
              </span>
              <span className={`${teamNavLabelClass} flex-1`}>{label}</span>
              {showBadge && (
                <span className="min-w-[1.5rem] h-6 px-2 rounded-full bg-gold text-obsidian text-xs font-bold flex items-center justify-center tabular-nums">
                  {count > 99 ? '99+' : count}
                </span>
              )}
              {active && (
                <span className="absolute right-3 w-1 h-6 bg-gold rounded-full shadow-[0_0_8px_rgba(201,169,110,0.4)]" />
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export function TeamSidebar() {
  return (
    <aside
      className="fixed left-0 top-0 z-50 hidden h-screen w-[260px] flex-col border-r border-slate-700/50 bg-[#141820] shadow-[4px_0_24px_rgba(0,0,0,0.25)] lg:flex"
    >
      <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gold/[0.04] to-transparent" />

      <div className="relative border-b border-slate-700/60 px-5 py-6">
        <Link href="/" className="no-underline">
          <NexrenaLogo size="md" />
        </Link>
        <p className="text-sm text-slate-400 mt-3">Team workspace</p>
      </div>

      <nav className="relative flex-1 overflow-y-auto px-2 py-5">
        <NavSection title="Overview" items={TEAM_DASHBOARD_NAV} />
        <NavSection title="Work" items={TEAM_WORK_NAV} />
        <NavSection title="Billing" items={TEAM_BILLING_NAV} />
        <NavSection title="Clients" items={TEAM_CLIENTS_NAV} />
        <NavSection title="Admin" items={TEAM_ADMIN_NAV} />
      </nav>

      <div className="relative border-t border-slate-700/60 px-5 py-5">
        <div className="gold-rule-center mb-3 opacity-40" />
        <p className="text-xs text-slate-500">Nexrena LLC · nexrena.com</p>
      </div>
    </aside>
  )
}
