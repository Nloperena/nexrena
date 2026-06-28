export type CopilotPersona = 'team' | 'client'

export interface CopilotContext {
  userId: string
  persona: CopilotPersona
  contactId?: string
  accountId?: string
  currentPath: string
}

export interface ToolExecutionContract<TData = unknown> {
  ok: boolean
  data?: TData
  uiPath?: string
  invalidatedPaths?: string[]
  error?: string
  risk?: 'low' | 'high'
  pendingConfirmation?: boolean
  confirmationToken?: string
}

export interface HighRiskConfirmationPayload {
  toolName: string
  args: Record<string, unknown>
  expiresAt: number
  signature: string
}

export type StreamEvent =
  | { type: 'token'; payload: string }
  | { type: 'tool-call'; payload: { toolCallId: string; toolName: string; args: unknown } }
  | { type: 'tool-result'; payload: { toolCallId: string; result: ToolExecutionContract } }
  | { type: 'error'; payload: string }
  | { type: 'done'; payload: null }

export const COPILOT_ROW_LIMIT = 20
export const COPILOT_STRING_MAX = 200
