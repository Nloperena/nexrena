'use client'

import { useMemo, useState } from 'react'
import { ActionToast } from '@/components/action-toast'
import { ClientFormHistorySection } from '@/components/client-form-history-section'
import { FormLeadConfirmDialog } from '@/components/form-lead-confirm-dialog'
import type { PortalFormSubmission, PortalFormSubmissionStatus } from '@/lib/portal-types'
import {
  deletePortalFormSubmission,
  updatePortalFormSubmission,
} from '@/lib/portal-client'
import { portalFocusRing, portalSectionHintClass } from '@/lib/portal-a11y'

type View = 'active' | 'archived'

type PendingAction = {
  type: 'archive' | 'delete'
  sub: PortalFormSubmission
}

type ToastState = {
  message: string
  variant?: 'success' | 'error'
  onUndo?: () => void
}

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
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [toast, setToast] = useState<ToastState | null>(null)

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

  const runAction = async (id: string, action: () => Promise<void>, errorMessage?: string) => {
    setBusyId(id)
    try {
      await action()
    } catch (err) {
      console.error(err)
      setToast({
        message: errorMessage ?? 'Something went wrong. Please try again.',
        variant: 'error',
      })
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
    setPending({ type: 'archive', sub })
  }

  const confirmArchive = () => {
    if (!pending || pending.type !== 'archive') return
    const sub = pending.sub
    setPending(null)
    void runAction(sub.id, async () => {
      patchLocal(sub.id, 'archived')
      await updatePortalFormSubmission(sub.id, { status: 'archived' })
      setToast({
        message: `Moved "${sub.submitterName}" to archive`,
        onUndo: () => {
          void runAction(sub.id, async () => {
            patchLocal(sub.id, 'read')
            await updatePortalFormSubmission(sub.id, { status: 'read' })
          })
        },
      })
    }, 'Could not archive this lead.')
  }

  const handleRestore = (sub: PortalFormSubmission) => {
    void runAction(sub.id, async () => {
      patchLocal(sub.id, 'read')
      await updatePortalFormSubmission(sub.id, { status: 'read' })
      setToast({
        message: `Restored "${sub.submitterName}"`,
        onUndo: () => {
          void runAction(sub.id, async () => {
            patchLocal(sub.id, 'archived')
            await updatePortalFormSubmission(sub.id, { status: 'archived' })
          })
        },
      })
    }, 'Could not restore this lead.')
  }

  const handleDeletePermanently = (sub: PortalFormSubmission) => {
    setPending({ type: 'delete', sub })
  }

  const confirmDelete = () => {
    if (!pending || pending.type !== 'delete') return
    const sub = pending.sub
    setPending(null)
    void runAction(sub.id, async () => {
      removeLocal(sub.id)
      await deletePortalFormSubmission(sub.id)
      setToast({ message: `"${sub.submitterName}" deleted permanently` })
    }, 'Could not delete this lead.')
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

      {pending && (
        <FormLeadConfirmDialog
          action={pending.type}
          sub={pending.sub}
          busy={busyId === pending.sub.id}
          onConfirm={pending.type === 'archive' ? confirmArchive : confirmDelete}
          onCancel={() => setPending(null)}
        />
      )}

      {toast && (
        <ActionToast
          message={toast.message}
          variant={toast.variant}
          onUndo={toast.onUndo}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}
