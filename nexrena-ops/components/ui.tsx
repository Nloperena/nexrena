'use client'

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
  monthly:     'bg-blue-950/40 text-blue-300 ring-1 ring-blue-800/30',
  quarterly:   'bg-violet-950/40 text-violet-300 ring-1 ring-violet-800/30',
  annually:    'bg-indigo-950/40 text-indigo-300 ring-1 ring-indigo-800/30',
  active:      'bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-800/30',
  paused:      'bg-amber-950/40 text-amber-300 ring-1 ring-amber-800/30',
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
    <div className={`nx-stat-card glass-panel rounded-xl p-5 relative overflow-hidden card-lift ${gold ? 'animate-pulse-glow' : ''}`}>
      {gold && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold/[0.06] to-transparent rounded-bl-full" />
      )}
      <p className="nx-stat-card-label text-[10px] text-slate-400 tracking-[0.15em] uppercase mb-3 font-medium">{label}</p>
      <p className={`text-2xl font-serif font-semibold tracking-tight ${gold ? 'gold-shimmer' : 'text-white'}`}>{value}</p>
      {sub && <p className="nx-stat-card-sub text-xs text-slate-600 mt-1.5">{sub}</p>}
    </div>
  )
}

// ── Page header ───────────────────────────────────────────────────────
export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="nx-page-header mb-5 md:mb-8 animate-fade-in-up w-full min-w-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl sm:text-2xl md:text-3xl text-white tracking-tight break-words">{title}</h1>
          {sub && <p className="nx-page-header-sub text-sm text-slate-400 mt-1 break-words">{sub}</p>}
        </div>
        {action && (
          <div className="shrink-0 w-full sm:w-auto [&>button]:w-full sm:[&>button]:w-auto [&>a]:w-full sm:[&>a]:w-auto">
            {action}
          </div>
        )}
      </div>
      <div className="gold-rule mt-4 md:mt-6 opacity-60 hidden md:block" />
    </div>
  )
}

// ── Button ────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', type = 'button', disabled = false }:
  { children: React.ReactNode; onClick?: () => void; variant?: 'primary'|'ghost'|'danger'; size?: 'sm'|'md'|'lg'; type?: 'button'|'submit'; disabled?: boolean }) {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
  const sizes = {
    sm: 'px-4 py-2 text-sm min-h-[44px]',
    md: 'px-5 py-3 text-base min-h-[48px]',
    lg: 'px-7 py-4 text-lg min-h-[56px] font-semibold',
  }
  const variants = {
    primary: 'bg-gold text-obsidian hover:bg-gold-light btn-glow font-semibold',
    ghost:   'border-2 border-slate-600 text-slate-200 hover:text-white hover:border-slate-400 hover:bg-slate-800/40',
    danger:  'border-2 border-red-800/60 text-red-300 hover:bg-red-950/30 hover:border-red-600/60',
  }
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]}`}>{children}</button>
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
    <div className="nx-field">
      <label className="block text-[10px] text-slate-400 tracking-[0.15em] uppercase mb-2 font-medium">{label}</label>
      {children}
    </div>
  )
}

export const inputCls = 'nx-input w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all duration-200'
export const selectCls = inputCls + ' nx-select cursor-pointer'

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
