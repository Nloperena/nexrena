'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { TeamSidebar } from '@/components/team-sidebar'
import { TeamMobileNavProvider } from '@/components/team-mobile-nav'
import { useAuth } from '@/components/auth-gate'
import { UserMenu } from '@/components/user-menu'
import { TeamSettingsModal } from '@/components/team-settings-modal'
import { getTeamPageContext } from '@/lib/team-page-titles'
import { TEAM_MAIN_OFFSET, TEAM_MOBILE_BOTTOM_PAD } from '@/lib/team-a11y'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { role, signOut, teamDisplayName, setTeamDisplayName } = useAuth()
  const pathname = usePathname()
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (role !== 'admin') return <>{children}</>

  const page = getTeamPageContext(pathname)

  return (
    <TeamMobileNavProvider>
      <div className="team-ops min-h-screen overflow-x-hidden bg-[#111418]">
        <TeamSidebar />

        <div className={`flex min-h-screen w-full min-w-0 flex-col ${TEAM_MAIN_OFFSET}`}>
          {/* Mobile: compact bar — no sidebar, no duplicate page chrome */}
          <header className="sticky top-0 z-40 border-b border-slate-700/40 bg-[#111418]/95 backdrop-blur-md lg:hidden">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <Link href="/" className="flex min-w-0 items-baseline gap-0.5">
                <span className="font-serif text-lg text-white">Nex</span>
                <span className="font-serif text-lg text-gold">rena</span>
              </Link>
              <UserMenu
                name={teamDisplayName}
                subtitle="Team"
                onOpenSettings={() => setSettingsOpen(true)}
                onSignOut={signOut}
              />
            </div>
          </header>

          {/* Desktop: page title row */}
          <header className="sticky top-0 z-40 hidden border-b border-slate-700/40 bg-[#141820]/95 backdrop-blur-md lg:block">
            <div className="flex items-center justify-between gap-4 px-8 py-4">
              <div className="min-w-0">
                <h1 className="truncate font-serif text-2xl text-white">{page.title}</h1>
                {page.subtitle && (
                  <p className="truncate text-sm text-slate-400">{page.subtitle}</p>
                )}
              </div>
              <UserMenu
                name={teamDisplayName}
                subtitle="Team"
                onOpenSettings={() => setSettingsOpen(true)}
                onSignOut={signOut}
              />
            </div>
            <div className="border-t border-slate-800/40 px-8 py-2.5">
              <p className="text-sm text-slate-300">
                Welcome back, <span className="font-medium text-white">{teamDisplayName}</span>.
              </p>
            </div>
          </header>

          <main
            className={`flex-1 w-full min-w-0 max-w-full ${TEAM_MOBILE_BOTTOM_PAD}`}
          >
            <div className="mx-auto w-full max-w-7xl px-4 py-5 md:px-8 md:py-8">{children}</div>
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
  )
}
