'use client'

import { useMemo, useState } from 'react'
import { ClientFormHistorySection } from '@/components/client-form-history-section'
import type { PortalFormSubmission, PortalFormSubmissionStatus } from '@/lib/portal-types'
import {
  deletePortalFormSubmission,
  updatePortalFormSubmission,
} from '@/lib/portal-client'
import { portalFocusRing, portalSectionHintClass } from '@/lib/portal-a11y'

type View = 'active' | 'archived'

type Props = {
  submissions: PortalFormSubmission[]
  onSubmissionsChange: (next: PortalFormSubmission[]) => void
}

function tabClass(active: boolean) {
  return `min-h-[44px] rounded-xl px-4 py-2 text-base font-medium transition-colors ${portalFocusRing} ${
    active
      ? 'bg-gold/15 text-gold border border-gold/30'
      : 'text-slate-400 hover:text-slate-200 border border-transparent'
  }`
}

export function ClientFormsView({ submissions, onSubmissionsChange }: Props) {
  const [view, setView] = useState<View>('active')
  const [busyId, setBusyId] = useState<string | null>(null)

  const activeCount = useMemo(
    () => submissions.filter((s) => s.status !== 'archived').length,
    [submissions],
  )
  const archivedCount = useMemo(
    () => submissions.filter((s) => s.status === 'archived').length,
    [submissions],
  )

  const visible = useMemo(
    () =>
      submissions.filter((s) =>
        view === 'archived' ? s.status === 'archived' : s.status !== 'archived',
      ),
    [submissions, view],
  )

  const patchLocal = (id: string, status: PortalFormSubmissionStatus) => {
    onSubmissionsChange(submissions.map((s) => (s.id === id ? { ...s, status } : s)))
  }

  const removeLocal = (id: string) => {
    onSubmissionsChange(submissions.filter((s) => s.id !== id))
  }

  const runAction = async (id: string, action: () => Promise<void>) => {
    setBusyId(id)
    try {
      await action()
    } catch (err) {
      console.error(err)
    } finally {
      setBusyId(null)
    }
  }

  const handleMarkRead = (sub: PortalFormSubmission) => {
    const next: PortalFormSubmissionStatus = sub.status === 'new' ? 'read' : 'new'
    void runAction(sub.id, async () => {
      patchLocal(sub.id, next)
      await updatePortalFormSubmission(sub.id, { status: next })
    })
  }

  const handleArchive = (sub: PortalFormSubmission) => {
    if (
      !window.confirm(
        `Move "${sub.submitterName}" to archive? You can restore it later from the Archive tab.`,
      )
    ) {
      return
    }
    void runAction(sub.id, async () => {
      patchLocal(sub.id, 'archived')
      await updatePortalFormSubmission(sub.id, { status: 'archived' })
    })
  }

  const handleRestore = (sub: PortalFormSubmission) => {
    void runAction(sub.id, async () => {
      patchLocal(sub.id, 'read')
      await updatePortalFormSubmission(sub.id, { status: 'read' })
    })
  }

  const handleDeletePermanently = (sub: PortalFormSubmission) => {
    if (
      !window.confirm(
        `Delete "${sub.submitterName}" permanently? This cannot be undone.`,
      )
    ) {
      return
    }
    void runAction(sub.id, async () => {
      removeLocal(sub.id)
      await deletePortalFormSubmission(sub.id)
    })
  }

  return (
    <div className="space-y-6 pt-2">
      <p className={portalSectionHintClass}>
        Contact form leads from your website — names, emails, and messages from visitors.
      </p>

      <div className="flex flex-wrap gap-2">
        <button type="button" className={tabClass(view === 'active')} onClick={() => setView('active')}>
          Active{activeCount > 0 ? ` (${activeCount})` : ''}
        </button>
        <button
          type="button"
          className={tabClass(view === 'archived')}
          onClick={() => setView('archived')}
        >
          Archive{archivedCount > 0 ? ` (${archivedCount})` : ''}
        </button>
      </div>

      <ClientFormHistorySection
        submissions={visible}
        view={view}
        busyId={busyId}
        onMarkRead={handleMarkRead}
        onArchive={handleArchive}
        onRestore={handleRestore}
        onDeletePermanently={handleDeletePermanently}
      />
    </div>
  )
}
