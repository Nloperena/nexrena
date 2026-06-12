/** Flat surfaces with soft shadow and top-light shading for team ops. */

export const teamSurfaceBase = 'bg-[#111418]'

export const teamSurfaceRaised =
  'bg-[#1a1f27] border border-slate-700/40 shadow-[0_4px_24px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.04)]'

export const teamSurfaceCard =
  'bg-[#1e2430] border border-slate-600/30 shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.06)] rounded-2xl'

export const teamSurfaceInset =
  'bg-[#0e1116] border border-slate-800/60 shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)] rounded-xl'

export const teamAmbientGlow =
  'pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(201,169,110,0.08),transparent)]'

export const teamMobileTabBar =
  'fixed bottom-0 inset-x-0 z-50 md:hidden border-t border-slate-700/50 bg-[#141820]/95 backdrop-blur-lg shadow-[0_-8px_32px_rgba(0,0,0,0.45)] pb-[env(safe-area-inset-bottom)]'

export const TEAM_MOBILE_TAB_MIN_H = 'min-h-[64px]'
