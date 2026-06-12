'use client'

import { formatCurrency } from '@/lib/store'
import type { ChartPoint, InvoiceStatusSlice, PipelineStageRow, ProjectProfitRow } from '@/lib/reports-metrics'

export function ProfitHero({
  revenue,
  expenses,
  profit,
  margin,
  outstanding,
  mrr,
  pipelineValue,
  openDeals,
}: {
  revenue: number
  expenses: number
  profit: number
  margin: number
  outstanding: number
  mrr: number
  pipelineValue: number
  openDeals: number
}) {
  const maxBar = Math.max(revenue, expenses, 1)
  const revenuePct = (revenue / maxBar) * 100
  const expensePct = (expenses / maxBar) * 100

  return (
    <div className="rounded-2xl border border-slate-700/40 bg-gradient-to-br from-[#1a2332] via-[#141820] to-[#0e1116] p-5 sm:p-7 overflow-hidden relative">
      <div className="pointer-events-none absolute -top-20 -right-16 h-56 w-56 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-10">
        <div className="space-y-5">
          <div>
            <p className="text-sm text-slate-400 mb-1">Net profit</p>
            <p className={`font-serif text-4xl sm:text-5xl tabular-nums ${profit >= 0 ? 'text-white' : 'text-red-400'}`}>
              {formatCurrency(profit)}
            </p>
            <p className="text-sm text-slate-400 mt-2">
              {margin}% margin · {formatCurrency(revenue)} collected
            </p>
          </div>

          <div className="space-y-3">
            <BarCompare label="Revenue" value={revenue} pct={revenuePct} color="from-gold/90 to-gold/50" />
            <BarCompare label="Expenses" value={expenses} pct={expensePct} color="from-slate-500/80 to-slate-600/40" />
          </div>
        </div>

        <div className="flex flex-row lg:flex-col gap-4 lg:gap-5 lg:min-w-[160px]">
          <MetricRing label="Margin" value={`${margin}%`} pct={Math.min(Math.max(margin, 0), 100)} color="#C9A96E" />
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 flex-1">
            <MiniStat label="Outstanding" value={formatCurrency(outstanding)} hint="Unpaid invoices" />
            <MiniStat label="MRR" value={formatCurrency(mrr)} hint="Active subscriptions" gold />
            <MiniStat label="Pipeline" value={formatCurrency(pipelineValue)} hint={`${openDeals} open deals`} />
          </div>
        </div>
      </div>
    </div>
  )
}

