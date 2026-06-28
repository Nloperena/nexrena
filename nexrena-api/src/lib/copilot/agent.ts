import { openai } from '@ai-sdk/openai'
import type { Response } from 'express'
import {
  streamText,
  convertToModelMessages,
  toUIMessageStream,
  isStepCount,
  pipeUIMessageStreamToResponse,
  type UIMessage,
} from 'ai'
import type { CopilotContext } from './types'
import { buildTeamSystemPrompt, buildClientSystemPrompt } from './prompts'
import { getTeamTools, getClientTools } from './tools'

const MAX_STEPS = 5

export function isCopilotConfigured(): boolean {
  return Boolean(process.env.OPENAI_API_KEY?.trim())
}

export async function streamCopilotToExpress(
  res: Response,
  ctx: CopilotContext,
  messages: UIMessage[],
) {
  if (!isCopilotConfigured()) {
    res.status(503).json({ error: 'OPENAI_API_KEY is not configured' })
    return
  }

  const tools = ctx.persona === 'team' ? getTeamTools(ctx) : getClientTools(ctx)
  const system =
    ctx.persona === 'team'
      ? await buildTeamSystemPrompt(ctx)
      : await buildClientSystemPrompt(ctx)

  const modelMessages = await convertToModelMessages(messages)
  const model = openai(process.env.OPS_COPILOT_MODEL?.trim() || process.env.OPENAI_MODEL?.trim() || 'gpt-4o')

  const result = streamText({
    model,
    system,
    messages: modelMessages,
    tools,
    stopWhen: isStepCount(MAX_STEPS),
  })

  pipeUIMessageStreamToResponse({
    response: res,
    stream: toUIMessageStream({ stream: result.stream, tools }),
  })
}
