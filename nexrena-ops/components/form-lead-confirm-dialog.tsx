'use client'

import { useState } from 'react'
import { Btn, Field, inputCls, Modal } from '@/components/ui'

export type FormLeadRef = { id: string; submitterName: string }

type Action = 'archive' | 'delete'

type Props = {
  action: Action
  sub: FormLeadRef
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function FormLeadConfirmDialog({ action, sub, busy, onConfirm, onCancel }: Props) {
  const [typed, setTyped] = useState('')

  const isDelete = action === 'delete'
  const title = isDelete ? 'Delete permanently?' : 'Move to archive?'
  const deleteReady = typed.trim().toLowerCase() === 'delete'

  return (
    <Modal title={title} onClose={onCancel}>
      <div className="space-y-5">
        {isDelete ? (
          <>
            <p className="text-sm text-slate-300 leading-relaxed">
              <span className="font-medium text-white">{sub.submitterName}</span> will be
              deleted permanently. This cannot be undone.
            </p>
            <Field label="Type DELETE to confirm">
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                className={inputCls}
                placeholder="DELETE"
                autoComplete="off"
                aria-label="Type DELETE to confirm permanent deletion"
              />
            </Field>
          </>
        ) : (
          <p className="text-sm text-slate-300 leading-relaxed">
            Move <span className="font-medium text-white">{sub.submitterName}</span> to archive?
            You can restore it later from the Archive tab.
          </p>
        )}

        <div className="flex flex-wrap gap-2 justify-end">
          <Btn variant="ghost" onClick={onCancel} disabled={busy}>
            Cancel
          </Btn>
          {isDelete ? (
            <Btn variant="danger" onClick={onConfirm} disabled={busy || !deleteReady}>
              {busy ? 'Deleting…' : 'Delete permanently'}
            </Btn>
          ) : (
            <Btn onClick={onConfirm} disabled={busy}>
              {busy ? 'Archiving…' : 'Move to archive'}
            </Btn>
          )}
        </div>
      </div>
    </Modal>
  )
}
