'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth-gate'
import {
  useFormSubmissions,
} from '@/lib/form-submissions-context'
import {
  useInvoices,
  useMessages,
  useProjects,
  useProposals,
  formatCurrency,
  invoiceTotal,
} from '@/lib/store'
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

function statPercent(value: number, cap: number) {
  if (cap <= 0) return value > 0 ? 100 : 0
  return Math.min(100, Math.round((value / cap) * 100))
}

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
    const openProposals = proposals.filter((p) => p.status === 'sent').length

    return [
      { label: 'Unread', value: unreadCount, display: String(unreadCount), cap: 10 },
      { label: 'Forms', value: formsNewCount, display: String(formsNewCount), cap: 8 },
      { label: 'Projects', value: activeProjects, display: String(activeProjects), cap: 12 },
      {
        label: 'Outstanding',
        value: outstanding > 0 ? 1 : 0,
        display: formatCurrency(outstanding),
        cap: 1,
      },
    ]
  }, [formsNewCount, invoices, projects, proposals, unreadCount])

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

    if (openProposalsCount(proposals) > 0) {
      rows.push({
        href: '/proposals',
        title: `${openProposalsCount(proposals)} open proposal${openProposalsCount(proposals) === 1 ? '' : 's'}`,
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
    <div className="persona-dash">
      <div className="persona-dash__backdrop" aria-hidden />
      <div className="persona-dash__slash hidden md:block" aria-hidden />

      <div className="persona-dash__inner">
        <header className="persona-dash__header">
          <div>
            <p className="persona-dash__eyebrow">Nexrena Operations</p>
            <h1 className="persona-dash__title">Main Menu</h1>
            <p className="persona-dash__welcome">
              Operator: <strong>{teamDisplayName}</strong>
            </p>
          </div>
          <p className="persona-dash__clock">{formatClock(new Date())}</p>
        </header>

        <div className="persona-dash__grid">
          <aside className="persona-dash__panel hidden lg:block">
            <p className="persona-dash__panel-head">Status</p>
            {stats.map((stat) => (
              <div key={stat.label} className="persona-dash__stat">
                <div className="persona-dash__stat-label">
                  <span>{stat.label}</span>
                  <span>{stat.display}</span>
                </div>
                <div className="persona-dash__stat-bar">
                  <div
                    className="persona-dash__stat-fill"
                    style={{ width: `${statPercent(stat.value, stat.cap)}%` }}
                  />
                </div>
              </div>
            ))}
          </aside>

          <section className="persona-dash__panel p-4 md:p-5" key={flashKey}>
            <div className="persona-dash__categories persona-dash__enter-flash">
              {CATEGORIES.map((cat, index) => (
                <button
                  key={cat.id}
                  type="button"
                  className={`persona-dash__cat ${index === categoryIndex ? 'persona-dash__cat--active' : ''}`}
                  onClick={() => setCategoryIndex(index)}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs uppercase tracking-[0.2em] text-slate-500 font-persona">
              {category.tagline} · {items.length} destinations
            </p>

            <div className="persona-dash__items">
              {items.map((item, index) => {
                const badge = badgeFor(item)
                const selected = index === itemIndex
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`persona-dash__item ${selected ? 'persona-dash__item--selected' : ''}`}
                    onMouseEnter={() => setItemIndex(index)}
                    onFocus={() => setItemIndex(index)}
                  >
                    <span className="persona-dash__item-icon" aria-hidden>
                      {item.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="persona-dash__item-label block truncate">{item.label}</span>
                      <span className="persona-dash__item-sub block truncate">
                        {FLAVOR[item.href] ?? 'Open section'}
                      </span>
                    </span>
                    {badge > 0 && (
                      <span className="persona-dash__badge">{badge > 99 ? '99+' : badge}</span>
                    )}
                  </Link>
                )
              })}
            </div>

            <p className="persona-dash__hint hidden sm:block">
              ← → category · ↑ ↓ select · Enter confirm
            </p>
          </section>

          <aside className="persona-dash__panel hidden lg:block">
            <p className="persona-dash__panel-head">Activity</p>
            {feed.length === 0 ? (
              <p className="px-4 py-6 text-sm text-slate-500">All quiet for now.</p>
            ) : (
              feed.map((row) => (
                <Link key={`${row.href}-${row.title}`} href={row.href} className="persona-dash__feed-item">
                  <p className="persona-dash__feed-title">{row.title}</p>
                  <p className="persona-dash__feed-sub">{row.sub}</p>
                </Link>
              ))
            )}
          </aside>
        </div>

        <div className="persona-dash__panel lg:hidden">
          <p className="persona-dash__panel-head">Quick status</p>
          <div className="grid grid-cols-2 gap-3 p-3">
            {stats.slice(0, 4).map((stat) => (
              <div key={stat.label} className="rounded-lg border border-slate-700/50 bg-slate-900/40 px-3 py-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-500">{stat.label}</p>
                <p className="font-persona text-lg text-white">{stat.display}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function openProposalsCount(proposals: { status: string }[]) {
  return proposals.filter((p) => p.status === 'sent').length
}
