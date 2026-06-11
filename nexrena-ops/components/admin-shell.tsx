'use client'

import { Sidebar } from '@/components/ui'
import { useAuthRole } from '@/components/auth-gate'

export function AdminShell({ children }: { children: React.ReactNode }) {
  const role = useAuthRole()
  if (role !== 'admin') return null
  return (
    <>
      <Sidebar />
      <main className="ml-56 min-h-screen relative z-10">
        <div className="max-w-6xl mx-auto px-10 py-10">{children}</div>
      </main>
    </>
  )
}
