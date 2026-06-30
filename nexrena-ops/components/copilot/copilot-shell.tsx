'use client'

import { isCopilotEnabled } from '@/lib/copilot-config'
import { CopilotProvider } from '@/components/copilot/copilot-provider'
import { CopilotLayout } from '@/components/copilot/copilot-layout'
import type { CopilotPersona } from '@/lib/copilot-types'

type Props = {
  persona: CopilotPersona
  clientView?: string
  children: React.ReactNode
}

export function CopilotShell({ persona, clientView, children }: Props) {
  if (!isCopilotEnabled()) {
    return <>{children}</>
  }

  return (
    <CopilotProvider persona={persona} clientView={clientView}>
      {children}
    </CopilotProvider>
  )
}

export { CopilotLayout }
