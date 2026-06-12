'use client'

import { useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import type { Subscription, SubscriptionStatus } from '@/lib/types'
import { formatCurrency, formatDate } from '@/lib/store'
import { Badge, Btn } from '@/components/ui'
import { Card } from '@/components/design-system'
import { teamFocusRing } from '@/lib/team-a11y'
import { readExpandedClientGroups, writeExpandedClientGroups } from '@/lib/subscriptions-view-url'

type ClientGroup = {
  contactId: string
  name: string
  company?: string
  subscriptions: Subscription[]
}

type Props = {
  subscriptions: Subscription[]
  filter: 'all' | SubscriptionStatus
  today: string
  onEdit: (sub: Subscription) => void
  onTogglePause: (sub: Subscription) => void
  onToggleSkip: (sub: Subscription) => void
  onRemove: (id: string) => void
}

function intervalLabel(interval: string) {
  return interval.charAt(0).toUpperCase() + interval.slice(1)
}

function clientMRR(subs: Subscription[]) {
  return subs
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => {
      if (s.interval === 'monthly') return sum + s.amount
      if (s.interval === 'quarterly') return sum + s.amount / 3
      if (s.interval === 'annually') return sum + s.amount / 12
      return sum
    }, 0)
}

function groupByClient(subscriptions: Subscription[]): ClientGroup[] {
  const map = new Map<string, ClientGroup>()

  for (const sub of subscriptions) {
    const key = sub.contactId || 'unassigned'
    const existing = map.get(key)
    if (existing) {
      existing.subscriptions.push(sub)
      continue
    }
    map.set(key, {
      contactId: key,
      name: sub.contactName || 'Unassigned client',
      company: sub.contactCompany,
      subscriptions: [sub],
    })
  }

  return Array.from(map.values()).sort((a, b) => {
    const aLabel = (a.company || a.name).toLowerCase()
    const bLabel = (b.company || b.name).toLowerCase()
    return aLabel.localeCompare(bLabel)
  })
}

function SubscriptionRow({
  sub,
  today,
  onEdit,
  onTogglePause,
  onToggleSkip,
  onRemove,
}: {
  sub: Subscription
  today: string
  onEdit: (sub: Subscription) => void
  onTogglePause: (sub: Subscription) => void
  onToggleSkip: (sub: Subscription) => void
  onRemove: (id: string) => void
}) {
  const due = sub.nextBillingDate <= today && sub.status === 'active'

  return (
    <tr className="border-b border-slate-800/40 last:border-0 hover:bg-slate-800/20 transition-colors group">
      <td className="px-4 py-3 text-sm text-slate-300">{sub.description}</td>
      <td className="px-4 py-3 text-sm text-gold font-medium tabular-nums">{formatCurrency(sub.amount)}</td>
      <td className="px-4 py-3"><Badge label={sub.interval} /></td>
      <td className="px-4 py-3">
        <p className={`text-sm tabular-nums ${due ? 'text-amber-400' : 'text-slate-400'}`}>
          {formatDate(sub.nextBillingDate)}
        </p>
        {sub.skipNext && <p className="text-[10px] text-slate-600 mt-0.5">Skipping next cycle</p>}
      </td>
      <td className="px-4 py-3"><Badge label={sub.status} /></td>
      <td className="px-4 py-3">
        <SubscriptionActions
          sub={sub}
          onEdit={onEdit}
          onTogglePause={onTogglePause}
          onToggleSkip={onToggleSkip}
          onRemove={onRemove}
          className="opacity-100 md:opacity-0 md:group-hover:opacity-100"
        />
      </td>
    </tr>
  )
}

function SubscriptionCard({
  sub,
  today,
  onEdit,
  onTogglePause,
  onToggleSkip,
  onRemove,
}: {
  sub: Subscription
  today: string
  onEdit: (sub: Subscription) => void
  onTogglePause: (sub: Subscription) => void
  onToggleSkip: (sub: Subscription) => void
  onRemove: (id: string) => void
}) {
  const due = sub.nextBillingDate <= today && sub.status === 'active'

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{sub.description}</p>
          <p className="text-lg text-gold tabular-nums mt-1">{formatCurrency(sub.amount)}</p>
        </div>
        <Badge label={sub.status} />
      </div>
      <div className="flex flex-wrap gap-2 text-xs text-slate-400">
        <span>{intervalLabel(sub.interval)}</span>
        <span>·</span>
        <span className={due ? 'text-amber-400' : ''}>Next {formatDate(sub.nextBillingDate)}</span>
        {sub.skipNext && <span className="text-slate-500">· Skipping next</span>}
      </div>
      <SubscriptionActions
        sub={sub}
        onEdit={onEdit}
        onTogglePause={onTogglePause}
        onToggleSkip={onToggleSkip}
        onRemove={onRemove}
      />
    </Card>
  )
}

function SubscriptionActions({
  sub,
  onEdit,
  onTogglePause,
  onToggleSkip,
  onRemove,
  className = '',
}: {
  sub: Subscription
  onEdit: (sub: Subscription) => void
  onTogglePause: (sub: Subscription) => void
  onToggleSkip: (sub: Subscription) => void
  onRemove: (id: string) => void
  className?: string
}) {
  return (
    <div className={`flex flex-wrap items-center gap-2 transition-opacity ${className}`}>
      <Btn size="sm" variant="ghost" onClick={() => onEdit(sub)}>Edit</Btn>
      {sub.status !== 'cancelled' && (
        <Btn size="sm" variant="ghost" onClick={() => onTogglePause(sub)}>
          {sub.status === 'active' ? 'Pause' : 'Resume'}
        </Btn>
      )}
      {sub.status === 'active' && (
        <Btn size="sm" variant="ghost" onClick={() => onToggleSkip(sub)}>
          {sub.skipNext ? 'Unskip' : 'Skip next'}
        </Btn>
      )}
      <Btn size="sm" variant="danger" onClick={() => onRemove(sub.id)}>Delete</Btn>
    </div>
  )
}

