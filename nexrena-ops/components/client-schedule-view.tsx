'use client'

import type { PortalAccount } from '@/lib/portal-types'
import { CALENDLY_EMBED_STYLE, isCalendlyEnabled, mailtoFallback } from '@/lib/calendly'
import { CalendlyInline } from '@/components/calendly-inline'
import { CalendlyBookButton } from '@/components/calendly-book-button'
import { portalCardClass, portalSectionHintClass, portalSectionTitleClass } from '@/lib/portal-a11y'
import { PortalMediaPanel } from '@/components/portal-media-panel'

type Props = {
  account: PortalAccount | null
}

export function ClientScheduleView({ account }: Props) {
  const prefill = account
    ? { name: account.name, email: account.email }
    : undefined

  if (!isCalendlyEnabled()) {
    return (
      <div className={`${portalCardClass} text-center space-y-5`}>
        <p className={portalSectionHintClass}>
          Scheduling is not configured yet. Email Nico to book a call.
        </p>
        <a
          href={mailtoFallback()}
          className="inline-flex items-center justify-center px-7 py-4 text-lg font-semibold rounded-xl bg-gold text-obsidian hover:bg-gold-light transition-colors min-h-[56px]"
        >
          Email {mailtoFallback().replace('mailto:', '')}
        </a>
      </div>
    )
  }

  if (CALENDLY_EMBED_STYLE === 'popup') {
    return (
      <div className="space-y-6">
        <PortalMediaPanel photo="schedule" aspect="wide" overlay={55} className="min-h-[180px]">
          <div className="flex h-full min-h-[180px] flex-col justify-end p-6 sm:p-8">
            <h2 className={portalSectionTitleClass}>Schedule with Nico</h2>
            <p className={`${portalSectionHintClass} max-w-lg`}>
              Pick a time for a discovery call. We&apos;ll use your portal profile to prefill the form.
            </p>
          </div>
        </PortalMediaPanel>
        <div className={`${portalCardClass} text-center`}>
          <CalendlyBookButton prefill={prefill} size="md">
            Book a call
          </CalendlyBookButton>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PortalMediaPanel photo="schedule" aspect="wide" overlay={60} className="min-h-[140px]">
        <div className="flex h-full min-h-[140px] items-end p-6">
          <p className={portalSectionHintClass}>
            Pick a time that works for you — your name and email are prefilled from your account.
          </p>
        </div>
      </PortalMediaPanel>
      <CalendlyInline prefill={prefill} />
    </div>
  )
}
