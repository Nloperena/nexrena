'use client'

import type { PortalAccount } from '@/lib/portal-types'
import type { PortalDashboardStats } from '@/lib/portal-dashboard-utils'
import { formatCurrency } from '@/lib/store'
import { PortalAmbientOrbs, IconGlobe } from '@/components/client-portal-visuals'
import { Btn } from '@/components/ui'

function timeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

type Props = {
  account: PortalAccount | null
  stats: PortalDashboardStats
  messageUnread?: number
  onStartRequest?: () => void
}

export function ClientDashboardHero({ account, stats, messageUnread = 0, onStartRequest }: Props) {
  const firstName = account?.name?.split(/\s+/)[0] ?? 'there'
  const company = account?.company

  return (
    <section className="relative overflow-hidden rounded-2xl border border-slate-800/60 bg-gradient-to-br from-slate-900/90 via-[#151922] to-obsidian p-6 sm:p-8">
      <PortalAmbientOrbs />

      <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
        <div className="min-w-0 space-y-4">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gold/80">Your workspace</p>
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-white tracking-tight">
              {timeGreeting()}, {firstName}
            </h2>
            {company && (
              <p className="text-sm text-slate-400 mt-1">{company}</p>
            )}
          </div>
          <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
            Everything for your site, billing, and projects lives here. Message Nico anytime or
            send a quick request when you need something done.
          </p>

          <div className="flex flex-wrap gap-2">
            {stats.activeProjectName && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300/90">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {stats.activeProjectName}
              </span>
            )}
            {stats.outstandingBalance > 0 && (
              <span className="rounded-full border border-gold/20 bg-gold/10 px-3 py-1 text-xs text-gold">
                {formatCurrency(stats.outstandingBalance)} due
              </span>
            )}
            {stats.pendingApprovalCount > 0 && (
              <span className="rounded-full border border-slate-700 bg-slate-800/60 px-3 py-1 text-xs text-slate-300">
                {stats.pendingApprovalCount} estimate{stats.pendingApprovalCount > 1 ? 's' : ''} to review
              </span>
            )}
            {messageUnread > 0 && (
              <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
                {messageUnread} unread message{messageUnread > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        <div className="relative shrink-0 flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3">
          <div className="hidden sm:flex lg:flex h-24 w-24 items-center justify-center rounded-2xl border border-gold/15 bg-gold/[0.06] text-gold/70 shadow-[0_0_40px_rgba(201,169,110,0.08)]">
            <IconGlobe className="w-10 h-10" />
          </div>
          {onStartRequest && (
            <Btn size="sm" onClick={onStartRequest}>
              Start a request
            </Btn>
          )}
        </div>
      </div>
    </section>
  )
}
