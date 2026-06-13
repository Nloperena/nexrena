'use client'

import type { ReactNode } from 'react'
import { PORTAL_GRADIENTS, PORTAL_GRADIENT_SVGS, type PortalPhotoKey } from '@/lib/portal-imagery'

type Props = {
  photo?: PortalPhotoKey
  imageUrl?: string
  svgSrc?: string
  alt?: string
  overlay?: number
  className?: string
  children?: ReactNode
  rounded?: 'xl' | '2xl' | '3xl' | 'none'
  aspect?: 'video' | 'wide' | 'square' | 'auto'
}

const ROUNDED = {
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
  none: '',
} as const

const ASPECT = {
  video: 'aspect-video',
  wide: 'aspect-[21/9]',
  square: 'aspect-square',
  auto: '',
} as const

export function PortalMediaPanel({
  photo,
  imageUrl,
  svgSrc,
  alt = '',
  overlay = 55,
  className = '',
  children,
  rounded = '2xl',
  aspect = 'auto',
}: Props) {
  const gradient = photo ? PORTAL_GRADIENTS[photo] : undefined
  const mappedSvg = photo ? PORTAL_GRADIENT_SVGS[photo] : undefined
  const svg = svgSrc ?? mappedSvg

  return (
    <div
      className={`relative overflow-hidden ${ROUNDED[rounded]} ${ASPECT[aspect]} ${className}`}
      style={gradient ? { backgroundImage: gradient } : imageUrl ? { backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      role={alt ? 'img' : undefined}
      aria-label={alt || undefined}
    >
      {svg && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={svg}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0c0f12] via-[#0c0f12]/80 to-[#0c0f12]/20"
        style={{ opacity: overlay / 100 }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-br from-gold/[0.08] via-transparent to-sky-500/[0.04]" aria-hidden />
      {children && <div className="relative z-10 h-full">{children}</div>}
    </div>
  )
}

type CardProps = {
  photo: PortalPhotoKey
  title: string
  subtitle?: string
  icon?: ReactNode
  onClick?: () => void
  primary?: boolean
  className?: string
}

export function PortalImageActionCard({
  photo,
  title,
  subtitle,
  icon,
  onClick,
  primary,
  className = '',
}: CardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col overflow-hidden rounded-2xl border-2 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#111418] ${
        primary
          ? 'border-gold/40 shadow-[0_8px_40px_rgba(201,169,110,0.12)] hover:border-gold/60'
          : 'border-slate-600/80 hover:border-slate-500'
      } ${className}`}
    >
      <PortalMediaPanel
        photo={photo}
        aspect="video"
        overlay={62}
        rounded="none"
        className="min-h-[140px] sm:min-h-[160px]"
      >
        {icon && (
          <div className="absolute bottom-3 left-4 flex h-12 w-12 items-center justify-center rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-gold-light">
            {icon}
          </div>
        )}
      </PortalMediaPanel>
      <div className={`px-5 py-5 ${primary ? 'bg-slate-900/90' : 'bg-slate-900/70'}`}>
        <p className="font-serif text-xl text-white">{title}</p>
        {subtitle && <p className="text-lg text-slate-300 mt-2 leading-snug">{subtitle}</p>}
      </div>
    </button>
  )
}
