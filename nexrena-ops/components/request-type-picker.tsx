'use client'

import { REQUEST_TYPE_OPTIONS } from '@/components/request-type-visuals'
import { portalFocusRing, portalSectionHintClass } from '@/lib/portal-a11y'
import { PortalMediaPanel } from '@/components/portal-media-panel'
import type { PortalPhotoKey } from '@/lib/portal-imagery'

const REQUEST_PHOTOS: PortalPhotoKey[] = ['websites', 'request', 'messages']

type Props = {
  selectedIndex: number | null
  onSelect: (index: number) => void
}

export function RequestTypePicker({ selectedIndex, onSelect }: Props) {
  return (
    <div className="space-y-4">
      <p className={`${portalSectionHintClass} text-center sm:text-left`}>
        Choose what you need help with — then tell us the details.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {REQUEST_TYPE_OPTIONS.map((option, index) => {
          const selected = selectedIndex === index
          const { Icon } = option
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onSelect(index)}
              aria-pressed={selected}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border-2 transition-all duration-200 min-h-[220px] ${portalFocusRing} ${
                selected
                  ? 'border-gold shadow-[0_0_28px_rgba(201,169,110,0.2)]'
                  : 'border-slate-600 hover:border-slate-400'
              }`}
            >
              <PortalMediaPanel
                photo={REQUEST_PHOTOS[index] ?? 'request'}
                aspect="video"
                overlay={65}
                rounded="none"
                className="min-h-[120px]"
              />
              <div className={`flex flex-col items-center p-5 pt-4 text-center bg-slate-900/80 ${option.accentClass}`}>
                <div className="w-[72px] h-[72px] mb-3 -mt-10 relative z-10 rounded-2xl bg-slate-900/90 p-2 border border-slate-600/80 shadow-lg">
                  <Icon selected={selected} />
                </div>
                <p className="font-serif text-xl text-white">{option.label}</p>
                <p className="text-base text-slate-300 mt-2 leading-snug">{option.tagline}</p>
              </div>
              {selected && (
                <span className="absolute top-3 right-3 h-3 w-3 rounded-full bg-gold shadow-[0_0_8px_rgba(201,169,110,0.8)]" aria-hidden />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
