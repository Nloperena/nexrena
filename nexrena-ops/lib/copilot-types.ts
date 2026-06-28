export type CopilotPersona = 'team' | 'client'

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

export function messageText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p) => p.type === 'text' && p.text)
    .map((p) => p.text!)
    .join('')
}

export function isToolPart(part: { type: string }): boolean {
  return part.type === 'dynamic-tool' || part.type.startsWith('tool-')
}
