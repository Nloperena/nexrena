'use client'

import { useCallback, useRef, useState } from 'react'
import { Btn, Modal } from '@/components/ui'
import { uploadPortalWebsiteMedia } from '@/lib/portal-client'
import { websiteFolderUploadHint } from '@/lib/website-media-labels'
import type { WebsiteMediaCatalog } from '@/lib/website-media-types'

type Props = {
  open: boolean
  folderId: string
  folderName: string
  onClose: () => void
  onUploaded: (catalog: WebsiteMediaCatalog) => void
}

export function WebsiteMediaUploadModal({
  open,
  folderId,
  folderName,
  onClose,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const reset = () => {
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
      const result = await uploadPortalWebsiteMedia(file, folderId)
      onUploaded(result.catalog)
      setSuccess(`${file.name} added to ${folderName}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setLoading(false)
    }
  }, [folderId, folderName, onUploaded])

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
    <Modal title={`Upload to ${folderName}`} onClose={handleClose} wide>
      <p className="text-sm text-slate-400 mb-5">
        {websiteFolderUploadHint(folderName)} Images and videos only, up to 10 MB.
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
        <p className="text-xs text-slate-500 mt-2">or click to browse</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*,video/mp4,video/webm,video/quicktime"
          onChange={onFileChange}
          disabled={loading}
        />
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