function BarCompare({
  label,
  value,
  pct,
  color,
}: {
  label: string
  value: number
  pct: number
  color: string
}) {
  return (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-slate-300">{label}</span>
        <span className="text-white font-medium tabular-nums">{formatCurrency(value)}</span>
      </div>
      <div className="h-3 rounded-full bg-slate-800/80 overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700 ease-out`}
          style={{ width: `${Math.max(pct, value > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  )
}

function MetricRing({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  const r = 42
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-slate-700/40 bg-slate-900/40 px-4 py-3">
      <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#1e293b" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="-mt-[72px] mb-8 text-center pointer-events-none">
        <p className="text-xl font-semibold text-white tabular-nums">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
      </div>
    </div>
  )
}

function MiniStat({ label, value, hint, gold }: { label: string; value: string; hint: string; gold?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-700/35 bg-slate-900/35 px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className={`text-base font-semibold tabular-nums mt-0.5 ${gold ? 'text-gold' : 'text-white'}`}>{value}</p>
      <p className="text-[11px] text-slate-500 mt-0.5">{hint}</p>
    </div>
  )
}

export function ColumnChart({
  data,
  maxVal,
  title,
  subtitle,
  emptyMessage = 'No data for this period',
}: {
  data: ChartPoint[]
  maxVal: number
  title: string
  subtitle?: string
  emptyMessage?: string
}) {
  if (data.every((d) => d.value === 0)) {
    return (
      <ChartShell title={title} subtitle={subtitle}>
        <p className="text-sm text-slate-500 text-center py-12">{emptyMessage}</p>
      </ChartShell>
    )
  }

  const chartHeight = 160

  return (
    <ChartShell title={title} subtitle={subtitle}>
      <div className="flex items-end justify-between gap-1 sm:gap-2 h-[180px] pt-4">
        {data.map((d) => {
          const h = maxVal > 0 ? Math.max((d.value / maxVal) * chartHeight, d.value > 0 ? 6 : 0) : 0
          return (
            <div key={d.label} className="flex-1 min-w-0 flex flex-col items-center justify-end h-full group">
              <span className="text-[10px] sm:text-xs text-slate-400 tabular-nums mb-1 opacity-0 group-hover:opacity-100 transition-opacity truncate max-w-full">
                {d.value > 0 ? formatCurrency(d.value) : ''}
              </span>
              <div
                className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-gold/70 to-gold/30 border border-gold/20 transition-all duration-500 ease-out group-hover:from-gold group-hover:to-gold/60"
                style={{ height: `${h}px` }}
                title={`${d.label}: ${formatCurrency(d.value)}`}
              />
              <span className="text-[10px] sm:text-xs text-slate-500 mt-2 truncate w-full text-center">{d.label}</span>
            </div>
          )
        })}
      </div>
    </ChartShell>
  )
}

export function DonutChart({
  data,
  title,
  subtitle,
  emptyMessage = 'No expenses in this period',
}: {
  data: ChartPoint[]
  title: string
  subtitle?: string
  emptyMessage?: string
}) {
  const total = data.reduce((s, d) => s + d.value, 0)
  if (total <= 0) {
    return (
      <ChartShell title={title} subtitle={subtitle}>
        <p className="text-sm text-slate-500 text-center py-12">{emptyMessage}</p>
      </ChartShell>
    )
  }

  const colors = ['#60a5fa', '#a78bfa', '#34d399', '#f472b6', '#fb923c', '#94a3b8', '#C9A96E']
  let angle = -90
  const slices = data.map((d, i) => {
    const pct = d.value / total
    const sweep = pct * 360
    const start = angle
    angle += sweep
    return { ...d, pct, start, sweep, color: d.color || colors[i % colors.length] }
  })

  return (
    <ChartShell title={title} subtitle={subtitle}>
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <div className="relative shrink-0">
          <svg width="168" height="168" viewBox="0 0 168 168">
            {slices.map((s) => (
              <path key={s.label} d={describeArc(84, 84, 58, 72, s.start, s.start + s.sweep - 0.5)} fill={s.color} />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-lg font-semibold text-white tabular-nums">{formatCurrency(total)}</p>
          </div>
        </div>
        <div className="flex-1 w-full space-y-2.5">
          {slices.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="text-sm text-slate-300 flex-1 truncate">{s.label}</span>
              <span className="text-sm text-white tabular-nums shrink-0">{formatCurrency(s.value)}</span>
              <span className="text-xs text-slate-500 tabular-nums w-10 text-right">{Math.round(s.pct * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    </ChartShell>
  )
}

export function InvoiceStatusBar({ slices }: { slices: InvoiceStatusSlice[] }) {
  const total = slices.reduce((s, x) => s + x.amount, 0)
  if (total <= 0) {
    return (
      <ChartShell title="Invoice health" subtitle="Amount by status">
        <p className="text-sm text-slate-500 text-center py-8">No invoices yet</p>
      </ChartShell>
    )
  }

  return (
    <ChartShell title="Invoice health" subtitle={`${formatCurrency(total)} across all invoices`}>
      <div className="flex h-4 rounded-full overflow-hidden mb-5">
        {slices.map((s) => (
          <div
            key={s.status}
            style={{ width: `${(s.amount / total) * 100}%`, backgroundColor: s.color }}
            title={`${s.label}: ${formatCurrency(s.amount)}`}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {slices.map((s) => (
          <div key={s.status} className="rounded-xl border border-slate-700/30 bg-slate-900/30 p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: s.color }} />
              <span className="text-xs text-slate-400">{s.label}</span>
            </div>
            <p className="text-base font-semibold text-white tabular-nums">{formatCurrency(s.amount)}</p>
            <p className="text-[11px] text-slate-500">{s.count} invoice{s.count !== 1 ? 's' : ''}</p>
          </div>
        ))}
      </div>
    </ChartShell>
  )
}

export function PipelineFunnel({ stages }: { stages: PipelineStageRow[] }) {
  const maxVal = Math.max(...stages.map((s) => s.value), 1)
  if (stages.length === 0) {
    return (
      <ChartShell title="Sales pipeline" subtitle="Open CRM deals by stage">
        <p className="text-sm text-slate-500 text-center py-8">No open deals in pipeline</p>
      </ChartShell>
    )
  }

  return (
    <ChartShell title="Sales pipeline" subtitle="Weighted value by stage">
      <div className="space-y-3">
        {stages.map((s) => (
          <div key={s.stage}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">
                {s.label}
                <span className="text-slate-500 ml-2">{s.count}</span>
              </span>
              <span className="text-gold tabular-nums font-medium">{formatCurrency(s.value)}</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-800/70 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.max((s.value / maxVal) * 100, s.value > 0 ? 6 : 0)}%`,
                  backgroundColor: s.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </ChartShell>
  )
}

export function ClientRevenueChart({ data, maxVal }: { data: ChartPoint[]; maxVal: number }) {
  if (data.length === 0) {
    return (
      <ChartShell title="Top clients" subtitle="Paid revenue in period">
        <p className="text-sm text-slate-500 text-center py-8">No client revenue yet</p>
      </ChartShell>
    )
  }

  return (
    <ChartShell title="Top clients" subtitle="Who drives revenue">
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center gap-3">
            <span className="text-xs text-slate-600 w-4 tabular-nums">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between gap-2 mb-1">
                <span className="text-sm text-white truncate">{d.label}</span>
                <span className="text-sm text-gold tabular-nums shrink-0">{formatCurrency(d.value)}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800/70 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold/40"
                  style={{ width: `${Math.max((d.value / maxVal) * 100, 4)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </ChartShell>
  )
}

export function ProjectProfitCards({ rows }: { rows: ProjectProfitRow[] }) {
  if (rows.length === 0) {
    return (
      <ChartShell title="Project profitability" subtitle="Revenue vs costs">
        <p className="text-sm text-slate-500 text-center py-8">No project financials yet</p>
      </ChartShell>
    )
  }

  return (
    <ChartShell title="Project profitability" subtitle="Revenue vs costs per project">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {rows.map((p) => {
          const max = Math.max(p.revenue, p.expenses, 1)
          return (
            <div key={p.id} className="rounded-xl border border-slate-700/35 bg-slate-900/25 p-4">
              <p className="text-sm font-medium text-white truncate">{p.name}</p>
              <p className="text-xs text-slate-500 truncate mb-3">{p.clientName}</p>
              <div className="space-y-2 mb-3">
                <div className="h-2 rounded-full bg-slate-800/70 overflow-hidden flex">
                  <div className="h-full bg-emerald-500/70" style={{ width: `${(p.revenue / max) * 100}%` }} />
                </div>
                <div className="h-2 rounded-full bg-slate-800/70 overflow-hidden flex">
                  <div className="h-full bg-red-400/60" style={{ width: `${(p.expenses / max) * 100}%` }} />
                </div>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400 tabular-nums">{formatCurrency(p.revenue)} rev</span>
                <span className={`font-semibold tabular-nums ${p.profit >= 0 ? 'text-gold' : 'text-red-400'}`}>
                  {formatCurrency(p.profit)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </ChartShell>
  )
}

function ChartShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-2xl border border-slate-700/35 bg-[#1a1f27]/80 p-5 sm:p-6 h-full">
      <div className="mb-4">
        <h3 className="font-serif text-lg text-white">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx: number, cy: number, innerR: number, outerR: number, startAngle: number, endAngle: number) {
  const startOuter = polarToCartesian(cx, cy, outerR, endAngle)
  const endOuter = polarToCartesian(cx, cy, outerR, startAngle)
  const startInner = polarToCartesian(cx, cy, innerR, startAngle)
  const endInner = polarToCartesian(cx, cy, innerR, endAngle)
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1
  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 0 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 1 ${endInner.x} ${endInner.y}`,
    'Z',
  ].join(' ')
}
