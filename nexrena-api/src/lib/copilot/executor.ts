import { createHash } from 'crypto'
import { prisma } from '../prisma'
import type { CopilotContext, ToolExecutionContract } from './types'
import {
  encodeConfirmationToken,
  signConfirmationPayload,
  decodeConfirmationToken,
  verifyConfirmationPayload,
} from './confirmation'
import { executeTeamConfirmedAction } from './tools/team-write'

export function queueHighRiskAction(
  toolName: string,
  args: Record<string, unknown>,
): ToolExecutionContract {
  const payload = signConfirmationPayload(toolName, args)
  return {
    ok: true,
    pendingConfirmation: true,
    risk: 'high',
    confirmationToken: encodeConfirmationToken(payload),
    data: { toolName, summary: `${toolName} requires confirmation` },
  }
}

export async function executeConfirmedAction(
  token: string,
  ctx: CopilotContext,
): Promise<ToolExecutionContract> {
  const payload = decodeConfirmationToken(token)
  if (!payload || !verifyConfirmationPayload(payload)) {
    return { ok: false, error: 'Invalid or expired confirmation token' }
  }

  if (ctx.persona === 'team') {
    return executeTeamConfirmedAction(payload.toolName, payload.args, ctx)
  }
  return { ok: false, error: 'Confirmed actions not supported for this persona' }
}

export async function runConfirmedAction(
  ctx: CopilotContext,
  toolName: string,
  args: Record<string, unknown>,
  ok: boolean,
) {
  const argsHash = createHash('sha256').update(JSON.stringify(args)).digest('hex').slice(0, 16)
  try {
    await prisma.copilotActionLog.create({
      data: {
        persona: ctx.persona,
        userId: ctx.userId,
        toolName,
        argsHash,
        ok,
      },
    })
  } catch (err) {
    console.warn('[copilot] action log failed:', err)
  }
}
