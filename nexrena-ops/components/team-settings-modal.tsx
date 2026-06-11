'use client'

import { useState, type FormEvent } from 'react'
import { Btn, Field, Modal, inputCls } from '@/components/ui'

const TEAM_USERNAME = 'NLoperena'

type Props = {
  displayName: string
  onClose: () => void
  onSaveDisplayName: (name: string) => void
}

export function TeamSettingsModal({ displayName, onClose, onSaveDisplayName }: Props) {
  const [name, setName] = useState(displayName)
  const [saved, setSaved] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim() || TEAM_USERNAME
    onSaveDisplayName(trimmed)
    setSaved(true)
  }

  return (
    <Modal title="Account settings" onClose={onClose}>
      <p className="text-sm text-slate-400 mb-5">Team operations access. Settings are stored on this device only.</p>
      {saved && <p className="text-sm text-emerald-400 mb-4">Display name saved.</p>}

      <form className="space-y-4" onSubmit={onSubmit}>
        <Field label="Display name">
          <input className={inputCls} value={name} onChange={(e) => { setName(e.target.value); setSaved(false) }} autoComplete="nickname" />
        </Field>
        <Field label="Team username">
          <input className={`${inputCls} opacity-70 cursor-not-allowed`} value={TEAM_USERNAME} readOnly tabIndex={-1} />
        </Field>
        <div className="flex justify-end gap-2 pt-2">
          <Btn type="button" variant="ghost" onClick={onClose}>Close</Btn>
          <Btn type="submit">Save</Btn>
        </div>
      </form>
    </Modal>
  )
}
