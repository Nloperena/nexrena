'use client'

import Link from 'next/link'
import { useInvoices, useMessages, useProjects, useProposals, formatCurrency, invoiceTotal } from '@/lib/store'
import { PageHeader, Btn } from '@/components/ui'
import { StatCard, Card, SectionHeader } from '@/components/design-system'
import { spacing } from '@/lib/design-tokens'

export default function TeamDashboardPage() {
  const { invoices } = useInvoices()
  const { threads, unreadCount } = useMessages()
  const { projects } = useProjects()
  const { proposals } = useProposals()

  const now = new Date()
  const isOverdue = (inv: typeof invoices[0]) =>
    inv.status === 'sent' && new Date(inv.dueDate) < now

  const outstanding = invoices
    .filter((i) => i.status === 'sent' || i.status === 'overdue' || isOverdue(i))
    .reduce((s, i) => s + invoiceTotal(i), 0)
  const activeProjects = projects.filter((p) => !['delivered', 'on_hold'].includes(p.status)).length
  const openProposals = proposals.filter((p) => p.status === 'sent').length

  const quickActions = [
    { href: '/messages', title: 'Messages', subtitle: `${unreadCount} unread`, icon: '✉' },
    { href: '/invoices', title: 'New invoice', subtitle: 'Bill a client', icon: '▤' },
    { href: '/projects', title: 'Projects', subtitle: `${activeProjects} active`, icon: '▦' },
    { href: '/service-requests', title: 'Requests', subtitle: 'Client tickets', icon: '✦' },
  ]

  return (
    <div className={`${spacing.section} w-full min-w-0 overflow-x-hidden`}>
      <PageHeader
        title="Dashboard"
        sub="Your command center"
        action={<Btn onClick={() => window.location.href = '/invoices'}>+ Invoice</Btn>}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Unread messages" value={String(unreadCount)} gold={unreadCount > 0} />
        <StatCard label="Outstanding" value={formatCurrency(outstanding)} gold={outstanding > 0} />
        <StatCard label="Active projects" value={String(activeProjects)} />
        <StatCard label="Open proposals" value={String(openProposals)} />
      </div>

      <section>
        <SectionHeader title="Quick actions" compact />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href} className="block no-underline group">
              <Card className="group-hover:border-gold/25 transition-colors">
                <div className="flex items-start gap-4 min-h-[44px]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-800/80 text-xl text-slate-200 group-hover:text-gold-light">
                    {action.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="font-serif text-base text-white">{action.title}</p>
                    <p className="text-sm text-slate-400 mt-0.5">{action.subtitle}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeader title="Recent conversations" hint={`${threads.length} threads`} compact />
        <Card className="divide-y divide-slate-800/60">
          {threads.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">No messages yet.</p>
          ) : (
            threads.slice(0, 5).map((t) => (
              <Link
                key={t.threadId}
                href="/messages"
                className="flex items-center justify-between gap-3 py-3 px-1 hover:bg-slate-800/20 rounded-lg transition-colors no-underline"
              >
                <div className="min-w-0">
                  <p className="text-white font-medium truncate">{t.clientName ?? t.companyName ?? 'Client'}</p>
                  <p className="text-sm text-slate-400 truncate">{t.subject || t.lastMessagePreview || 'Conversation'}</p>
                </div>
                {t.unreadByAdmin > 0 && (
                  <span className="shrink-0 min-w-[1.5rem] h-6 px-2 rounded-full bg-gold text-obsidian text-xs font-bold flex items-center justify-center">
                    {t.unreadByAdmin}
                  </span>
                )}
              </Link>
            ))
          )}
        </Card>
      </section>
    </div>
  )
}
