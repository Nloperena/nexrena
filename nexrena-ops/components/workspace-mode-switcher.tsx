'use client'

import { isCopilotEnabled } from '@/lib/copilot-config'
import { useCopilotOptional } from '@/components/copilot/copilot-provider'
import type { CopilotViewMode } from '@/lib/copilot-types'

const MODES: { id: CopilotViewMode; label: string; hint: string }[] = [
  { id: 'workspace', label: 'Workspace', hint: 'Classic dashboard and pages' },
  { id: 'hybrid', label: 'Split', hint: 'Copilot beside your current page (Cursor-style)' },
  { id: 'copilot', label: 'Copilot', hint: 'Chat-first — ask, report, and run actions' },
]

type Props = {
  className?: string
  compact?: boolean
}

export function WorkspaceModeSwitcher({ className = '', compact = false }: Props) {
  if (!isCopilotEnabled()) {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900/40 px-3 py-1.5 text-xs text-slate-500 ${className}`}
        title="Copilot is not enabled on this deployment"
      >
        Workspace
      </div>
    )
  }

  const ctx = useCopilotOptional()
  if (!ctx) return null

  const { viewMode, setViewMode } = ctx

  return (
    <div
      className={`workspace-mode-switcher ${className}`}
      role="tablist"
      aria-label="Workspace view"
    >
      {MODES.map((mode) => {
        const active = viewMode === mode.id
        return (
          <button
            key={mode.id}
            type="button"
            role="tab"
            aria-selected={active}
            title={mode.hint}
            onClick={() => setViewMode(mode.id)}
            className={`workspace-mode-switcher__tab ${active ? 'workspace-mode-switcher__tab--active' : ''}`}
          >
            {compact && mode.id !== 'workspace' ? mode.label.slice(0, 1) : mode.label}
          </button>
        )
      })}
    </div>
  )
}
