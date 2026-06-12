'use client'

import { useEffect, useRef } from 'react'
import type { Contact, DealStage } from '@/lib/types'
import { formatCurrency } from '@/lib/store'
import { CrmContactCard } from '@/components/crm-contact-card'
import { CRM_PIPELINE_STAGES, formatStageLabel } from '@/lib/crm-stages'
import { MobileFilterChip, MobileFilterRow } from '@/components/mobile-filter-row'

type Props = {
  contacts: Contact[]
  highlightId?: string | null
  mobileStage: DealStage | 'all'
  onMobileStageChange: (stage: DealStage | 'all') => void
  onOpen: (contact: Contact) => void
}

function KanbanColumn({
  label,
  hint,
  accent,
  headerBg,
  contacts,
  highlightId,
  onOpen,
}: {
  label: string
  hint: string
  accent: string
  headerBg: string
  contacts: Contact[]
  highlightId?: string | null
  onOpen: (contact: Contact) => void
}) {
  const columnRef = useRef<HTMLDivElement>(null)
  const stageValue = contacts.reduce((sum, c) => sum + c.value, 0)

  useEffect(() => {
    if (!highlightId || !columnRef.current) return
    const el = columnRef.current.querySelector(`[data-contact-id="${highlightId}"]`)
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [highlightId, contacts.length])

  return (
    <div
      ref={columnRef}
      className="flex w-[min(100%,300px)] min-w-[260px] shrink-0 flex-col max-h-[calc(100dvh-15rem)] min-h-[280px] rounded-xl border border-slate-800/60 bg-slate-950/30"
    >
      <div className={`shrink-0 rounded-t-xl border-b px-4 py-3 ${headerBg}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className={`text-sm font-semibold ${accent}`}>{label}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>
          </div>
          <span className="text-xs text-slate-400 tabular-nums shrink-0">{contacts.length}</span>
        </div>
        {stageValue > 0 && (
          <p className="text-xs text-slate-400 tabular-nums mt-2">{formatCurrency(stageValue)}</p>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-2 space-y-2">
        {contacts.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-slate-600">No contacts</p>
        ) : (
          contacts.map((contact) => (
            <div key={contact.id} data-contact-id={contact.id}>
              <CrmContactCard
                contact={contact}
                highlighted={highlightId === contact.id}
                onOpen={onOpen}
                compact
              />
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function CrmPipelineBoard({
  contacts,
  highlightId,
  mobileStage,
  onMobileStageChange,
  onOpen,
}: Props) {
  const mobileListRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!highlightId || !mobileListRef.current) return
    const el = mobileListRef.current.querySelector(`[data-contact-id="${highlightId}"]`)
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [highlightId, mobileStage, contacts.length])

  const mobileContacts =
    mobileStage === 'all' ? contacts : contacts.filter((c) => c.stage === mobileStage)

  return (
    <>
      {/* Mobile + tablet: one stage at a time — no sideways scroll */}
      <div className="lg:hidden space-y-4">
        <MobileFilterRow>
          <MobileFilterChip active={mobileStage === 'all'} onClick={() => onMobileStageChange('all')}>
            All ({contacts.length})
          </MobileFilterChip>
          {CRM_PIPELINE_STAGES.map((stage) => {
            const count = contacts.filter((c) => c.stage === stage.id).length
            return (
              <MobileFilterChip
                key={stage.id}
                active={mobileStage === stage.id}
                onClick={() => onMobileStageChange(stage.id)}
              >
                {stage.label} ({count})
              </MobileFilterChip>
            )
          })}
        </MobileFilterRow>

        {mobileStage !== 'all' && (
          <p className="text-sm text-slate-400 px-1">
            {crmStageMetaLine(mobileStage)} ·{' '}
            {formatCurrency(mobileContacts.reduce((s, c) => s + c.value, 0))}
          </p>
        )}

        <div ref={mobileListRef} className="space-y-3">
          {mobileContacts.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">No contacts in this stage.</p>
          ) : (
            mobileContacts.map((contact) => (
              <div key={contact.id} data-contact-id={contact.id}>
                <CrmContactCard
                  contact={contact}
                  highlighted={highlightId === contact.id}
                  onOpen={onOpen}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Desktop: kanban with contained horizontal scroll + per-column vertical scroll */}
      <div className="hidden lg:block">
        <div className="crm-pipeline-scroll flex gap-4 overflow-x-auto overscroll-x-contain pb-3 -mx-1 px-1">
          {CRM_PIPELINE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              label={stage.label}
              hint={stage.hint}
              accent={stage.accent}
              headerBg={stage.headerBg}
              contacts={contacts.filter((c) => c.stage === stage.id)}
              highlightId={highlightId}
              onOpen={onOpen}
            />
          ))}
        </div>
      </div>
    </>
  )
}

function crmStageMetaLine(stage: DealStage): string {
  const meta = CRM_PIPELINE_STAGES.find((s) => s.id === stage)
  return meta ? `${meta.label} — ${meta.hint}` : formatStageLabel(stage)
}
