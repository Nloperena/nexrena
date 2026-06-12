import type { DealStage } from '@/lib/types'

export type CrmStageMeta = {
  id: DealStage
  label: string
  hint: string
  accent: string
  headerBg: string
}

export const CRM_PIPELINE_STAGES: CrmStageMeta[] = [
  {
    id: 'lead',
    label: 'Lead',
    hint: 'New inbound or referral',
    accent: 'text-blue-400',
    headerBg: 'bg-blue-500/10 border-blue-500/25',
  },
  {
    id: 'contacted',
    label: 'Contacted',
    hint: 'Initial outreach sent',
    accent: 'text-cyan-400',
    headerBg: 'bg-cyan-500/10 border-cyan-500/25',
  },
  {
    id: 'discovery',
    label: 'Discovery',
    hint: 'Scoping call or audit',
    accent: 'text-violet-400',
    headerBg: 'bg-violet-500/10 border-violet-500/25',
  },
  {
    id: 'proposal',
    label: 'Proposal',
    hint: 'Quote or SOW out',
    accent: 'text-gold',
    headerBg: 'bg-gold/10 border-gold/30',
  },
  {
    id: 'negotiation',
    label: 'Negotiation',
    hint: 'Terms and pricing',
    accent: 'text-amber-400',
    headerBg: 'bg-amber-500/10 border-amber-500/25',
  },
  {
    id: 'won',
    label: 'Won',
    hint: 'Signed and active',
    accent: 'text-emerald-400',
    headerBg: 'bg-emerald-500/10 border-emerald-500/25',
  },
  {
    id: 'lost',
    label: 'Lost',
    hint: 'Closed — no deal',
    accent: 'text-slate-400',
    headerBg: 'bg-slate-700/30 border-slate-600/40',
  },
]

export const CRM_STAGE_IDS = CRM_PIPELINE_STAGES.map((s) => s.id)

export function crmStageMeta(stage: DealStage): CrmStageMeta {
  return CRM_PIPELINE_STAGES.find((s) => s.id === stage) ?? CRM_PIPELINE_STAGES[0]
}

export function formatStageLabel(stage: DealStage): string {
  return crmStageMeta(stage).label
}

export function isOpenPipelineStage(stage: DealStage): boolean {
  return stage !== 'won' && stage !== 'lost'
}

export function contactInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}
