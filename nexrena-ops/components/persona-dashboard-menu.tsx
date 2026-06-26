'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-gate'
import { PortalAmbientOrbs } from '@/components/client-portal-visuals'
import { NexrenaLogo } from '@/components/nexrena-logo'
import { useFormSubmissions } from '@/lib/form-submissions-context'
import {
  useInvoices,
  useMessages,
  useProjects,
  useProposals,
  formatCurrency,
  invoiceTotal,
} from '@/lib/store'
import { PORTAL_IMAGES } from '@/lib/portal-imagery'
import {
  TEAM_ADMIN_NAV,
  TEAM_BILLING_NAV,
  TEAM_CLIENTS_NAV,
  TEAM_WORK_NAV,
  type TeamNavItem,
} from '@/lib/team-nav'

type MenuCategory = {
  id: string
  label: string
  tagline: string
  items: TeamNavItem[]
}

const FLAVOR: Record<string, string> = {
  '/projects': 'Track delivery & milestones',
  '/service-requests': 'Client support queue',
  '/safety-warnings': 'Site hazard notices',
  '/proposals': 'Quotes awaiting reply',
  '/leads': 'Pipeline opportunities',
  '/form-submissions': 'Website intake forms',
  '/ai-chats': 'Sales assistant transcripts',
  '/invoices': 'Billing & payments',
  '/subscriptions': 'Recurring revenue',
  '/expenses': 'Costs & receipts',
  '/messages': 'Client conversations',
  '/client-files': 'Shared deliverables',
  '/client-resources': 'Hosted properties',
  '/portal-accounts': 'Login credentials',
  '/crm': 'Contacts & relationships',
  '/reports': 'Analytics & P&L',
}

const CATEGORIES: MenuCategory[] = [
  { id: 'work', label: 'Work', tagline: 'Delivery', items: TEAM_WORK_NAV },
  { id: 'billing', label: 'Billing', tagline: 'Finance', items: TEAM_BILLING_NAV },
  { id: 'clients', label: 'Clients', tagline: 'Accounts', items: TEAM_CLIENTS_NAV },
  { id: 'admin', label: 'Admin', tagline: 'Intel', items: TEAM_ADMIN_NAV },
]

