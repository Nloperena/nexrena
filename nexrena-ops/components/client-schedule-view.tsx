'use client'

import type { PortalAccount } from '@/lib/portal-types'
import { CALENDLY_EMBED_STYLE, isCalendlyEnabled, mailtoFallback } from '@/lib/calendly'
import { CalendlyInline } from '@/components/calendly-inline'
import { CalendlyBookButton } from '@/components/calendly-book-button'

type Props = {
  account: PortalAccount | null
}

export function ClientScheduleView({ account }: Props) {
  const prefill = account
    ? { name: account.name, email: account.email }
    : undefined

  if (!isCalendlyEnabled()) {
    return (
      <div className="glass-panel rounded-xl border border-slate-800/60 p-8 text-center space-y-4">
        <p className="text-sm text-slate-400">
          Scheduling is not configured yet. Email Nico to book a call.
        </p>
        <a
          href={mailtoFallback()}
          className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold rounded-lg bg-gold text-obsidian hover:bg-gold-light transition-colors"
        >
          Email {mailtoFallback().replace('mailto:', '')}
        </a>
      </div>
    )
  }

  if (CALENDLY_EMBED_STYLE === 'popup') {
    return (
      <div className="glass-panel rounded-xl border border-slate-800/60 p-8 md:p-10 text-center space-y-6">
        <div>
          <h2 className="font-serif text-2xl text-white">Schedule with Nico</h2>
          <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
            Pick a time for a discovery call. We&apos;ll use your portal profile to prefill the form.
          </p>
        </div>
        <CalendlyBookButton prefill={prefill} size="md">
          Book a call
        </CalendlyBookButton>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-400">
        Pick a time that works for you — your name and email are prefilled from your account.
      </p>
      <CalendlyInline prefill={prefill} />
    </div>
  )
}