function ClientGroupPanel({
  group,
  open,
  onToggle,
  today,
  onEdit,
  onTogglePause,
  onToggleSkip,
  onRemove,
}: {
  group: ClientGroup
  open: boolean
  onToggle: () => void
  today: string
  onEdit: (sub: Subscription) => void
  onTogglePause: (sub: Subscription) => void
  onToggleSkip: (sub: Subscription) => void
  onRemove: (id: string) => void
}) {
  const activeCount = group.subscriptions.filter((s) => s.status === 'active').length
  const mrr = clientMRR(group.subscriptions)
  const displayName = group.company || group.name

  return (
    <section className="rounded-xl border border-slate-800/60 bg-slate-950/40 overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-slate-800/25 transition-colors ${teamFocusRing}`}
      >
        <span
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          ▾
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-white truncate">{displayName}</p>
          {group.company && group.name && (
            <p className="text-sm text-slate-500 truncate">{group.name}</p>
          )}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-sm text-gold tabular-nums">{formatCurrency(mrr)}/mo</p>
          <p className="text-xs text-slate-500">
            {group.subscriptions.length} sub{group.subscriptions.length !== 1 ? 's' : ''}
            {activeCount > 0 && ` · ${activeCount} active`}
          </p>
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-800/60">
          {group.contactId !== 'unassigned' && (
            <div className="px-4 py-2 border-b border-slate-800/40 bg-slate-900/30">
              <Link href={`/crm?highlight=${group.contactId}`} className="text-xs text-gold hover:underline">
                View in CRM →
              </Link>
            </div>
          )}

          <div className="md:hidden p-3 space-y-3">
            {group.subscriptions.map((sub) => (
              <SubscriptionCard
                key={sub.id}
                sub={sub}
                today={today}
                onEdit={onEdit}
                onTogglePause={onTogglePause}
                onToggleSkip={onToggleSkip}
                onRemove={onRemove}
              />
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800/60 bg-slate-900/20">
                  {['Description', 'Amount', 'Interval', 'Next Billing', 'Status', ''].map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-[10px] text-slate-500 tracking-[0.15em] uppercase font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {group.subscriptions.map((sub) => (
                  <SubscriptionRow
                    key={sub.id}
                    sub={sub}
                    today={today}
                    onEdit={onEdit}
                    onTogglePause={onTogglePause}
                    onToggleSkip={onToggleSkip}
                    onRemove={onRemove}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}

export function ClientSubscriptionGroups({
  subscriptions,
  filter,
  today,
  onEdit,
  onTogglePause,
  onToggleSkip,
  onRemove,
}: Props) {
  const filtered = useMemo(
    () => subscriptions.filter((s) => (filter === 'all' ? true : s.status === filter)),
    [subscriptions, filter],
  )

  const groups = useMemo(() => groupByClient(filtered), [filtered])

  const [clientFilter, setClientFilter] = useState('')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setExpanded(readExpandedClientGroups())
  }, [])

  useEffect(() => {
    writeExpandedClientGroups(expanded)
  }, [expanded])

  const visibleGroups = clientFilter
    ? groups.filter((g) => g.contactId === clientFilter)
    : groups

  const toggleGroup = (contactId: string) => {
    setExpanded((prev) => ({ ...prev, [contactId]: !prev[contactId] }))
  }

  const isOpen = (contactId: string) => {
    if (contactId in expanded) return expanded[contactId]
    return visibleGroups.length <= 3
  }

  return (
    <div className="space-y-4">
      {groups.length > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <label htmlFor="subscription-client-filter" className="text-sm text-slate-400 shrink-0">
            Jump to client
          </label>
          <select
            id="subscription-client-filter"
            value={clientFilter}
            onChange={(e) => {
              const id = e.target.value
              setClientFilter(id)
              if (id) setExpanded((prev) => ({ ...prev, [id]: true }))
            }}
            className="w-full sm:max-w-xs rounded-xl border-2 border-slate-600 bg-[#1a2332] px-4 py-2.5 text-sm text-white focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/60 min-h-[44px]"
          >
            <option value="">All clients ({groups.length})</option>
            {groups.map((g) => (
              <option key={g.contactId} value={g.contactId}>
                {g.company || g.name} ({g.subscriptions.length})
              </option>
            ))}
          </select>
          {clientFilter && (
            <button
              type="button"
              onClick={() => setClientFilter('')}
              className="text-sm text-slate-400 hover:text-white"
            >
              Clear filter
            </button>
          )}
        </div>
      )}

      <div className="space-y-3 stagger">
        {visibleGroups.map((group) => (
          <ClientGroupPanel
            key={group.contactId}
            group={group}
            open={isOpen(group.contactId)}
            onToggle={() => toggleGroup(group.contactId)}
            today={today}
            onEdit={onEdit}
            onTogglePause={onTogglePause}
            onToggleSkip={onToggleSkip}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  )
}
