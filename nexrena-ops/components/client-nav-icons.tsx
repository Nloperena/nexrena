'use client'

import type { ComponentType } from 'react'
import type { ClientPortalView } from '@/components/client-nav'
import {
  IconCalendar,
  IconFolder,
  IconGlobe,
  IconInvoice,
  IconMessage,
  IconSpark,
} from '@/components/client-portal-visuals'

type IconProps = { className?: string }

export function IconHome({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 10.5 12 4l8 6.5V19a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19v-8.5Z" />
    </svg>
  )
}

export function IconForms({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 4h8a2 2 0 0 1 2 2v14l-4-2-4 2-4-2-4 2V6a2 2 0 0 1 2-2Z" />
      <path d="M9 9h6M9 13h4" />
    </svg>
  )
}

export function IconSettings({ className = 'w-5 h-5' }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  )
}

export const CLIENT_NAV_ICON: Record<
  ClientPortalView,
  ComponentType<{ className?: string }>
> = {
  home: IconHome,
  messages: IconMessage,
  schedule: IconCalendar,
  billing: IconInvoice,
  files: IconFolder,
  websites: IconGlobe,
  forms: IconForms,
  requests: IconSpark,
  settings: IconSettings,
}
