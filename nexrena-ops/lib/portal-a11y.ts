/** Shared typography, contrast, and touch targets for the client portal (older-user friendly). */

export const PORTAL_SIDEBAR_WIDTH = 'w-[4.5rem]'
export const PORTAL_MAIN_OFFSET = 'md:ml-[4.5rem]'

/** Page / section headings */
export const portalSectionTitleClass =
  'text-xl sm:text-2xl font-semibold text-white mb-5 leading-snug'

/** Intro paragraphs under headings */
export const portalSectionHintClass =
  'text-lg text-slate-200 leading-relaxed'

/** Secondary body copy — still readable, not faint */
export const portalMutedClass =
  'text-base text-slate-300 leading-relaxed'

/** Smallest text we use in the portal (avoid text-xs/text-sm for boomers) */
export const portalCaptionClass =
  'text-base text-slate-300'

export const portalLabelClass =
  'block text-lg font-medium text-slate-100 mb-2 normal-case tracking-normal'

export const portalInputCls =
  'auth-field w-full bg-[#1a2332] border-2 border-slate-500 rounded-xl px-4 py-4 text-lg text-white caret-white placeholder-slate-400 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/60 min-h-[56px]'

export const portalTextareaCls = `${portalInputCls} min-h-[160px] resize-y leading-relaxed`

export const portalCardClass =
  'glass-panel rounded-xl border-2 border-slate-600/90 p-6 sm:p-7 bg-slate-900/50'

export const portalFocusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#111418]'

/** Nav labels (sidebar + mobile tabs) */
export const portalNavLabelClass =
  'text-lg font-medium leading-tight'

/** Mobile bottom tab bar height */
export const PORTAL_MOBILE_TAB_MIN_H = 'min-h-[72px]'
