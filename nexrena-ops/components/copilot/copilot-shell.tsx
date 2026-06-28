'use client'

import { usePathname } from 'next/navigation'
import { isCopilotEnabled } from '@/lib/copilot-config'
import { CopilotProvider } from '@/components/copilot/copilot-provider'
import { CopilotPanel } from '@/components/copilot/copilot-panel'
import { SessionIntakeShell } from '@/components/copilot/session-intake-shell'
import type { CopilotPersona } from '@/lib/copilot-types'

type Props = {
  persona: CopilotPersona
  clientView?: string
  children: React.ReactNode
}

export function CopilotShell({ persona, clientView, children }: Props) {
  const pathname = usePathname()
  const enabled = isCopilotEnabled()

  if (!enabled) {
    return <>{children}</>
  }

  const mobileCopilotOnly =
    (persona === 'team' && pathname === '/copilot') ||
    (persona === 'client' && clientView === 'copilot')

  return (
    <CopilotProvider persona={persona} clientView={clientView}>
      <SessionIntakeShell persona={persona} />

      {mobileCopilotOnly && (
        <div className="copilot-mobile-full lg:hidden">
          <CopilotPanel className="copilot-panel--mobile-full" />
        </div>
      )}

      <div className={`copilot-split ${mobileCopilotOnly ? 'hidden lg:flex' : 'flex'}`}>
        <CopilotPanel className="hidden lg:flex" />
        <div className="copilot-split__main min-w-0 flex-1">{children}</div>
      </div>
    </CopilotProvider>
  )
}
