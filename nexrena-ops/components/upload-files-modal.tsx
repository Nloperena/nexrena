'use client'

import { useCallback, useRef, useState } from 'react'
import { Btn, Field, Modal, inputCls, selectCls } from '@/components/ui'
import { uploadPortalAsset } from '@/lib/portal-client'
import { ASSET_CATEGORIES } from '@/lib/portal-file-utils'
import type { PortalAsset } from '@/lib/portal-types'

type Props = {
  open: boolean
  onClose: () => void
  onUploaded: (asset: PortalAsset) => void
  folderId?: string | null
}

export function UploadFilesModal({ open, onClose, onUploaded, folderId = null }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [category, setCategory] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const reset = () => {
    setCategory('')
    setNote('')
    setError(null)
    setSuccess(null)
    setDragOver(false)
  }

  const handleClose = () => {
    if (loading) return
    reset()
    onClose()
  }

  const uploadFile = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const asset = await uploadPortalAsset(file, {
        category: category || undefined,
        note: note || undefined,
        folderId,
      })
      onUploaded(asset)
      setSuccess(`${file.name} uploaded`)
      setNote('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }, [category, note, folderId, onUploaded])

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    await uploadFile(file)
  }

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    await uploadFile(file)
  }

  if (!open) return null

  return (
    <Modal title="Send us files" onClose={handleClose} wide>
      <p className="text-sm text-slate-400 mb-5">
        Logos, photos, copy, PDFs — anything we need for your project. No request needed first.
      </p>

      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click() }}
        className={`rounded-xl border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragOver ? 'border-gold/60 bg-gold/5' : 'border-slate-700/60 hover:border-slate-600'
        }`}
      >
        <p className="text-white font-medium">{loading ? 'Uploading…' : 'Drop a file here'}</p>
        <p className="text-xs text-slate-500 mt-2">or click to browse · images, PDF, ZIP · up to 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf,.zip"
          onChange={onFileChange}
          disabled={loading}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-5">
        <Field label="Category (optional)">
          <select
            className={selectCls}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            disabled={loading}
          >
            {ASSET_CATEGORIES.map((c) => (
              <option key={c.value || 'none'} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>
        <Field label="What is this for? (optional)">
          <input
            className={inputCls}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Homepage hero photos"
            disabled={loading}
            maxLength={500}
          />
        </Field>
      </div>

      {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
      {success && <p className="text-sm text-emerald-400 mt-4">{success}</p>}

      <div className="flex justify-end gap-2 mt-6">
        <Btn size="sm" variant="ghost" onClick={handleClose} disabled={loading}>Done</Btn>
        <Btn size="sm" onClick={() => inputRef.current?.click()} disabled={loading}>
          {loading ? 'Uploading…' : 'Browse files'}
        </Btn>
      </div>
    </Modal>
  )
}
