import type { Contact, Expense, Invoice, Project, Subscription } from '@/lib/types'
import { invoiceTotal } from '@/lib/store'

export type ReportPeriod = 'ytd' | '12mo' | 'all'

export type ChartPoint = { label: string; value: number; color?: string }

export type ProjectProfitRow = {
  id: string
  name: string
  clientName: string
  revenue: number
  expenses: number
  profit: number
  margin: number
}

export type PipelineStageRow = {
  stage: string
  label: string
  count: number
  value: number
  color: string
}

export type InvoiceStatusSlice = {
  status: string
  label: string
  count: number
  amount: number
  color: string
}

export type ReportMetrics = {
  revenue: number
  expenses: number
  profit: number
  margin: number
  outstanding: number
  mrr: number
  pipelineValue: number
  openDeals: number
  revenueByMonth: ChartPoint[]
  expenseByCategory: ChartPoint[]
  clientRevenue: ChartPoint[]
  projectProfitability: ProjectProfitRow[]
  pipelineByStage: PipelineStageRow[]
  invoiceStatus: InvoiceStatusSlice[]
  maxMonthRevenue: number
  maxClientRevenue: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const EXPENSE_COLORS: Record<string, string> = {
  software: '#60a5fa',
  contractors: '#a78bfa',
  hosting: '#34d399',
  marketing: '#f472b6',
  office: '#fb923c',
  other: '#94a3b8',
}

const EXPENSE_LABELS: Record<string, string> = {
  software: 'Software',
  contractors: 'Contractors',
  hosting: 'Hosting',
  marketing: 'Marketing',
  office: 'Office',
  other: 'Other',
}

const PIPELINE_STAGES: { stage: string; label: string; color: string }[] = [
  { stage: 'lead', label: 'Lead', color: '#64748b' },
  { stage: 'contacted', label: 'Contacted', color: '#22d3ee' },
  { stage: 'discovery', label: 'Discovery', color: '#a78bfa' },
  { stage: 'proposal', label: 'Proposal', color: '#C9A96E' },
  { stage: 'negotiation', label: 'Negotiation', color: '#fbbf24' },
]

function periodStart(period: ReportPeriod, now = new Date()): Date {
  if (period === 'ytd') return new Date(now.getFullYear(), 0, 1)
  if (period === '12mo') return new Date(now.getFullYear(), now.getMonth() - 11, 1)
  return new Date(2000, 0, 1)
}

function subscriptionMRR(subscriptions: Subscription[]): number {
  return subscriptions
    .filter((s) => s.status === 'active')
    .reduce((sum, s) => {
      if (s.interval === 'monthly') return sum + s.amount
      if (s.interval === 'quarterly') return sum + s.amount / 3
      if (s.interval === 'annually') return sum + s.amount / 12
      return sum
    }, 0)
}

function monthBuckets(period: ReportPeriod, now = new Date()): { key: string; label: string; start: Date; end: Date }[] {
  if (period === 'ytd') {
    return MONTHS.slice(0, now.getMonth() + 1).map((label, i) => ({
      key: `${now.getFullYear()}-${i}`,
      label,
      start: new Date(now.getFullYear(), i, 1),
      end: new Date(now.getFullYear(), i + 1, 0, 23, 59, 59),
    }))
  }
  if (period === '12mo') {
    const buckets = []
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      buckets.push({
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: MONTHS[d.getMonth()],
        start: d,
        end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
      })
    }
    return buckets
  }
  return []
}

function revenueInRange(invoices: Invoice[], start: Date, end: Date): number {
  return invoices
    .filter((i) => i.status === 'paid' && i.paidDate)
    .filter((i) => {
      const d = new Date(i.paidDate!)
      return d >= start && d <= end
    })
    .reduce((s, i) => s + invoiceTotal(i), 0)
}

