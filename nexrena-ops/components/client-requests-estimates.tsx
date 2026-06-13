'use client'

import type { PortalProposal } from '@/lib/portal-types'
import { formatDate } from '@/lib/store'
import { StatusChip, proposalStatusChip } from '@/components/status-chip'
import { portalSectionHintClass } from '@/lib/portal-a11y'
import { Btn } from '@/components/ui'

type Props = {
  proposals: PortalProposal[]
  onApproveViaMessage: () => void
}

export function ClientRequestsEstimates({ proposals, onApproveViaMessage }: Props) {
  return (
    <section
      aria-labelledby="estimates-heading"
      className="rounded-xl border-2 border-gold/35 bg-gradient-to-br from-gold/[0.12] via-[#1a1f27] to-[#141820] p-5 sm:p-6 shadow-[0_4px_24px_rgba(201,169,110,0.12)]"
    >
      <h3 id="estimates-heading" className="font-serif text-xl text-white sm:text-2xl">
        Estimates &amp; approvals
      </h3>
      <p className={`${portalSectionHintClass} mt-2 text-base sm:text-lg`}>
        Review quotes and approve work before we begin.
      </p>

      {proposals.length === 0 ? (
        <p className="mt-4 text-base text-slate-400">No estimates pending right now.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {proposals.map((p) => {
            const chip = proposalStatusChip(p.status, p.validUntil)
            const canApprove =
              p.status === 'sent' && new Date(p.validUntil) >= new Date()

            return (
              <li
                key={p.id}
                className="rounded-xl border border-slate-700/50 bg-[#141820]/80 p-4 sm:p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-serif text-lg text-white">{p.title}</p>
                      {chip && <StatusChip variant={chip} />}
                    </div>
                    <p className="mt-1 text-base text-slate-400">
                      Valid until {formatDate(p.validUntil)}
                    </p>
                  </div>
                  {canApprove && (
                    <Btn size="sm" variant="ghost" onClick={onApproveViaMessage}>
                      Approve via message
                    </Btn>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
