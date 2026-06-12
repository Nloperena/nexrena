'use client'

import type { Contact, DealStage } from '@/lib/types'
import { formatCurrency } from '@/lib/store'
import { Badge, Btn, EmptyState, SectionCard } from '@/components/ui'
import { CrmContactCard } from '@/components/crm-contact-card'
import { contactInitials, formatStageLabel } from '@/lib/crm-stages'
import { MobileFilterChip, MobileFilterRow } from '@/components/mobile-filter-row'

type Props = {
  contacts: Contact[]
  highlightId?: string | null
  stageFilter: DealStage | 'all'
  onStageFilterChange: (stage: DealStage | 'all') => void
  onOpen: (contact: Contact) => void
  onDelete: (id: string) => void
}

const STAGE_OPTIONS: (DealStage | 'all')[] = [
  'all',
  'lead',
  'contacted',
  'discovery',
  'proposal',
  'negotiation',
  'won',
  'lost',
]

export function CrmContactList({
  contacts,
  highlightId,
  stageFilter,
  onStageFilterChange,
  onOpen,
  onDelete,
}: Props) {
  const filtered =
    stageFilter === 'all' ? contacts : contacts.filter((c) => c.stage === stageFilter)

  return (
    <div className="space-y-4">
      <MobileFilterRow>
        {STAGE_OPTIONS.map((stage) => {
          const count =
            stage === 'all'
              ? contacts.length
              : contacts.filter((c) => c.stage === stage).length
          return (
            <MobileFilterChip
              key={stage}
              active={stageFilter === stage}
              onClick={() => onStageFilterChange(stage)}
            >
              {stage === 'all' ? `All (${count})` : `${formatStageLabel(stage)} (${count})`}
            </MobileFilterChip>
          )
        })}
      </MobileFilterRow>

      <div className="lg:hidden space-y-3">
        {filtered.length === 0 ? (
          <EmptyState message="No contacts match your filters." />
        ) : (
          filtered.map((contact) => (
            <CrmContactCard
              key={contact.id}
              contact={contact}
              highlighted={highlightId === contact.id}
              onOpen={onOpen}
              onDelete={onDelete}
            />
          ))
        )}
      </div>

      <SectionCard className="hidden lg:block">
        {filtered.length === 0 ? (
          <EmptyState message="No contacts match your filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="nx-table w-full">
              <thead>
                <tr>
                  {['Contact', 'Company', 'Industry', 'Stage', 'Value', 'Email', ''].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`group ${highlightId === contact.id ? 'bg-gold/5' : ''}`}
                  >
                    <td>
                      <button
                        type="button"
                        onClick={() => onOpen(contact)}
                        className="flex items-center gap-2.5 text-left hover:text-gold transition-colors"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800/50 border border-slate-700/30 text-[10px] font-bold text-slate-400">
                          {contactInitials(contact.name)}
                        </span>
                        <span className="text-white font-medium">{contact.name}</span>
                      </button>
                    </td>
                    <td>{contact.company}</td>
                    <td className="capitalize">{contact.industry}</td>
                    <td>
                      <Badge label={formatStageLabel(contact.stage)} />
                    </td>
                    <td className="text-gold tabular-nums font-medium">
                      {formatCurrency(contact.value)}
                    </td>
                    <td className="text-slate-400">{contact.email}</td>
                    <td>
                      <div className="flex gap-1.5">
                        <Btn size="sm" variant="ghost" onClick={() => onOpen(contact)}>
                          Edit
                        </Btn>
                        <Btn size="sm" variant="danger" onClick={() => onDelete(contact.id)}>
                          Delete
                        </Btn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SectionCard>
    </div>
  )
}
