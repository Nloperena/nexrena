'use client'

import type { ReactNode } from 'react'

import type { PortalAccount } from '@/lib/portal-types'

import { UserMenu } from '@/components/user-menu'
import { AccountSettingsButton } from '@/components/account-settings-button'
import {
  CLIENT_NAV_ITEMS,
  ClientNavButton,
  type ClientPortalView,
} from '@/components/client-nav'
import { isCalendlyEnabled } from '@/lib/calendly'
import {
  PORTAL_MOBILE_BOTTOM_PAD,
  PORTAL_NAV_Z,
  portalFocusRing,
} from '@/lib/portal-a11y'
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

  const viewTitle =
    navItems.find((item) => item.id === activeView)?.label
    ?? (activeView === 'settings' ? 'Account settings' : 'Home')

  const isMessenger = activeView === 'messages'
  const isHome = activeView === 'home'
  const isSettings = activeView === 'settings'

  return (
    <div className="client-portal min-h-screen bg-[#111418]">
      <div className="portal-layout-grid lg:grid lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside
          className={`portal-sidebar sticky top-0 h-screen flex-col ${PORTAL_NAV_Z} border-r border-slate-700/50 bg-[#141820]`}
        >
          <div className="pointer-events-none absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gold/[0.04] to-transparent" />

          <div className="relative border-b border-slate-700/60 px-5 py-6">
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={`rounded-xl ${portalFocusRing}`}
              aria-label="Home"
            >
              <NexrenaLogo size="md" />
            </button>
            <p className="text-sm text-slate-400 mt-3">Client workspace</p>
          </div>

          <nav className="relative flex-1 overflow-y-auto px-2 py-4 min-h-0 space-y-1">
            {navItems.map((item) => (
              <ClientNavButton
                key={item.id}
                item={item}
                active={activeView === item.id}
                messageUnread={messageUnread}
                formsNewCount={formsNewCount}
                onClick={() => onNavigate(item.id)}
                variant="sidebar"
              />
            ))}
          </nav>

          <div className="relative border-t border-slate-700/60 px-4 py-4">
            <AccountSettingsButton
              active={isSettings}
              onClick={() => onNavigate('settings')}
              size="sm"
            />
          </div>
        </aside>

        <div
          className={`relative flex flex-col min-h-screen min-w-0 ${isMessenger ? 'min-h-0' : ''}`}
        >
          <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-800/40 bg-[#111418]/92 backdrop-blur-md px-4 py-3 lg:px-8 lg:py-4">
            <div className="min-w-0 flex-1">
              {!isHome && (
                <h1 className="font-serif text-xl sm:text-2xl text-white truncate">{viewTitle}</h1>
              )}
              {isHome && account && (
                <p className="text-sm text-slate-500 lg:hidden truncate">
                  Welcome, {account.name.split(/\s+/)[0]}
                </p>
              )}
              {isHome && account && (
                <p className="hidden lg:block text-sm text-slate-400">
                  Welcome back,{' '}
                  <span className="font-medium text-white">{account.name.split(/\s+/)[0]}</span>
                </p>
              )}
            </div>

            {account && (
              <div className="flex items-center gap-2 shrink-0">
                <AccountSettingsButton
                  active={isSettings}
                  onClick={() => onNavigate('settings')}
                  size="sm"
                  className="lg:hidden"
                />
                <UserMenu
                  name={account.name}
                  subtitle={account.company ?? account.email}
                  onSignOut={onSignOut}
                />
              </div>
            )}
          </header>

          <main
            className={`flex-1 w-full min-w-0 mx-auto overflow-x-hidden ${PORTAL_MOBILE_BOTTOM_PAD} ${
              isMessenger
                ? 'flex flex-col flex-1 min-h-0 px-0 py-0 lg:pb-4 max-w-none'
                : 'px-4 lg:px-8 py-5 lg:pb-8 max-w-6xl'
            }`}
          >
            {children}
          </main>
        </div>
      </div>

      <nav
        className={`lg:hidden fixed bottom-0 inset-x-0 ${PORTAL_NAV_Z} border-t border-slate-800/60 bg-[#0c0f12]/98 backdrop-blur-xl pb-[max(0.25rem,env(safe-area-inset-bottom))]`}
      >
        <div className="flex items-stretch overflow-x-auto overscroll-x-contain px-2 py-2 gap-0.5 scrollbar-none">
          {navItems.map((item) => (
            <ClientNavButton
              key={item.id}
              item={item}
              active={activeView === item.id}
              messageUnread={messageUnread}
              formsNewCount={formsNewCount}
              onClick={() => onNavigate(item.id)}
              variant="mobile"
            />
          ))}
        </div>
      </nav>

      <PortalAiAgentButton onNavigate={onNavigate} clientName={account?.name} />
    </div>
  )
}
