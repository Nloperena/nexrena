/** Nexrena design tokens — shared client + team portals */

export const colors = {
  ink: '#111418',
  obsidian: '#0C0F12',
  panel: '#1a1f27',
  panelRaised: '#1e2430',
  panelInset: '#0e1116',
  gold: '#C9A96E',
  goldDim: '#9B7D4E',
  goldLight: '#E8D5B0',
  body: '#cbd5e1',
  muted: '#94a3b8',
  border: 'rgba(100, 116, 139, 0.35)',
} as const

export const spacing = {
  page: 'px-4 md:px-8',
  pagePy: 'py-6 md:py-8',
  section: 'space-y-6 md:space-y-8',
  cardPad: 'p-5 sm:p-[22px]',
  cardGap: 'gap-4 md:gap-5',
} as const

export const radius = {
  card: 'rounded-2xl',
  button: 'rounded-xl',
  pill: 'rounded-full',
} as const

export const touch = {
  min: 'min-h-[44px] min-w-[44px]',
  button: 'min-h-[48px]',
  nav: 'min-h-[64px]',
} as const

export const typography = {
  pageTitle: 'font-serif text-xl sm:text-2xl text-white tracking-tight',
  sectionTitle: 'font-serif text-lg sm:text-xl text-white',
  body: 'text-base text-slate-200 leading-relaxed',
  hint: 'text-sm text-slate-400 leading-relaxed',
  label: 'text-sm font-medium text-slate-200',
} as const

export const surfaces = {
  card:
    'bg-[#1e2430]/90 border border-slate-600/30 shadow-[0_8px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.05)] rounded-2xl',
  cardClient:
    'glass-panel rounded-2xl border border-slate-600/40 bg-[#161b22]/90',
  page: 'bg-[#111418]',
} as const

export const motion = {
  fadeUp: 'animate-fade-in-up',
  fade: 'animate-fade-in',
  scale: 'animate-scale-in',
  press: 'active:scale-[0.98] transition-transform duration-150',
} as const

export const layout = {
  maxContent: 'max-w-5xl w-full mx-auto',
  maxTeam: 'max-w-7xl w-full mx-auto',
  bottomSafe: 'pb-[max(5.5rem,env(safe-area-inset-bottom))] md:pb-8',
  hideDesktop: 'md:hidden',
  hideMobile: 'hidden md:block',
} as const
