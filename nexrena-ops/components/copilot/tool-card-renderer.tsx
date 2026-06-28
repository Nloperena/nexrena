'use client'

import { useState } from 'react'
import type { ToolExecutionResult } from '@/lib/copilot-types'
import { isToolPart } from '@/lib/copilot-types'
import { useCopilot } from './copilot-provider'

type ToolPart = {
  type: string
  toolCallId?: string
  toolName?: string
  state?: string
  input?: unknown
  output?: ToolExecutionResult
  errorText?: string
}

function labelForTool(type: string, toolName?: string): string {
  if (toolName) return toolName.replace(/_/g, ' ')
  return type.replace(/^tool-/, '').replace(/_/g, ' ')
}

export function ToolCardRenderer({ part }: { part: ToolPart }) {
  const { confirmAction } = useCopilot()
  const [confirming, setConfirming] = useState(false)
  const [confirmError, setConfirmError] = useState('')

  if (!isToolPart(part)) return null

  const name = labelForTool(part.type, part.toolName)
  const state = part.state ?? 'input-streaming'
  const output = part.output

  if (state === 'input-streaming' || state === 'input-available') {
    return (
      <div className="copilot-tool-card copilot-tool-card--pending">
        <span className="copilot-tool-card__spinner" aria-hidden />
        Running {name}…
      </div>
    )
  }

  if (output?.pendingConfirmation && output.confirmationToken) {
    return (
      <div className="copilot-tool-card copilot-tool-card--confirm">
        <p className="font-medium text-amber-200">Confirm: {name}</p>
        <p className="text-xs text-slate-400 mt-1">This action requires your approval.</p>
        {confirmError && <p className="text-xs text-red-400 mt-1">{confirmError}</p>}
        <div className="flex gap-2 mt-3">
          <button
            type="button"
            disabled={confirming}
            onClick={async () => {
              setConfirming(true)
              setConfirmError('')
              const result = await confirmAction(output.confirmationToken!)
              if (!result.ok) setConfirmError(result.error ?? 'Confirmation failed')
              setConfirming(false)
            }}
            className="rounded-lg bg-amber-600/90 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-500 disabled:opacity-50"
          >
            {confirming ? 'Running…' : 'Confirm'}
          </button>
        </div>
      </div>
    )
  }

  if (state === 'output-error' || output?.ok === false) {
    return (
      <div className="copilot-tool-card copilot-tool-card--error">
        {name} failed: {output?.error ?? part.errorText ?? 'Unknown error'}
      </div>
    )
  }

  if (state === 'output-available' && output?.ok) {
    return (
      <div className="copilot-tool-card copilot-tool-card--success">
        <span className="text-emerald-400">✓</span> {name}
        {output.uiPath && (
          <span className="text-xs text-slate-500 ml-2">→ workspace updated</span>
        )}
      </div>
    )
  }

  return null
}

export function MessageToolParts({ parts }: { parts: ToolPart[] }) {
  return (
    <>
      {parts.filter(isToolPart).map((part, i) => (
        <ToolCardRenderer key={part.toolCallId ?? `${part.type}-${i}`} part={part} />
      ))}
    </>
  )
}
