'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',          label: 'Dashboard',  icon: '◈' },
  { href: '/crm',       label: 'CRM',        icon: '◎' },
  { href: '/proposals',  label: 'Proposals', icon: '◇' },
  { href: '/projects',  label: 'Projects',   icon: '▦' },
  { href: '/time',      label: 'Time',       icon: '◔' },
  { href: '/invoices',  label: 'Invoices',   icon: '▤' },
  { href: '/expenses',  label: 'Expenses',   icon: '▥' },
  { href: '/reports',   label: 'Reports',    icon: '◩' },
  { href: '/leads',     label: 'Leads',      icon: '◉' },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-obsidian/80 backdrop-blur-xl border-r border-slate-800/60 flex flex-col z-50">
      {/* Ambient glow at top */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-gold/[0.03] to-transparent pointer-events-none" />

      {/* Logo */}
      <div className="relative px-6 py-6 border-b border-slate-800/60">
        <div className="flex items-baseline gap-0.5">
          <span className="font-serif text-xl text-white tracking-tight">Nex</span>
          <span className="font-serif text-xl text-gold tracking-tight">rena</span>
        </div>
        <p className="text-[9px] text-slate-400 mt-1 tracking-[0.25em] uppercase">Operations</p>
      </div>

      {/* Nav */}
      <nav className="relative flex-1 px-3 py-5 space-y-1">
        {NAV.map(({ href, label, icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link key={href} href={href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                active
                  ? 'bg-slate-800/60 text-gold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
              }`}>
              <span className={`text-base leading-none transition-transform duration-200 group-hover:scale-110 ${active ? 'text-gold' : ''}`}>
                {icon}
              </span>
              <span className="font-medium tracking-wide">{label}</span>
              {active && (
                <span className="absolute right-2 w-1 h-5 bg-gold rounded-full shadow-[0_0_8px_rgba(201,169,110,0.4)]" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="relative px-6 py-5 border-t border-slate-800/60">
        <div className="gold-rule-center mb-4 opacity-40" />
        <p className="text-[9px] text-slate-600 tracking-[0.2em] uppercase">Nexrena LLC</p>
        <p className="text-[9px] text-slate-600 mt-0.5">nexrena.com</p>
      </div>
    </aside>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────
const STAGE_COLORS: Record<string, string> = {
  lead:        'bg-slate-800/80 text-slate-400 ring-1 ring-slate-700/50',
  contacted:   'bg-blue-950/40 text-blue-300 ring-1 ring-blue-800/30',
  discovery:   'bg-purple-950/40 text-purple-300 ring-1 ring-purple-800/30',
  proposal:    'bg-amber-950/40 text-amber-300 ring-1 ring-amber-800/30',
  negotiation: 'bg-orange-950/40 text-orange-300 ring-1 ring-orange-800/30',
  won:         'bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-800/30',
  lost:        'bg-red-950/40 text-red-300 ring-1 ring-red-800/30',
  not_started: 'bg-slate-800/80 text-slate-400 ring-1 ring-slate-700/50',
  in_progress: 'bg-blue-950/40 text-blue-300 ring-1 ring-blue-800/30',
  done:        'bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-800/30',
  draft:       'bg-slate-800/80 text-slate-400 ring-1 ring-slate-700/50',
  sent:        'bg-blue-950/40 text-blue-300 ring-1 ring-blue-800/30',
  paid:        'bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-800/30',
  overdue:     'bg-red-950/40 text-red-300 ring-1 ring-red-800/30',
  cancelled:   'bg-slate-800/60 text-slate-600 ring-1 ring-slate-700/30',
  on_hold:     'bg-orange-950/40 text-orange-300 ring-1 ring-orange-800/30',
  delivered:   'bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-800/30',
  review:      'bg-amber-950/40 text-amber-300 ring-1 ring-amber-800/30',
  execution:   'bg-blue-950/40 text-blue-300 ring-1 ring-blue-800/30',
  strategy:    'bg-purple-950/40 text-purple-300 ring-1 ring-purple-800/30',
  web:         'bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-800/30',
  seo:         'bg-violet-950/40 text-violet-300 ring-1 ring-violet-800/30',
  both:        'bg-indigo-950/40 text-indigo-300 ring-1 ring-indigo-800/30',
  billable:    'bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-800/30',
  pending:     'bg-amber-950/40 text-amber-300 ring-1 ring-amber-800/30',
  accepted:    'bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-800/30',
  declined:    'bg-red-950/40 text-red-300 ring-1 ring-red-800/30',
  expired:     'bg-slate-800/60 text-slate-600 ring-1 ring-slate-700/30',
  software:    'bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-800/30',
  contractors: 'bg-violet-950/40 text-violet-300 ring-1 ring-violet-800/30',
  hosting:     'bg-blue-950/40 text-blue-300 ring-1 ring-blue-800/30',
  marketing:   'bg-pink-950/40 text-pink-300 ring-1 ring-pink-800/30',
  office:      'bg-amber-950/40 text-amber-300 ring-1 ring-amber-800/30',
  other:       'bg-slate-800/80 text-slate-400 ring-1 ring-slate-700/50',
}

export function Badge({ label }: { label: string }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-semibold tracking-wider uppercase ${STAGE_COLORS[label] ?? 'bg-slate-800/80 text-slate-400 ring-1 ring-slate-700/50'}`}>
      {label.replace('_', ' ')}
    </span>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, gold }: { label: string; value: string; sub?: React.ReactNode; gold?: boolean }) {
  return (
    <div className={`glass-panel rounded-xl p-5 relative overflow-hidden card-lift ${gold ? 'animate-pulse-glow' : ''}`}>
      {gold && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold/[0.06] to-transparent rounded-bl-full" />
      )}
      <p className="text-[10px] text-slate-400 tracking-[0.15em] uppercase mb-3 font-medium">{label}</p>
      <p className={`text-2xl font-serif font-semibold tracking-tight ${gold ? 'gold-shimmer' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-slate-600 mt-1.5">{sub}</p>}
    </div>
  )
}

// ── Page header ───────────────────────────────────────────────────────
export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-10 animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-serif text-3xl text-white tracking-tight">{title}</h1>
          {sub && <p className="text-sm text-slate-400 mt-1.5">{sub}</p>}
        </div>
        {action}
      </div>
      <div className="gold-rule mt-6 opacity-60" />
    </div>
  )
}

// ── Button ────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', type = 'button' }:
  { children: React.ReactNode; onClick?: () => void; variant?: 'primary'|'ghost'|'danger'; size?: 'sm'|'md'; type?: 'button'|'submit' }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 active:scale-[0.97]'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm' }
  const variants = {
    primary: 'bg-gold text-obsidian hover:bg-gold-light btn-glow font-semibold',
    ghost:   'border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800/30',
    danger:  'border border-red-900/50 text-red-400 hover:bg-red-950/30 hover:border-red-800/50',
  }
  return <button type={type} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]}`}>{children}</button>
}

/** Anchor styled like a button — use for links (avoids invalid <a><button> nesting) */
export function LinkBtn({ href, children, variant = 'primary', size = 'md', target }: {
  href: string; children: React.ReactNode; variant?: 'primary'|'ghost'|'danger'; size?: 'sm'|'md'; target?: string
}) {
  const base = 'inline-flex items-center gap-2 font-medium rounded-lg transition-all duration-200 no-underline'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-2.5 text-sm' }
  const variants = {
    primary: 'bg-gold text-obsidian hover:bg-gold-light btn-glow font-semibold',
    ghost:   'border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 hover:bg-slate-800/30',
    danger:  'border border-red-900/50 text-red-400 hover:bg-red-950/30 hover:border-red-800/50',
  }
  return <a href={href} target={target} className={`${base} ${sizes[size]} ${variants[variant]}`}>{children}</a>
}

// ── Modal ─────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-obsidian border border-slate-700/50 rounded-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl shadow-black/60 animate-scale-in ${wide ? 'max-w-2xl' : 'max-w-lg'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800/60">
          <h2 className="font-serif text-lg text-white">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl leading-none transition-colors w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-800/50">×</button>
        </div>
        <div className="px-6 py-6">{children}</div>
      </div>
    </div>
  )
}

