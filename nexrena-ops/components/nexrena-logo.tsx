type Props = {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  className?: string
}

const sizes = {
  sm: { icon: 32, word: 'text-lg' },
  md: { icon: 40, word: 'text-xl' },
  lg: { icon: 48, word: 'text-2xl' },
}

/** Nexrena brand mark — layered command bars + gold node */
export function NexrenaLogo({ size = 'md', showWordmark = true, className = '' }: Props) {
  const s = sizes[size]
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <rect width="48" height="48" rx="12" fill="#141820" />
        <rect x="1" y="1" width="46" height="46" rx="11" stroke="#C9A96E" strokeOpacity="0.35" strokeWidth="1.5" />
        <rect x="12" y="14" width="24" height="4" rx="2" fill="#C9A96E" opacity="0.9" />
        <rect x="12" y="22" width="18" height="4" rx="2" fill="#64748b" />
        <rect x="12" y="30" width="21" height="4" rx="2" fill="#64748b" opacity="0.7" />
        <circle cx="34" cy="14" r="3.5" fill="#E8D5B0" />
      </svg>
      {showWordmark && (
        <div className={`flex items-baseline gap-0.5 leading-none ${s.word}`}>
          <span className="font-serif text-white tracking-tight">Nex</span>
          <span className="font-serif text-gold tracking-tight">rena</span>
        </div>
      )}
    </div>
  )
}
