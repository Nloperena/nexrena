'use client'

type Props = {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}

export function ShopCategoryChip({ active, onClick, children }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 snap-start rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
        active
          ? 'bg-gold/15 text-gold-light border border-gold/40 shadow-[0_0_20px_rgba(201,169,110,0.12)]'
          : 'bg-slate-800/50 text-slate-400 border border-slate-700/60 hover:text-white hover:border-slate-600'
      }`}
    >
      {children}
    </button>
  )
}
