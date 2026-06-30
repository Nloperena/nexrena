export type CopilotPersona = 'team' | 'client'

export type CopilotViewMode = 'workspace' | 'hybrid' | 'copilot'

export type CopilotThread = {
  id: string
  title: string
  updatedAt: string
  preview: string | null
}

export type ToolExecutionResult = {
  ok: boolean
  data?: unknown
  uiPath?: string
  invalidatedPaths?: string[]
  error?: string
  risk?: 'low' | 'high'
  pendingConfirmation?: boolean
  confirmationToken?: string
}

export const COPILOT_INTAKE_KEY = 'nx-copilot-intake-done'
export const COPILOT_VIEW_MODE_KEY = 'nx-copilot-view-mode'

export function parseCopilotViewMode(value: string | null): CopilotViewMode {
  if (value === 'hybrid' || value === 'copilot') return value
  return 'workspace'
}

export function activeThreadStorageKey(persona: CopilotPersona): string {
  return `nx-copilot-active-thread-${persona}`
}

export function messageText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text!)
    .join('')
}

export function isToolPart(part: { type: string }): boolean {
  return part.type === 'dynamic-tool' || part.type.startsWith('tool-')
}
