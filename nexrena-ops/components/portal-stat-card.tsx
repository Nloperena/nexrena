'use client'

import type { ReactNode } from 'react'
import { portalCardClass, portalFocusRing } from '@/lib/portal-a11y'
import { PortalMediaPanel } from '@/components/portal-media-panel'
import type { PortalPhotoKey } from '@/lib/portal-imagery'

export function PortalStatCard({
  label,
  value,
  sub,
  gold,
  photo,
}: {
  label: string
  value: string
  sub?: ReactNode
  gold?: boolean
  photo?: PortalPhotoKey
}) {
  return (
    <div
      className={`${portalCardClass} relative overflow-hidden ${
        gold ? 'border-gold/50' : ''
      }`}
    >
      {photo && (
        <PortalMediaPanel
          photo={photo}
          overlay={82}
          rounded="none"
          className="absolute inset-0 opacity-30"
        />
      )}
      {gold && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold/[0.12] to-transparent rounded-bl-full" />
      )}
      <div className="relative">
        <p className="text-lg text-slate-200 mb-2 font-medium">{label}</p>
        <p className={`text-3xl sm:text-4xl font-serif font-semibold tracking-tight leading-tight ${gold ? 'text-gold-light' : 'text-white'}`}>
          {value}
        </p>
        {sub && <p className="text-lg text-slate-300 mt-3 leading-relaxed">{sub}</p>}
      </div>
    </div>
  )
}

export { portalFocusRing }
