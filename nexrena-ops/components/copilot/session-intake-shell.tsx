'use client'

import { useCopilot } from './copilot-provider'
import type { CopilotPersona } from '@/lib/copilot-types'

const TEAM_CHIPS = ['Unread messages', 'New leads this week', "Today's pipeline"]
const CLIENT_CHIPS = ['Balance due', 'Create new request', 'Message Nico']

export function SessionIntakeShell({ persona }: { persona: CopilotPersona }) {
  const { showIntake, setIntakeDone, input, handleInputChange, handleSubmit, sendChip } = useCopilot()

  if (!showIntake) return null

  const chips = persona === 'team' ? TEAM_CHIPS : CLIENT_CHIPS
  const headline =
    persona === 'team'
      ? 'What are you working on today?'
      : 'What do you need from your workspace?'

  return (
    <div className="copilot-intake">
      <div className="copilot-intake__inner">
        <h1 className="copilot-intake__headline">{headline}</h1>

        <form
          onSubmit={(e) => {
            handleSubmit(e)
            setIntakeDone()
          }}
          className="copilot-intake__form"
        >
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Ask anything or request workspace updates…"
            className="copilot-intake__textarea"
          />
          <div className="copilot-intake__actions">
            <button type="button" onClick={setIntakeDone} className="copilot-intake__skip">
              Skip straight to workspace →
            </button>
            <button
              type="submit"
              className="copilot-intake__execute"
              onClick={() => setIntakeDone()}
            >
              Execute
            </button>
          </div>
        </form>

        <div className="copilot-intake__chips">
          {chips.map((chipText) => (
            <button
              key={chipText}
              type="button"
              onClick={() => {
                sendChip(chipText)
                setIntakeDone()
              }}
              className="copilot-intake__chip"
            >
              {chipText}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
