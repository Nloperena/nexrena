'use client'

import { useCopilotOptional } from './copilot-provider'
import { SessionIntakeShell } from './session-intake-shell'
import { CopilotPanelWhenReady } from './copilot-panel'

type Props = {
  children: React.ReactNode
}

export function CopilotLayout({ children }: Props) {
  const ctx = useCopilotOptional()
  if (!ctx) return <>{children}</>

  const { viewMode, showIntake, persona } = ctx

  if (viewMode === 'workspace') {
    return <>{children}</>
  }

  return (
    <>
      {showIntake && <SessionIntakeShell persona={persona} />}

      {viewMode === 'copilot' && (
        <div className="copilot-focus-layout flex flex-1 min-h-0 min-w-0 w-full">
          <CopilotPanelWhenReady className="copilot-panel--focus flex-1 max-w-none w-full border-r-0" />
        </div>
      )}

      {viewMode === 'hybrid' && (
        <div className="copilot-split flex flex-1 min-h-0 min-w-0 w-full h-full overflow-hidden">
          <CopilotPanelWhenReady className="hidden md:flex shrink-0 h-full" />
          <div className="copilot-split__main min-w-0 flex-1 flex flex-col min-h-0 overflow-auto">
            {children}
          </div>
        </div>
      )}
    </>
  )
}
