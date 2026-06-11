'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/ui'
import { useAuth } from '@/components/auth-gate'
import { UserMenu } from '@/components/user-menu'
import { TeamSettingsModal } from '@/components/team-settings-modal'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { role, signOut, teamDisplayName, setTeamDisplayName } = useAuth()
  const [settingsOpen, setSettingsOpen] = useState(false)

  if (role !== 'admin') return null

  return (
    <>
      <Sidebar />
      <main className="ml-56 min-h-screen relative z-10">
        <header className="sticky top-0 z-40 flex items-center justify-end gap-3 border-b border-slate-800/40 bg-[#111418]/80 backdrop-blur-md px-10 py-3">
          <UserMenu
            name={teamDisplayName}
            subtitle="Team"
            onOpenSettings={() => setSettingsOpen(true)}
            onSignOut={signOut}
          />
        </header>
        <div className="max-w-6xl mx-auto px-10 py-10">{children}</div>
      </main>
      {settingsOpen && (
        <TeamSettingsModal
          displayName={teamDisplayName}
          onClose={() => setSettingsOpen(false)}
          onSaveDisplayName={setTeamDisplayName}
        />
      )}
    </>
  )
}
