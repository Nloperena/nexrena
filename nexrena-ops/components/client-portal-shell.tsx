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

type Props = {
  activeView: ClientPortalView
  onNavigate: (view: ClientPortalView) => void
  messageUnread: number
  account: PortalAccount | null
  onSignOut: () => void
  children: ReactNode
}

export function ClientPortalShell({
  activeView,
  onNavigate,
  messageUnread,
  account,
  onSignOut,
  children,
}: Props) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const navigate = (view: ClientPortalView) => {
    onNavigate(view)
    setDrawerOpen(false)
  }

  const viewTitle = CLIENT_NAV_ITEMS.find((item) => item.id === activeView)?.label ?? 'Home'

  return (
    <div className="min-h-screen bg-[#111418] flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-screen w-[220px] bg-obsidian/80 backdrop-blur-xl border-r border-slate-800/60 flex-col z-50">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gold/[0.04] to-transparent pointer-events-none" />

        <div className="relative px-5 py-6 border-b border-slate-800/60">
          <div className="flex items-baseline gap-0.5">
            <span className="font-serif text-xl text-white tracking-tight">Nex</span>
            <span className="font-serif text-xl text-gold tracking-tight">rena</span>
          </div>
          <p className="text-[9px] text-slate-400 mt-1 tracking-[0.2em] uppercase">Your workspace</p>
        </div>

        <nav className="relative flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {CLIENT_NAV_ITEMS.map((item) => (
            <ClientNavButton
              key={item.id}
              item={item}
              active={activeView === item.id}
              unreadCount={messageUnread}
              onClick={() => navigate(item.id)}
            />
          ))}
        </nav>

        <div className="relative px-5 py-4 border-t border-slate-800/60">
          <p className="text-[9px] text-slate-600 tracking-[0.2em] uppercase">Need help?</p>
          <p className="text-xs text-slate-500 mt-1">Message Nico anytime</p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 md:ml-[220px] flex flex-col min-h-screen">
        <header className="sticky top-0 z-40 flex items-center justify-between gap-4 border-b border-slate-800/40 bg-[#111418]/85 backdrop-blur-md px-4 md:px-8 py-3">
          <div className="min-w-0">
            <p className="text-[10px] text-gold tracking-[0.2em] uppercase md:hidden">Nexrena</p>
            <h1 className="font-serif text-xl md:text-2xl text-white truncate">{viewTitle}</h1>
            {account && activeView === 'home' && (
              <p className="text-xs text-slate-400 mt-0.5 truncate hidden sm:block">
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

        <main className="flex-1 px-4 md:px-8 py-6 pb-24 md:pb-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 border-t border-slate-800/60 bg-obsidian/95 backdrop-blur-xl pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <div className="flex items-stretch px-1 pt-1">
          {MOBILE_TAB_ITEMS.map((item) => (
            <ClientNavButton
              key={item.id}
              item={item}
              active={activeView === item.id}
              unreadCount={messageUnread}
              onClick={() => navigate(item.id)}
              compact
            />
          ))}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className={`flex flex-col items-center gap-1 px-2 py-2 flex-1 min-w-0 rounded-xl transition-colors ${
              MOBILE_DRAWER_ITEMS.some((item) => item.id === activeView)
                ? 'text-gold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <span className="text-xl leading-none">☰</span>
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

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
              <p className="text-sm font-medium text-white">More</p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {MOBILE_DRAWER_ITEMS.map((item) => (
                <ClientNavButton
                  key={item.id}
                  item={item}
                  active={activeView === item.id}
                  unreadCount={messageUnread}
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
