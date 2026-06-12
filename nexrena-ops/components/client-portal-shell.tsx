'use client'

import { useState, type ReactNode } from 'react'
import type { PortalAccount } from '@/lib/portal-types'
import { UserMenu } from '@/components/user-menu'
import {
  CLIENT_NAV_ITEMS,
  MOBILE_DRAWER_ITEMS,
  MOBILE_TAB_ITEMS,
  ClientNavButton,
  type ClientPortalView,
} from '@/components/client-nav'
import { isCalendlyEnabled } from '@/lib/calendly'
import { PORTAL_MAIN_OFFSET, PORTAL_SIDEBAR_WIDTH, portalFocusRing, PORTAL_MOBILE_TAB_MIN_H } from '@/lib/portal-a11y'
import { PortalMediaPanel } from '@/components/portal-media-panel'
import type { PortalPhotoKey } from '@/lib/portal-imagery'
import { NexrenaLogo } from '@/components/nexrena-logo'

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
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navigate = (view: ClientPortalView) => {
    onNavigate(view)
    setDrawerOpen(false)
  }

  const navItems = CLIENT_NAV_ITEMS.filter(
    (item) => item.id !== 'schedule' || isCalendlyEnabled(),
  )
  const drawerItems = MOBILE_DRAWER_ITEMS.filter(
    (item) => item.id !== 'schedule' || isCalendlyEnabled(),
  )
  const viewTitle = navItems.find((item) => item.id === activeView)?.label ?? 'Home'
  const isMessenger = activeView === 'messages'

  const viewBannerPhoto: PortalPhotoKey | null =
    activeView === 'home' ? null
    : activeView === 'messages' ? 'messages'
    : activeView === 'billing' ? 'billing'
    : activeView === 'websites' ? 'websites'
    : activeView === 'files' ? 'files'
    : activeView === 'schedule' ? 'schedule'
    : activeView === 'forms' ? 'websites'
    : activeView === 'requests' ? 'request'
    : activeView === 'settings' ? 'auth'
    : null

  return (
    <div className="client-portal min-h-screen bg-[#111418] flex">
      {/* Desktop sidebar */}
      <aside className={`hidden md:flex fixed left-0 top-0 h-screen ${PORTAL_SIDEBAR_WIDTH} bg-obsidian/80 backdrop-blur-xl border-r border-slate-700/60 flex-col z-50 overflow-hidden`}>
        <PortalMediaPanel
          photo="hero"
          overlay={72}
          rounded="none"
          className="absolute inset-0 opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c0f12]/60 via-[#0c0f12]/90 to-[#0c0f12]" aria-hidden />

        <div className="relative px-5 py-6 border-b border-slate-700/50">
          <NexrenaLogo size="md" />
          <p className="text-lg text-slate-200 mt-3">Your client workspace</p>
        </div>

        <nav className="relative flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <ClientNavButton
              key={item.id}
              item={item}
              active={activeView === item.id}
              messageUnread={messageUnread}
              formsNewCount={formsNewCount}
              onClick={() => navigate(item.id)}
            />
          ))}
        </nav>

        <div className="relative px-5 py-4 border-t border-slate-800/60">
          <p className="text-lg text-slate-100 font-medium">Need help?</p>
          <p className="text-lg text-slate-300 mt-1">Open Messages to reach Nico</p>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 ${PORTAL_MAIN_OFFSET} flex flex-col min-h-screen ${isMessenger ? 'min-h-0' : ''}`}>
        {!isMessenger ? (
        <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-800/40 bg-[#111418]/92 backdrop-blur-md px-4 py-3 md:px-8 md:py-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gold-light/80 md:hidden">Client portal</p>
            <h1 className={`font-serif text-xl sm:text-2xl text-white truncate ${viewBannerPhoto ? 'md:sr-only' : ''}`}>
              {viewTitle}
            </h1>
            {account && activeView === 'home' && (
              <p className="text-sm text-slate-400 mt-0.5 truncate hidden sm:block">
                Welcome back, {account.name}
              </p>
            )}
          </div>
          {account && (
            <UserMenu
              name={account.name}
              subtitle={account.company ?? account.email}
              onOpenSettings={() => navigate('settings')}
              onSignOut={onSignOut}
            />
          )}
        </header>
        ) : (
        <header className="md:hidden sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-slate-800/40 bg-[#111418]/92 backdrop-blur-md px-4 py-2">
          <button
            type="button"
            onClick={() => navigate('home')}
            className={`text-sm text-slate-400 hover:text-white ${portalFocusRing}`}
          >
            ← Home
          </button>
          {account && (
            <UserMenu
              name={account.name}
              subtitle={account.company ?? account.email}
              onOpenSettings={() => navigate('settings')}
              onSignOut={onSignOut}
            />
          )}
        </header>
        )}

        {viewBannerPhoto && !isMessenger && (
          <div className="hidden md:block shrink-0">
            <PortalMediaPanel
            photo={viewBannerPhoto}
            aspect="wide"
            overlay={65}
            rounded="none"
            className="shrink-0 border-b border-slate-700/50 max-h-[140px] md:max-h-[160px]"
          >
            <div className="flex h-full min-h-[100px] items-end px-4 md:px-8 pb-4">
              <p className="font-serif text-2xl text-white drop-shadow-md">{viewTitle}</p>
            </div>
          </PortalMediaPanel>
          </div>
        )}

        <main
          className={`flex-1 w-full mx-auto overflow-x-hidden ${
            isMessenger
              ? 'flex flex-col min-h-0 max-w-none px-0 py-0 pb-0'
              : 'px-4 md:px-8 py-5 pb-24 md:pb-8 max-w-5xl'
          }`}
        >
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar — hidden in messenger for full-viewport chat */}
      {!isMessenger && (
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-700/50 bg-[#141820]/98 backdrop-blur-xl shadow-[0_-8px_32px_rgba(0,0,0,0.45)] pb-[max(0.35rem,env(safe-area-inset-bottom))]">
        <div className="flex items-stretch px-1.5 pt-1 gap-0.5">
          {MOBILE_TAB_ITEMS.map((item) => (
            <ClientNavButton
              key={item.id}
              item={item}
              active={activeView === item.id}
              messageUnread={messageUnread}
              formsNewCount={formsNewCount}
              onClick={() => navigate(item.id)}
              compact
            />
          ))}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open more menu"
            className={`flex flex-col items-center gap-2 px-2 py-3 flex-1 min-w-0 ${PORTAL_MOBILE_TAB_MIN_H} justify-center rounded-xl transition-colors ${portalFocusRing} ${
              drawerItems.some((item) => item.id === activeView)
                ? 'text-gold-light bg-gold/15'
                : 'text-slate-200 hover:text-white'
            }`}
          >
            <span className="text-3xl leading-none" aria-hidden>☰</span>
            <span className="text-base font-medium">More</span>
          </button>
        </div>
      </nav>
      )}

      {/* Mobile drawer for extra nav items */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute bottom-0 inset-x-0 rounded-t-2xl bg-obsidian border-t border-slate-800/60 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom duration-200">
            <div className="flex items-center justify-between mb-4">
              <p className="text-lg font-semibold text-white">More options</p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-lg text-slate-200 hover:text-white px-4 py-3 min-h-[52px] rounded-xl border-2 border-slate-600"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {drawerItems.map((item) => (
                <ClientNavButton
                  key={item.id}
                  item={item}
                  active={activeView === item.id}
                  messageUnread={messageUnread}
                  formsNewCount={formsNewCount}
                  onClick={() => navigate(item.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
