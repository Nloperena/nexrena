'use client'

type IconProps = { className?: string; selected?: boolean }

const cardBg = (selected?: boolean) => (selected ? 'opacity-100' : 'opacity-90 group-hover:opacity-100')

/** Website — updates, pages, design */
export function RequestIconWebsite({ className = 'w-full h-full', selected }: IconProps) {
  return (
    <svg className={`${className} ${cardBg(selected)}`} viewBox="0 0 120 120" fill="none" aria-hidden>
      <rect x="8" y="20" width="104" height="76" rx="12" fill="#1e293b" stroke="#38bdf8" strokeWidth="2.5" />
      <rect x="8" y="20" width="104" height="18" rx="12" fill="#0ea5e9" fillOpacity="0.35" />
      <circle cx="22" cy="29" r="3" fill="#f87171" />
      <circle cx="32" cy="29" r="3" fill="#fbbf24" />
      <circle cx="42" cy="29" r="3" fill="#4ade80" />
      <rect x="22" y="50" width="52" height="8" rx="4" fill="#334155" />
      <rect x="22" y="64" width="76" height="6" rx="3" fill="#475569" />
      <rect x="22" y="76" width="60" height="6" rx="3" fill="#475569" />
      <path
        d="M88 72l14 14-6 6-14-14 6-6Z"
        fill="#C9A96E"
        stroke="#E8D5B0"
        strokeWidth="1.5"
      />
      <path d="M92 76l4 4M96 72l-8 8" stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** Growth — SEO & content */
export function RequestIconGrowth({ className = 'w-full h-full', selected }: IconProps) {
  return (
    <svg className={`${className} ${cardBg(selected)}`} viewBox="0 0 120 120" fill="none" aria-hidden>
      <ellipse cx="60" cy="98" rx="40" ry="8" fill="#C9A96E" fillOpacity="0.15" />
      <path
        d="M24 88V52l18-20 20 12 34-28v72H24Z"
        fill="#14532d"
        fillOpacity="0.5"
        stroke="#4ade80"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path d="M42 32v56M60 44v44M82 28v72" stroke="#86efac" strokeWidth="2" strokeLinecap="round" />
      <circle cx="88" cy="36" r="16" fill="#166534" stroke="#4ade80" strokeWidth="2" />
      <path d="M82 36h12M88 30v12" stroke="#bbf7d0" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M48 56l8 8 16-16" stroke="#C9A96E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Support — fixes & hosting */
export function RequestIconSupport({ className = 'w-full h-full', selected }: IconProps) {
  return (
    <svg className={`${className} ${cardBg(selected)}`} viewBox="0 0 120 120" fill="none" aria-hidden>
      <ellipse cx="60" cy="98" rx="40" ry="8" fill="#C9A96E" fillOpacity="0.15" />
      <circle cx="60" cy="54" r="36" fill="#312e81" fillOpacity="0.45" stroke="#a78bfa" strokeWidth="2.5" />
      <circle cx="60" cy="54" r="22" fill="#1e1b4b" stroke="#c4b5fd" strokeWidth="2" />
      <path
        d="M60 38v32M44 54h32"
        stroke="#e9d5ff"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <rect x="52" y="78" width="16" height="14" rx="4" fill="#6366f1" stroke="#a5b4fc" strokeWidth="2" />
      <path d="M56 78V70a4 4 0 0 1 8 0v8" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export type RequestTypeOption = {
  id: string
  label: string
  tagline: string
  projectType: string
  placeholder: string
  accentClass: string
  Icon: typeof RequestIconWebsite
}

export const REQUEST_TYPE_OPTIONS: RequestTypeOption[] = [
  {
    id: 'website',
    label: 'Website',
    tagline: 'Updates, pages & design',
    projectType: 'web',
    placeholder: 'What should we change or build? Pages, copy, photos, layout…',
    accentClass: 'from-sky-500/20 to-sky-900/10 border-sky-500/40',
    Icon: RequestIconWebsite,
  },
  {
    id: 'growth',
    label: 'Growth',
    tagline: 'SEO & content',
    projectType: 'seo',
    placeholder: 'Keywords, blog posts, landing pages, or traffic goals…',
    accentClass: 'from-emerald-500/20 to-emerald-900/10 border-emerald-500/40',
    Icon: RequestIconGrowth,
  },
  {
    id: 'support',
    label: 'Support',
    tagline: 'Fixes & hosting',
    projectType: 'hosting',
    placeholder: 'What is broken, slow, or needs maintenance?',
    accentClass: 'from-violet-500/20 to-violet-900/10 border-violet-500/40',
    Icon: RequestIconSupport,
  },
]
