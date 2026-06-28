'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TeamSidebar } from '@/components/team-sidebar'
import { TeamMobileNavProvider } from '@/components/team-mobile-nav'
import { NexrenaLogo } from '@/components/nexrena-logo'
import { useAuth } from '@/components/auth-gate'
import { UserMenu } from '@/components/user-menu'
import { TeamSettingsModal } from '@/components/team-settings-modal'
import { getTeamPageContext } from '@/lib/team-page-titles'
import { AccountSettingsButton } from '@/components/account-settings-button'
import { TEAM_LAYOUT_GRID, TEAM_MOBILE_BOTTOM_PAD } from '@/lib/team-a11y'
import { FormSubmissionsProvider } from '@/lib/form-submissions-context'
import { ApiConnectionBanner } from '@/components/api-connection-banner'
import { CopilotShell } from '@/components/copilot/copilot-shell'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { role, signOut, teamDisplayName, setTeamDisplayName } = useAuth()
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (role !== 'admin') return <>{children}</>

  const page = getTeamPageContext(pathname)
  const isMessenger = pathname === '/messages'
  const isAiChats = pathname === '/ai-chats'
  const isCopilot = pathname === '/copilot'
  const isFullHeightChat = isMessenger || isAiChats || isCopilot
  const isDashboard = pathname === '/'

  return (
    <CopilotShell persona="team">
    <FormSubmissionsProvider enabled>
      <TeamMobileNavProvider>
      <div className={`team-ops min-h-screen overflow-x-hidden bg-[#111418] ${TEAM_LAYOUT_GRID}`}>
        <TeamSidebar onOpenSettings={() => setSettingsOpen(true)} />

        <div className="flex min-h-screen w-full min-w-0 flex-col">
          {/* Mobile: full chrome hidden in thread; minimal bar on Messages list */}
          {isFullHeightChat ? (
          <header className="sticky top-0 z-40 border-b border-slate-700/40 bg-[#111418]/95 backdrop-blur-md lg:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-2">
              <Link href="/" className="min-w-0 text-sm text-slate-400 hover:text-white">
                ← Dashboard
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <AccountSettingsButton
                  onClick={() => setSettingsOpen(true)}
                  size="sm"
                />
                <UserMenu
                  name={teamDisplayName}
                  subtitle="Team"
                  onSignOut={signOut}
                />
              </div>
            </div>
          </header>
          ) : (
          <header className={`sticky top-0 z-40 border-b border-slate-700/40 bg-[#111418]/95 backdrop-blur-md lg:hidden ${isDashboard ? 'border-transparent bg-transparent' : ''}`}>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <Link href="/" className="min-w-0">
                <NexrenaLogo size="sm" />
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <AccountSettingsButton
                  onClick={() => setSettingsOpen(true)}
                  size="sm"
                />
                <UserMenu
                  name={teamDisplayName}
                  subtitle="Team"
                  onSignOut={signOut}
                />
              </div>
            </div>
          </header>
          )}

          {/* Desktop: page title row (hidden on main menu) */}
          {!isDashboard && (
          <header className="sticky top-0 z-40 hidden border-b border-slate-700/40 bg-[#141820]/95 backdrop-blur-md lg:block">
            <div className="flex items-center justify-between gap-4 px-8 py-4">
              <div className="min-w-0">
                <h1 className="truncate font-serif text-2xl text-white">{page.title}</h1>
                {page.subtitle && (
                  <p className="truncate text-sm text-slate-400">{page.subtitle}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <AccountSettingsButton onClick={() => setSettingsOpen(true)} size="sm" />
                <UserMenu
                  name={teamDisplayName}
                  subtitle="Team"
                  onSignOut={signOut}
                />
              </div>
            </div>
            <div className="border-t border-slate-800/40 px-8 py-2.5">
              <p className="text-sm text-slate-300">
                Welcome back, <span className="font-medium text-white">{teamDisplayName}</span>.
              </p>
            </div>
          </header>
          )}

          <main
            className={`flex-1 w-full min-w-0 max-w-full ${TEAM_MOBILE_BOTTOM_PAD} ${
              isFullHeightChat ? 'flex flex-col min-h-0 overflow-hidden pb-0 lg:pb-0' : ''
            }`}
          >
            <div
              className={`mx-auto w-full ${
                isFullHeightChat
                  ? 'flex flex-col flex-1 min-h-0 max-w-7xl px-0 py-0 lg:px-8 lg:py-8'
                  : isDashboard
                    ? 'max-w-none px-0 py-0'
                    : 'max-w-7xl px-4 py-5 md:px-8 md:py-8'
              }`}
            >
              {!isFullHeightChat && <ApiConnectionBanner />}
              {isAiChats && (
                <div className="hidden lg:block mb-4 shrink-0">
                  <ApiConnectionBanner />
                </div>
              )}
              {children}
            </div>
          </main>
        </div>

        {settingsOpen && (
          <TeamSettingsModal
            displayName={teamDisplayName}
            onClose={() => setSettingsOpen(false)}
            onSaveDisplayName={setTeamDisplayName}
          />
        )}
      </div>
    </TeamMobileNavProvider>
    </FormSubmissionsProvider>
    </CopilotShell>
  )
}
