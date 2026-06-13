'use client'

import type { ClientPortalView } from '@/components/client-nav'
import { PORTAL_HERO_IMAGES } from '@/lib/portal-imagery'

type Props = {
  view: ClientPortalView
  title?: string
  className?: string
}

export function ClientViewHero({ view, title, className = '' }: Props) {
  const heroSrc = PORTAL_HERO_IMAGES[view]

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-700/50 bg-[#0c0f12] ${className}`}
      aria-hidden={!title}
    >
      <div className="relative aspect-[21/9] max-h-[160px] sm:max-h-[180px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroSrc}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover object-center opacity-95"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0c0f12] via-[#0c0f12]/50 to-[#0c0f12]/10" />
        <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.06] via-transparent to-transparent" />
        {title && (
          <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-8 sm:px-6 sm:pb-5">
            <h1 className="font-serif text-xl sm:text-2xl text-white tracking-tight truncate">
              {title}
            </h1>
          </div>
        )}
      </div>
    </div>
  )
}
