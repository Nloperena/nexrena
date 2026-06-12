'use client'



import type { PortalAccount } from '@/lib/portal-types'

import type { PortalDashboardStats } from '@/lib/portal-dashboard-utils'

import { formatCurrency } from '@/lib/store'

import { Button } from '@/components/design-system'

import { typography } from '@/lib/design-tokens'



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



  return (

    <section className="rounded-2xl border border-slate-600/40 bg-gradient-to-br from-[#141820] to-[#0e1116] p-5 sm:p-6 space-y-5 animate-fade-in-up">

      <div>

        <p className="text-sm text-gold-light font-medium">Your workspace</p>

        <h2 className="font-serif text-2xl sm:text-3xl text-white tracking-tight mt-1">

          {timeGreeting()}, {firstName}

        </h2>

        {account?.company && (

          <p className={`${typography.hint} mt-1 text-slate-300`}>{account.company}</p>

        )}

      </div>



      <div className="flex flex-wrap gap-2">

        {stats.activeProjectName && (

          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-100">

            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden />

            {stats.activeProjectName}

          </span>

        )}

        {stats.outstandingBalance > 0 && (

          <span className="rounded-full border border-gold/35 bg-gold/10 px-3 py-1.5 text-sm text-gold-light">

            {formatCurrency(stats.outstandingBalance)} due

          </span>

        )}

        {stats.pendingApprovalCount > 0 && (

          <span className="rounded-full border border-slate-500/50 bg-slate-800/60 px-3 py-1.5 text-sm text-slate-200">

            {stats.pendingApprovalCount} to review

          </span>

        )}

        {messageUnread > 0 && (

          <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1.5 text-sm text-sky-100">

            {messageUnread} new

          </span>

        )}

      </div>



      {onStartRequest && (

        <Button size="lg" onClick={onStartRequest}>

          Start a request

        </Button>

      )}

    </section>

  )

}