// ── Form field ────────────────────────────────────────────────────────
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-slate-400 tracking-[0.15em] uppercase mb-2 font-medium">{label}</label>
      {children}
    </div>
  )
}

export const inputCls = 'w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-200'
export const selectCls = inputCls + ' cursor-pointer'

// ── Empty state ──────────────────────────────────────────────────────
export function EmptyState({ message, action, actionLabel }: { message: string; action?: () => void; actionLabel?: string }) {
  return (
    <div className="py-20 text-center animate-fade-in">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-slate-800/50 border border-slate-700/30 flex items-center justify-center">
        <span className="text-gold/40 text-lg">◇</span>
      </div>
      <p className="text-slate-600 text-sm">{message}</p>
      {action && actionLabel && (
        <button onClick={action} className="text-gold text-sm mt-3 hover:text-gold-light transition-colors">
          {actionLabel} →
        </button>
      )}
    </div>
  )
}

// ── Section card wrapper ─────────────────────────────────────────────
export function SectionCard({ children, className = '', style }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`glass-panel rounded-xl overflow-hidden ${className}`} style={style}>
      {children}
    </div>
  )
}

export function SectionHeader({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="px-5 py-4 border-b border-slate-800/60 flex items-center justify-between">
      <h2 className="font-serif text-base text-white">{title}</h2>
      {action}
    </div>
  )
}