export function computeReportMetrics(input: {
  period: ReportPeriod
  invoices: Invoice[]
  expenses: Expense[]
  projects: Project[]
  contacts: Contact[]
  subscriptions: Subscription[]
}): ReportMetrics {
  const { period, invoices, expenses, projects, contacts, subscriptions } = input
  const now = new Date()
  const start = periodStart(period, now)

  const paidInPeriod = invoices.filter(
    (i) => i.status === 'paid' && i.paidDate && new Date(i.paidDate) >= start,
  )
  const revenue = paidInPeriod.reduce((s, i) => s + invoiceTotal(i), 0)

  const expensesInPeriod = expenses.filter((e) => new Date(e.date) >= start)
  const totalExpenses = expensesInPeriod.reduce((s, e) => s + e.amount, 0)
  const profit = revenue - totalExpenses
  const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0

  const outstanding = invoices
    .filter((i) => ['sent', 'overdue'].includes(i.status))
    .reduce((s, i) => s + invoiceTotal(i), 0)

  const buckets = monthBuckets(period, now)
  const revenueByMonth: ChartPoint[] =
    period === 'all'
      ? buildYearlyRevenue(invoices, now)
      : buckets.map((b) => ({
          label: b.label,
          value: revenueInRange(invoices, b.start, b.end),
        }))

  const expenseByCategory = Object.keys(EXPENSE_LABELS)
    .map((cat) => ({
      label: EXPENSE_LABELS[cat],
      value: expensesInPeriod.filter((e) => e.category === cat).reduce((s, e) => s + e.amount, 0),
      color: EXPENSE_COLORS[cat],
    }))
    .filter((d) => d.value > 0)

  const clientRevenue = contacts
    .map((c) => ({
      label: c.company || c.name,
      value: invoices
        .filter((i) => i.contactId === c.id && i.status === 'paid' && i.paidDate && new Date(i.paidDate) >= start)
        .reduce((s, i) => s + invoiceTotal(i), 0),
    }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8)

  const projectProfitability = projects
    .map((p) => {
      const projRevenue = invoices
        .filter((i) => i.projectId === p.id && i.status === 'paid' && i.paidDate && new Date(i.paidDate) >= start)
        .reduce((s, i) => s + invoiceTotal(i), 0)
      const projExpenses = expensesInPeriod
        .filter((e) => e.projectId === p.id)
        .reduce((s, e) => s + e.amount, 0)
      const projProfit = projRevenue - projExpenses
      return {
        id: p.id,
        name: p.name,
        clientName: p.clientName,
        revenue: projRevenue,
        expenses: projExpenses,
        profit: projProfit,
        margin: projRevenue > 0 ? Math.round((projProfit / projRevenue) * 100) : 0,
      }
    })
    .filter((p) => p.revenue > 0 || p.expenses > 0)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 8)

  const openContacts = contacts.filter((c) => !['won', 'lost'].includes(c.stage))
  const pipelineByStage = PIPELINE_STAGES.map(({ stage, label, color }) => {
    const stageContacts = openContacts.filter((c) => c.stage === stage)
    return {
      stage,
      label,
      color,
      count: stageContacts.length,
      value: stageContacts.reduce((s, c) => s + c.value, 0),
    }
  }).filter((s) => s.count > 0)

  const statusConfig: { status: string; label: string; color: string }[] = [
    { status: 'paid', label: 'Paid', color: '#34d399' },
    { status: 'sent', label: 'Sent', color: '#60a5fa' },
    { status: 'overdue', label: 'Overdue', color: '#f87171' },
    { status: 'draft', label: 'Draft', color: '#64748b' },
  ]

  const invoiceStatus = statusConfig
    .map(({ status, label, color }) => {
      const rows = invoices.filter((i) => i.status === status)
      return {
        status,
        label,
        color,
        count: rows.length,
        amount: rows.reduce((s, i) => s + invoiceTotal(i), 0),
      }
    })
    .filter((s) => s.count > 0)

  return {
    revenue,
    expenses: totalExpenses,
    profit,
    margin,
    outstanding,
    mrr: subscriptionMRR(subscriptions),
    pipelineValue: openContacts.reduce((s, c) => s + c.value, 0),
    openDeals: openContacts.length,
    revenueByMonth,
    expenseByCategory,
    clientRevenue,
    projectProfitability,
    pipelineByStage,
    invoiceStatus,
    maxMonthRevenue: Math.max(...revenueByMonth.map((d) => d.value), 1),
    maxClientRevenue: Math.max(...clientRevenue.map((d) => d.value), 1),
  }
}

function buildYearlyRevenue(invoices: Invoice[], now: Date): ChartPoint[] {
  const currentYear = now.getFullYear()
  const years = new Set<number>()
  for (const inv of invoices) {
    if (inv.status === 'paid' && inv.paidDate) years.add(new Date(inv.paidDate).getFullYear())
  }
  if (years.size === 0) years.add(currentYear)
  return Array.from(years)
    .sort()
    .slice(-6)
    .map((year) => ({
      label: String(year),
      value: invoices
        .filter((i) => i.status === 'paid' && i.paidDate && new Date(i.paidDate).getFullYear() === year)
        .reduce((s, i) => s + invoiceTotal(i), 0),
    }))
}