function formatClock(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function PersonaDashboardMenu() {
  const router = useRouter()
  const { teamDisplayName } = useAuth()
  const { invoices } = useInvoices()
  const { threads, unreadCount } = useMessages()
  const { projects } = useProjects()
  const { proposals } = useProposals()
  const { newCount: formsNewCount } = useFormSubmissions()

  const [categoryIndex, setCategoryIndex] = useState(0)
  const [itemIndex, setItemIndex] = useState(0)
  const [flashKey, setFlashKey] = useState(0)

  const category = CATEGORIES[categoryIndex]
  const items = category.items

  const badgeFor = useCallback(
    (item: TeamNavItem) => {
      if (item.badge === 'messages') return unreadCount
      if (item.badge === 'forms') return formsNewCount
      return 0
    },
    [formsNewCount, unreadCount],
  )

  const stats = useMemo(() => {
    const now = new Date()
    const isOverdue = (inv: (typeof invoices)[0]) =>
      inv.status === 'sent' && new Date(inv.dueDate) < now

    const outstanding = invoices
      .filter((i) => i.status === 'sent' || i.status === 'overdue' || isOverdue(i))
      .reduce((s, i) => s + invoiceTotal(i), 0)
    const activeProjects = projects.filter((p) => !['delivered', 'on_hold'].includes(p.status)).length

    return [
      { label: 'Unread messages', value: String(unreadCount) },
      { label: 'New form leads', value: String(formsNewCount) },
      { label: 'Active projects', value: String(activeProjects) },
      { label: 'Outstanding', value: formatCurrency(outstanding) },
    ]
  }, [formsNewCount, invoices, projects, unreadCount])

  const feed = useMemo(() => {
    const rows: { href: string; title: string; sub: string }[] = []

    for (const thread of threads.slice(0, 3)) {
      rows.push({
        href: '/messages',
        title: thread.clientName ?? thread.companyName ?? 'Client message',
        sub: thread.lastMessagePreview || thread.subject || 'Open thread',
      })
    }

    if (formsNewCount > 0) {
      rows.push({
        href: '/form-submissions',
        title: `${formsNewCount} new form lead${formsNewCount === 1 ? '' : 's'}`,
        sub: 'Review website submissions',
      })
    }

    const openProposals = proposals.filter((p) => p.status === 'sent').length
    if (openProposals > 0) {
      rows.push({
        href: '/proposals',
        title: `${openProposals} open proposal${openProposals === 1 ? '' : 's'}`,
        sub: 'Awaiting client response',
      })
    }

    return rows.slice(0, 5)
  }, [formsNewCount, proposals, threads])

  const goToSelected = useCallback(() => {
    const target = items[itemIndex]
    if (!target) return
    router.push(target.href)
  }, [itemIndex, items, router])

  useEffect(() => {
    setItemIndex(0)
    setFlashKey((k) => k + 1)
  }, [categoryIndex])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setCategoryIndex((i) => (i - 1 + CATEGORIES.length) % CATEGORIES.length)
        return
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault()
        setCategoryIndex((i) => (i + 1) % CATEGORIES.length)
        return
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault()
        setItemIndex((i) => (i - 1 + items.length) % items.length)
        return
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        setItemIndex((i) => (i + 1) % items.length)
        return
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        goToSelected()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [goToSelected, items.length])

  return (
    <div className="space-y-6 md:space-y-8 px-4 py-5 md:px-8 md:py-8">
      <section className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0e1218] p-6 md:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PORTAL_IMAGES.infrastructure}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-right opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0e1218] via-[#0e1218]/90 to-[#0e1218]/50" aria-hidden />
        <PortalAmbientOrbs />
        <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-gold/80 via-gold/40 to-transparent" aria-hidden />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="space-y-3 min-w-0">
            <div className="flex items-center gap-3">
              <NexrenaLogo size="sm" />
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold/80">
                Team operations
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl text-white tracking-tight">
              Welcome back, {teamDisplayName}
            </h1>
            <p className="text-base text-slate-400">
              {formatClock(new Date())} · pick a section below or use the sidebar
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0 w-full md:w-auto">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="glass-panel rounded-xl border border-slate-800/60 bg-slate-900/40 px-4 py-3 min-w-[120px]"
              >
                <p className="text-[10px] uppercase tracking-widest text-slate-500">{stat.label}</p>
                <p className="mt-1 font-serif text-xl text-white tabular-nums">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-6" key={flashKey}>
        <section className="glass-panel rounded-2xl border border-slate-800/60 p-4 md:p-6 animate-fade-in-up">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat, index) => (
              <button
                key={cat.id}
                type="button"
                className={`shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                  index === categoryIndex
                    ? 'bg-gold/15 text-gold border border-gold/35'
                    : 'border border-slate-700/50 text-slate-400 hover:text-white hover:border-slate-600'
                }`}
                onClick={() => setCategoryIndex(index)}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-500">
            {category.tagline} · {items.length} destinations
          </p>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {items.map((item, index) => {
              const badge = badgeFor(item)
              const selected = index === itemIndex
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all ${
                    selected
                      ? 'border-gold/40 bg-gold/10 shadow-[0_0_20px_-4px_rgba(201,169,110,0.15)]'
                      : 'border-slate-800/80 bg-slate-900/40 hover:border-gold/25 hover:bg-slate-900/70'
                  }`}
                  onMouseEnter={() => setItemIndex(index)}
                  onFocus={() => setItemIndex(index)}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800/80 text-gold-light text-lg group-hover:bg-gold/10 transition-colors">
                    {item.icon}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-white">{item.label}</span>
                    <span className="block truncate text-xs text-slate-500">
                      {FLAVOR[item.href] ?? 'Open section'}
                    </span>
                  </span>
                  {badge > 0 && (
                    <span className="min-w-[1.5rem] h-6 px-1.5 rounded-full bg-gold text-obsidian text-xs font-bold flex items-center justify-center">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>

          <p className="mt-4 text-xs text-slate-600 hidden sm:block">
            ← → category · ↑ ↓ select · Enter confirm
          </p>
        </section>

        <aside className="glass-panel rounded-2xl border border-slate-800/60 p-4 md:p-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-4">
            Recent activity
          </p>
          {feed.length === 0 ? (
            <p className="text-sm text-slate-500 py-4">All quiet for now.</p>
          ) : (
            <div className="space-y-1">
              {feed.map((row) => (
                <Link
                  key={`${row.href}-${row.title}`}
                  href={row.href}
                  className="block rounded-lg px-3 py-2.5 hover:bg-slate-800/50 transition-colors"
                >
                  <p className="text-sm font-medium text-white truncate">{row.title}</p>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{row.sub}</p>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
