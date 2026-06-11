'use client'

import { REQUEST_TYPE_OPTIONS } from '@/components/request-type-visuals'

type Props = {
  selectedIndex: number | null
  onSelect: (index: number) => void
}

export function RequestTypePicker({ selectedIndex, onSelect }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-400 text-center sm:text-left">
        Choose a path — then tell us what you need.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {REQUEST_TYPE_OPTIONS.map((option, index) => {
          const selected = selectedIndex === index
          const { Icon } = option
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(index)}
              className={`group relative flex flex-col items-center rounded-2xl border-2 p-4 pt-5 text-center transition-all duration-200 active:scale-[0.98] bg-gradient-to-b ${option.accentClass} ${
                selected
                  ? 'border-gold shadow-[0_0_28px_rgba(201,169,110,0.2)] scale-[1.02]'
                  : 'border-slate-700/60 hover:border-slate-500/80 hover:scale-[1.01]'
              }`}
            >
              <div className="w-[88px] h-[88px] mb-3 transition-transform duration-200 group-hover:scale-105">
                <Icon selected={selected} />
              </div>
              <p className="font-serif text-lg text-white">{option.label}</p>
              <p className="text-xs text-slate-400 mt-1 leading-snug">{option.tagline}</p>
              {selected && (
                <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,169,110,0.8)]" />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
