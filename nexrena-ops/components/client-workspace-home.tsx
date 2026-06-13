'use client'

import type { PortalAccount } from '@/lib/portal-types'
import type { PortalDashboardStats } from '@/lib/portal-dashboard-utils'
import type { PortalActivityItem } from '@/lib/activity-utils'
import type { ClientPortalView } from '@/components/client-nav'
import { PortalAmbientOrbs } from '@/components/client-portal-visuals'
import { CLIENT_NAV_ICON } from '@/components/client-nav-icons'
import { CLIENT_NAV_ITEMS } from '@/components/client-nav'
import { ClientActivityFeed } from '@/components/client-activity-feed'
import { formatCurrency, formatDate } from '@/lib/store'
import { NexrenaLogo } from '@/components/nexrena-logo'

function timeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

type Props = {
  account: PortalAccount | null
  stats: PortalDashboardStats
  messageUnread: number
  formsNewCount: number
  activity: PortalActivityItem[]
  onNavigate: (view: ClientPortalView) => void
  onStartRequest: () => void
}

export function ClientWorkspaceHome({
  account,
  stats,
  messageUnread,
  formsNewCount,
  activity,
  onNavigate,
  onStartRequest,
}: Props) {
  const firstName = account?.name?.split(/\s+/)[0] ?? 'there'

  const alerts = [
    stats.outstandingBalance > 0
      ? { label: `${formatCurrency(stats.outstandingBalance)} due`, tone: 'gold' as const, action: () => onNavigate('billing') }
      : null,
    messageUnread > 0
      ? { label: `${messageUnread} new message${messageUnread === 1 ? '' : 's'}`, tone: 'sky' as const, action: () => onNavigate('messages') }
      : null,
    formsNewCount > 0
      ? { label: `${formsNewCount} new form lead${formsNewCount === 1 ? '' : 's'}`, tone: 'emerald' as const, action: () => onNavigate('forms') }
      : null,
    stats.pendingApprovalCount > 0
      ? { label: `${stats.pendingApprovalCount} estimate${stats.pendingApprovalCount === 1 ? '' : 's'} to review`, tone: 'slate' as const, action: () => onNavigate('requests') }
      : null,
  ].filter(Boolean) as Array<{ label: string; tone: 'gold' | 'sky' | 'emerald' | 'slate'; action: () => void }>

  const quickNav = CLIENT_NAV_ITEMS.filter((item) => item.id !== 'settings').slice(0, 8)

  const toneClass = {
    gold: 'border-gold/35 bg-gold/10 text-gold-light hover:bg-gold/15',
    sky: 'border-sky-400/30 bg-sky-500/10 text-sky-100 hover:bg-sky-500/15',
    emerald: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100 hover:bg-emerald-500/15',
    slate: 'border-slate-500/40 bg-slate-800/60 text-slate-200 hover:bg-slate-800',
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0e1218] p-6 md:p-8">
        <PortalAmbientOrbs />
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold/80 via-gold/40 to-transparent" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3 min-w-0">
            <div className="flex items-center gap-3">
              <NexrenaLogo size="sm" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/80">Client workspace</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl text-white tracking-tight">
              {timeGreeting()}, {firstName}
            </h2>
            {account?.company && (
              <p className="text-base text-slate-400">{account.company}</p>
            )}
            {stats.activeProjectName && (
              <p className="text-sm text-slate-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" aria-hidden />
                Active: {stats.activeProjectName}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('messages')}
              className="h-12 px-5 rounded-xl border border-gold/40 bg-gold/10 text-gold-light font-medium text-sm hover:bg-gold/20 transition-colors"
            >
              Message Nico
            </button>
            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className="h-12 px-5 rounded-xl border border-slate-600/50 bg-slate-800/40 text-white font-medium text-sm hover:bg-slate-800 transition-colors"
            >
              Browse shop
            </button>
            <button
              type="button"
              onClick={onStartRequest}
              className="h-12 px-5 rounded-xl bg-gold text-obsidian font-medium text-sm hover:bg-gold-light transition-colors"
            >
              New request
            </button>
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="relative mt-6 flex flex-wrap gap-2">
            {alerts.map((alert) => (
              <button
                key={alert.label}
                type="button"
                onClick={alert.action}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${toneClass[alert.tone]}`}
              >
                {alert.label}
              </button>
            ))}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <section className="lg:col-span-2 space-y-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Quick access</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickNav.map((item) => {
              const Icon = CLIENT_NAV_ICON[item.id]
              const badge =
                item.badge === 'messages' ? messageUnread : item.badge === 'forms' ? formsNewCount : 0
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className="group relative flex flex-col items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 text-left hover:border-gold/35 hover:bg-slate-900/70 transition-all"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/80 text-gold-light group-hover:bg-gold/10 transition-colors">
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="text-sm font-medium text-white leading-snug">{item.label}</span>
                  {badge > 0 && (
                    <span className="absolute top-3 right-3 min-w-[1.25rem] h-5 px-1.5 rounded-full bg-gold text-obsidian text-[10px] font-bold flex items-center justify-center">
                      {badge > 9 ? '9+' : badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Balance due</p>
              <p className="mt-1 font-serif text-2xl text-white tabular-nums">
                {formatCurrency(stats.outstandingBalance)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4">
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Next due</p>
              <p className="mt-1 font-serif text-2xl text-white">
                {stats.nextDueDate ? formatDate(stats.nextDueDate) : '—'}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500">Recent activity</h3>
          <div className="rounded-xl border border-slate-800/60 bg-slate-900/30 p-4 min-h-[200px]">
            <ClientActivityFeed items={activity.slice(0, 6)} compact />
          </div>
        </section>
      </div>
    </div>
  )
}
