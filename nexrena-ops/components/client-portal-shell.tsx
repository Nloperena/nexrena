'use client'

import type { ReactNode } from 'react'
import type { PortalAccount } from '@/lib/portal-types'
import { UserMenu } from '@/components/user-menu'
import {
  CLIENT_NAV_ITEMS,
  ClientNavButton,
  type ClientPortalView,
} from '@/components/client-nav'
import { isCalendlyEnabled } from '@/lib/calendly'
import { PORTAL_MAIN_OFFSET, PORTAL_SIDEBAR_WIDTH, portalFocusRing } from '@/lib/portal-a11y'
import { NexrenaLogo } from '@/components/nexrena-logo'
import { PortalAiAgentButton } from '@/components/portal-ai-agent-button'

type Props = {
  activeView: ClientPortalView
  onNavigate: (view: ClientPortalView) => void
  messageUnread: number
  formsNewCount?: number
  account: PortalAccount | null
  onSignOut: () => void
  children: ReactNode
}

export function ClientPortalShell({
  activeView,
  onNavigate,
  messageUnread,
  formsNewCount = 0,
  account,
  onSignOut,
  children,
}: Props) {
  const navItems = CLIENT_NAV_ITEMS.filter(
    (item) => item.id !== 'schedule' || isCalendlyEnabled(),
  )
  const viewTitle = navItems.find((item) => item.id === activeView)?.label ?? 'Home'
  const isMessenger = activeView === 'messages'
  const isHome = activeView === 'home'

  return (
    <div className="client-portal min-h-screen bg-[#111418] flex">
      {/* Desktop icon rail */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 h-screen ${PORTAL_SIDEBAR_WIDTH} flex-col items-center py-4 z-50 border-r border-slate-800/60 bg-[#0c0f12]/95 backdrop-blur-xl`}
      >
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className={`mb-6 rounded-xl p-1.5 ${portalFocusRing}`}
          aria-label="Home"
        >
          <NexrenaLogo size="sm" showWordmark={false} />
        </button>

        <nav className="flex flex-1 flex-col items-center gap-1.5 overflow-y-auto w-full px-2">
          {navItems.map((item) => (
            <ClientNavButton
              key={item.id}
              item={item}
              active={activeView === item.id}
              messageUnread={messageUnread}
              formsNewCount={formsNewCount}
              onClick={() => onNavigate(item.id)}
              iconOnly
              showTooltip
            />
          ))}
        </nav>
      </aside>

      <div className={`flex-1 ${PORTAL_MAIN_OFFSET} flex flex-col min-h-screen ${isMessenger ? 'min-h-0' : ''}`}>
        {!isMessenger ? (
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-800/40 bg-[#111418]/92 backdrop-blur-md px-4 py-3 md:px-8 md:py-4">
            <div className="min-w-0 flex-1">
              {!isHome && (
                <h1 className="font-serif text-xl sm:text-2xl text-white truncate">{viewTitle}</h1>
              )}
              {isHome && account && (
                <p className="text-sm text-slate-500 md:hidden truncate">Welcome, {account.name.split(/\s+/)[0]}</p>
              )}
            </div>
            {account && (
              <UserMenu
                name={account.name}
                subtitle={account.company ?? account.email}
                onOpenSettings={() => onNavigate('settings')}
                onSignOut={onSignOut}
              />
            )}
          </header>
        ) : (
          <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-800/40 bg-[#111418]/92 backdrop-blur-md px-4 py-2">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`text-sm text-slate-400 hover:text-white ${portalFocusRing}`}
            >
              ← Home
            </button>
            {account && (
              <UserMenu
                name={account.name}
                subtitle={account.company ?? account.email}
                onOpenSettings={() => onNavigate('settings')}
                onSignOut={onSignOut}
              />
            )}
          </header>
        )}

        <main
          className={`flex-1 w-full mx-auto overflow-x-hidden ${
            isMessenger
              ? 'flex flex-col min-h-0 max-w-none px-0 py-0 pb-0'
              : 'px-4 md:px-8 py-5 pb-[5.5rem] md:pb-8 max-w-6xl'
          }`}
        >
          {children}
        </main>
      </div>

      {/* Mobile: scrollable icon bar — no drawer */}
      {!isMessenger && (
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-800/60 bg-[#0c0f12]/98 backdrop-blur-xl pb-[max(0.25rem,env(safe-area-inset-bottom))]">
          <div className="flex items-stretch overflow-x-auto overscroll-x-contain px-2 py-2 gap-0.5 scrollbar-none">
            {navItems.map((item) => (
              <ClientNavButton
                key={item.id}
                item={item}
                active={activeView === item.id}
                messageUnread={messageUnread}
                formsNewCount={formsNewCount}
                onClick={() => onNavigate(item.id)}
              />
            ))}
          </div>
        </nav>
      )}

      <PortalAiAgentButton onNavigate={onNavigate} clientName={account?.name} />
    </div>
  )
}
