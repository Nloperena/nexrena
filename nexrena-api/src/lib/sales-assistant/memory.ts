import type { ChatIntent, LeadIntakeState, SessionState } from './types'

const sessions = new Map<string, SessionState>()
const SESSION_TTL_MS = 24 * 60 * 60 * 1000
const emptyIntake = (): LeadIntakeState => ({ stage: 'none' })

export function getOrCreateSession(sessionId: string): SessionState {
  const existing = sessions.get(sessionId)
  if (existing && Date.now() - existing.updatedAt < SESSION_TTL_MS) {
    return existing
  }
  const state: SessionState = {
    sessionId,
    qualification: {},
    leadIntake: emptyIntake(),
    intentsSeen: [],
    turnCount: 0,
    updatedAt: Date.now(),
  }
  sessions.set(sessionId, state)
  return state
}

export function touchSession(state: SessionState, intent: ChatIntent): void {
  state.turnCount += 1
  state.lastIntent = intent
  if (!state.intentsSeen.includes(intent)) state.intentsSeen.push(intent)
  state.updatedAt = Date.now()
  sessions.set(state.sessionId, state)
}

export function saveSession(state: SessionState): void {
  state.updatedAt = Date.now()
  sessions.set(state.sessionId, state)
}
