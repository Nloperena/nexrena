/** Shared typography, contrast, and touch targets for the team ops dashboard. */



export const TEAM_SIDEBAR_WIDTH = 'w-[260px]'

/** Sidebar is desktop-only (lg+) so tablets get full-width + bottom nav. */

export const TEAM_MAIN_OFFSET = 'lg:ml-[260px]'

export const TEAM_MOBILE_BOTTOM_PAD = 'pb-[max(6.5rem,calc(5.5rem+env(safe-area-inset-bottom)))] lg:pb-0'



export const teamSectionTitleClass =

  'text-xl sm:text-2xl font-serif font-semibold text-white tracking-tight leading-snug'



export const teamSectionHintClass =

  'text-sm sm:text-base text-slate-300 leading-relaxed'



export const teamMutedClass =

  'text-sm text-slate-300 leading-relaxed'



export const teamLabelClass =

  'block text-sm font-medium text-slate-200 mb-2 normal-case tracking-normal'



export const teamInputCls =

  'nx-input w-full bg-slate-800/70 border-2 border-slate-600 rounded-xl px-4 py-3 text-base text-white placeholder-slate-500 focus:outline-none focus:border-gold/60 focus:ring-2 focus:ring-gold/30 min-h-[48px] transition-all duration-200'



export const teamSelectCls = `${teamInputCls} nx-select cursor-pointer`



export const teamNavLabelClass =

  'text-sm sm:text-base font-medium leading-tight'



export const teamNavItemClass =

  'group relative flex items-center gap-3 px-4 rounded-xl transition-all duration-200 min-h-[48px]'



export const teamFocusRing =

  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#111418]'

