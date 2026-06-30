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
import { CopilotShell, CopilotLayout } from '@/components/copilot/copilot-shell'
import { useCopilotOptional } from '@/components/copilot/copilot-provider'
import { WorkspaceModeSwitcher } from '@/components/workspace-mode-switcher'
import { isCopilotEnabled } from '@/lib/copilot-config'

function AdminShellInner({ children }: { children: React.ReactNode }) {
  const { role, signOut, teamDisplayName, setTeamDisplayName } = useAuth()
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const copilot = useCopilotOptional()
  const copilotOn = isCopilotEnabled()

  if (role !== 'admin') return <>{children}</>

  const page = getTeamPageContext(pathname)
  const isMessenger = pathname === '/messages'
  const isAiChats = pathname === '/ai-chats'
  const isCopilotRoute = pathname === '/copilot'
  const isCopilotView = copilot?.viewMode === 'copilot'
  const isHybridView = copilot?.viewMode === 'hybrid'
  const isFullHeightChat = isMessenger || isAiChats || isCopilotRoute || isCopilotView
  const isDashboard = pathname === '/'

  return (
    <FormSubmissionsProvider enabled>
      <TeamMobileNavProvider>
        <div
          className={`team-ops bg-[#111418] min-h-screen lg:h-screen lg:max-h-screen lg:min-h-0 lg:overflow-hidden ${TEAM_LAYOUT_GRID}`}
        >
          <TeamSidebar onOpenSettings={() => setSettingsOpen(true)} />

          <div className="flex h-screen max-h-screen min-h-0 w-full min-w-0 flex-col overflow-hidden">
            {isFullHeightChat ? (
              <header className="sticky top-0 z-40 border-b border-slate-700/40 bg-[#111418]/95 backdrop-blur-md lg:hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-2">
                  <Link href="/" className="min-w-0 text-sm text-slate-400 hover:text-white">
                    ← Dashboard
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    <AccountSettingsButton onClick={() => setSettingsOpen(true)} size="sm" />
                    <UserMenu name={teamDisplayName} subtitle="Team" onSignOut={signOut} />
                  </div>
                </div>
              </header>
            ) : (
              <header
                className={`sticky top-0 z-40 border-b border-slate-700/40 bg-[#111418]/95 backdrop-blur-md lg:hidden ${isDashboard ? 'border-transparent bg-transparent' : ''}`}
              >
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <Link href="/" className="min-w-0">
                    <NexrenaLogo size="sm" />
                  </Link>
                  <div className="flex items-center gap-2 shrink-0">
                    {copilotOn && <WorkspaceModeSwitcher compact className="hidden xs:flex" />}
                    <AccountSettingsButton onClick={() => setSettingsOpen(true)} size="sm" />
                    <UserMenu name={teamDisplayName} subtitle="Team" onSignOut={signOut} />
                  </div>
                </div>
                {copilotOn && isDashboard && (
                  <div className="px-4 pb-3 flex justify-center">
                    <WorkspaceModeSwitcher />
                  </div>
                )}
              </header>
            )}

            {!isDashboard && (
              <header className="sticky top-0 z-40 hidden border-b border-slate-700/40 bg-[#141820]/95 backdrop-blur-md lg:block">
                <div className="flex items-center justify-between gap-4 px-8 py-4">
                  <div className="min-w-0">
                    <h1 className="truncate font-serif text-2xl text-white">{page.title}</h1>
                    {page.subtitle && (
                      <p className="truncate text-sm text-slate-400">{page.subtitle}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {copilotOn && <WorkspaceModeSwitcher />}
                    <AccountSettingsButton onClick={() => setSettingsOpen(true)} size="sm" />
                    <UserMenu name={teamDisplayName} subtitle="Team" onSignOut={signOut} />
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
              className={`flex-1 w-full min-w-0 max-w-full flex flex-col min-h-0 overflow-hidden ${TEAM_MOBILE_BOTTOM_PAD} ${isFullHeightChat ? 'pb-0 lg:pb-0' : ''}`}
            >
              <div
                className={`mx-auto w-full flex flex-col flex-1 min-h-0 overflow-hidden ${
                  isFullHeightChat || isHybridView || isCopilotView
                    ? 'max-w-none px-0 py-0'
                    : isDashboard
                      ? 'max-w-none px-0 py-0'
                      : 'max-w-7xl px-4 py-5 md:px-8 md:py-8'
                }`}
              >
                {!isFullHeightChat && !isCopilotView && !isHybridView && <ApiConnectionBanner />}
                {isAiChats && (
                  <div className="hidden lg:block mb-4 shrink-0">
                    <ApiConnectionBanner />
                  </div>
                )}
                <CopilotLayout>{children}</CopilotLayout>
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
  )
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <CopilotShell persona="team">
      <AdminShellInner>{children}</AdminShellInner>
    </CopilotShell>
  )
}
