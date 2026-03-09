'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/',          label: 'Dashboard',  icon: '◈' },
  { href: '/crm',       label: 'CRM',        icon: '◎' },
  { href: '/projects',  label: 'Projects',   icon: '▦' },
  { href: '/invoices',  label: 'Invoices',   icon: '▤' },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="fixed left-0 top-0 h-screen w-56 bg-[#0C0F12] border-r border-[#1E2530] flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-[#1E2530]">
        <div className="flex items-baseline gap-1">
          <span className="font-serif text-xl text-white tracking-tight">Nex</span>
          <span className="font-serif text-xl text-[#C9A96E] tracking-tight">rena</span>
        </div>
        <p className="text-[10px] text-[#7A8A9E] mt-0.5 tracking-widest uppercase">Operations</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon }) => {
          const active = href === '/' ? path === '/' : path.startsWith(href)
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all ${
                active
                  ? 'bg-[#1E2530] text-[#C9A96E]'
                  : 'text-[#7A8A9E] hover:text-white hover:bg-[#1E2530]/50'
              }`}>
              <span className="text-base leading-none">{icon}</span>
              <span className="font-medium tracking-wide">{label}</span>
              {active && <span className="ml-auto w-1 h-4 bg-[#C9A96E] rounded-full" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-[#1E2530]">
        <p className="text-[10px] text-[#3D4A5C] tracking-wider">NEXRENA LLC</p>
        <p className="text-[10px] text-[#3D4A5C]">nexrena.com</p>
      </div>
    </aside>
  )
}

// ── Badge ──────────────────────────────────────────────────────────────
const STAGE_COLORS: Record<string, string> = {
  lead:        'bg-[#1E2530] text-[#7A8A9E]',
  contacted:   'bg-blue-900/40 text-blue-300',
  discovery:   'bg-purple-900/40 text-purple-300',
  proposal:    'bg-yellow-900/40 text-yellow-300',
  negotiation: 'bg-orange-900/40 text-orange-300',
  won:         'bg-green-900/40 text-green-300',
  lost:        'bg-red-900/40 text-red-300',
  not_started: 'bg-[#1E2530] text-[#7A8A9E]',
  in_progress: 'bg-blue-900/40 text-blue-300',
  done:        'bg-green-900/40 text-green-300',
  draft:       'bg-[#1E2530] text-[#7A8A9E]',
  sent:        'bg-blue-900/40 text-blue-300',
  paid:        'bg-green-900/40 text-green-300',
  overdue:     'bg-red-900/40 text-red-300',
  cancelled:   'bg-[#1E2530] text-[#3D4A5C]',
  on_hold:     'bg-orange-900/40 text-orange-300',
  delivered:   'bg-green-900/40 text-green-300',
  review:      'bg-yellow-900/40 text-yellow-300',
  execution:   'bg-blue-900/40 text-blue-300',
  strategy:    'bg-purple-900/40 text-purple-300',
}

export function Badge({ label }: { label: string }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium tracking-wide capitalize ${STAGE_COLORS[label] ?? 'bg-[#1E2530] text-[#7A8A9E]'}`}>
      {label.replace('_', ' ')}
    </span>
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────
export function StatCard({ label, value, sub, gold }: { label: string; value: string; sub?: string; gold?: boolean }) {
  return (
    <div className="bg-[#0C0F12] border border-[#1E2530] rounded-lg p-5">
      <p className="text-[11px] text-[#7A8A9E] tracking-widest uppercase mb-2">{label}</p>
      <p className={`text-2xl font-serif font-semibold ${gold ? 'text-[#C9A96E]' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-xs text-[#3D4A5C] mt-1">{sub}</p>}
    </div>
  )
}

// ── Page header ───────────────────────────────────────────────────────
export function PageHeader({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-serif text-3xl text-white">{title}</h1>
        {sub && <p className="text-sm text-[#7A8A9E] mt-1">{sub}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Button ────────────────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', type = 'button' }:
  { children: React.ReactNode; onClick?: () => void; variant?: 'primary'|'ghost'|'danger'; size?: 'sm'|'md'; type?: 'button'|'submit' }) {
  const base = 'inline-flex items-center gap-2 font-medium rounded transition-all'
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm' }
  const variants = {
    primary: 'bg-[#C9A96E] text-[#0C0F12] hover:bg-[#E8D5B0]',
    ghost:   'border border-[#1E2530] text-[#7A8A9E] hover:text-white hover:border-[#3D4A5C]',
    danger:  'border border-red-900 text-red-400 hover:bg-red-900/20',
  }
  return <button type={type} onClick={onClick} className={`${base} ${sizes[size]} ${variants[variant]}`}>{children}</button>
}

// ── Modal ─────────────────────────────────────────────────────────────
export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0C0F12] border border-[#2C3444] rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2530]">
          <h2 className="font-serif text-lg text-white">{title}</h2>
          <button onClick={onClose} className="text-[#7A8A9E] hover:text-white text-xl leading-none">×</button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  )
}

// ── Form field ────────────────────────────────────────────────────────
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] text-[#7A8A9E] tracking-widest uppercase mb-1.5">{label}</label>
      {children}
    </div>
  )
}

export const inputCls = 'w-full bg-[#1E2530] border border-[#2C3444] rounded px-3 py-2 text-sm text-white placeholder-[#3D4A5C] focus:outline-none focus:border-[#C9A96E] transition-colors'
export const selectCls = inputCls + ' cursor-pointer'
