'use client'

import { useMemo, useState } from 'react'
import {
  useInvoices,
  useExpenses,
  useProjects,
  useContacts,
  useSubscriptions,
} from '@/lib/store'
import { PageHeader } from '@/components/ui'
import { MobileFilterChip, MobileFilterRow } from '@/components/mobile-filter-row'
import { computeReportMetrics, type ReportPeriod } from '@/lib/reports-metrics'
import {
  ProfitHero,
  ColumnChart,
  DonutChart,
  InvoiceStatusBar,
  PipelineFunnel,
  ClientRevenueChart,
  ProjectProfitCards,
} from '@/components/reports/report-visuals'

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  ytd: 'Year to date',
  '12mo': 'Last 12 months',
  all: 'All time',
}

export default function ReportsPage() {
  const { invoices } = useInvoices()
  const { expenses } = useExpenses()
  const { projects } = useProjects()
  const { contacts } = useContacts()
  const { subscriptions } = useSubscriptions()
  const [period, setPeriod] = useState<ReportPeriod>('ytd')

  const metrics = useMemo(
    () =>
      computeReportMetrics({
        period,
        invoices,
        expenses,
        projects,
        contacts,
        subscriptions,
      }),
    [period, invoices, expenses, projects, contacts, subscriptions],
  )

  const revenueChartTitle =
    period === 'ytd'
      ? `Revenue ${new Date().getFullYear()}`
      : period === '12mo'
        ? 'Revenue trend'
        : 'Revenue by year'

  return (
    <div className="w-full min-w-0 overflow-x-hidden space-y-6 md:space-y-8">
      <PageHeader
        title="Reports"
        sub="Visual snapshot of revenue, costs, pipeline, and collections"
      />

      <MobileFilterRow>
        {(['ytd', '12mo', 'all'] as const).map((p) => (
          <MobileFilterChip key={p} active={period === p} onClick={() => setPeriod(p)}>
            {PERIOD_LABELS[p]}
          </MobileFilterChip>
        ))}
      </MobileFilterRow>

      <ProfitHero
        revenue={metrics.revenue}
        expenses={metrics.expenses}
        profit={metrics.profit}
        margin={metrics.margin}
        outstanding={metrics.outstanding}
        mrr={metrics.mrr}
        pipelineValue={metrics.pipelineValue}
        openDeals={metrics.openDeals}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6">
        <ColumnChart
          data={metrics.revenueByMonth}
          maxVal={metrics.maxMonthRevenue}
          title={revenueChartTitle}
          subtitle="Paid invoices by period"
        />
        <DonutChart
          data={metrics.expenseByCategory}
          title="Where money goes"
          subtitle="Expenses by category"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
        <div className="lg:col-span-2">
          <InvoiceStatusBar slices={metrics.invoiceStatus} />
        </div>
        <PipelineFunnel stages={metrics.pipelineByStage} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 md:gap-6">
        <ClientRevenueChart data={metrics.clientRevenue} maxVal={metrics.maxClientRevenue} />
        <ProjectProfitCards rows={metrics.projectProfitability} />
      </div>
    </div>
  )
}
