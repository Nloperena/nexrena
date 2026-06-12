'use client'

import type { Contact } from '@/lib/types'
import { formatCurrency } from '@/lib/store'
import { Card } from '@/components/design-system'
import { Btn } from '@/components/ui'
import { contactInitials, crmStageMeta, formatStageLabel } from '@/lib/crm-stages'

type Props = {
  contact: Contact
  highlighted?: boolean
  onOpen: (contact: Contact) => void
  onDelete?: (id: string) => void
  compact?: boolean
}

export function CrmContactCard({
  contact,
  highlighted = false,
  onOpen,
  onDelete,
  compact = false,
}: Props) {
  const stage = crmStageMeta(contact.stage)

  return (
    <Card
      padding
      className={`w-full transition-shadow ${
        highlighted ? 'ring-2 ring-gold/70 shadow-[0_0_24px_rgba(201,169,110,0.2)]' : ''
      }`}
    >
      <button type="button" onClick={() => onOpen(contact)} className="w-full text-left">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-800/80 border border-slate-700/50 text-xs font-bold text-slate-300">
            {contactInitials(contact.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{contact.name}</p>
            <p className="text-sm text-slate-400 truncate">{contact.company}</p>
            {!compact && contact.email && (
              <p className="text-xs text-slate-500 truncate mt-1">{contact.email}</p>
            )}
          </div>
          <span className={`text-xs font-semibold tabular-nums shrink-0 ${stage.accent}`}>
            {formatCurrency(contact.value)}
          </span>
        </div>
      </button>

      <div className="mt-3 pt-3 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className={`rounded-lg px-2 py-1 border ${stage.headerBg} ${stage.accent}`}>
            {formatStageLabel(contact.stage)}
          </span>
          <span className="text-slate-500 capitalize">{contact.industry}</span>
        </div>
        {onDelete && (
          <Btn size="sm" variant="danger" onClick={() => onDelete(contact.id)}>
            Delete
          </Btn>
        )}
      </div>
    </Card>
  )
}
