import type { CopilotContext } from '../types'
import { buildTeamReadTools } from './team-read'
import { buildTeamWriteTools } from './team-write'
import { buildClientReadTools } from './client-read'
import { buildClientWriteTools } from './client-write'

export function getTeamTools(ctx: CopilotContext) {
  return {
    ...buildTeamReadTools(ctx),
    ...buildTeamWriteTools(ctx),
  }
}

export function getClientTools(ctx: CopilotContext) {
  return {
    ...buildClientReadTools(ctx),
    ...buildClientWriteTools(ctx),
  }
}
