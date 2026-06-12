'use client'

import { useRef } from 'react'
import { Btn } from '@/components/ui'
import { portalFocusRing, portalTextareaCls } from '@/lib/portal-a11y'
import { MESSAGE_ATTACHMENT_ACCEPT } from '@/lib/message-chat-utils'

type Props = {
  value: string
  onChange: (value: string) => void
  onSend: () => void
  pendingFiles: File[]
  onPickFiles: (files: File[]) => void
  onRemoveFile: (index: number) => void
  submitting?: boolean
  disabled?: boolean
  placeholder?: string
  size?: 'portal' | 'ops'
}

export function MessageComposer({
  value,
  onChange,
  onSend,
  pendingFiles,
  onPickFiles,
  onRemoveFile,
  submitting = false,
  disabled = false,
  placeholder = 'Type a message…',
  size = 'ops',
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isPortal = size === 'portal'

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!disabled && !submitting && (value.trim() || pendingFiles.length)) onSend()
    }
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? [])
    onPickFiles(picked)
    e.target.value = ''
  }

  const attachBtnClass = isPortal
    ? `shrink-0 flex h-14 w-14 items-center justify-center rounded-full text-2xl text-slate-200 hover:bg-slate-800/60 hover:text-white ${portalFocusRing}`
    : 'shrink-0 flex h-10 w-10 items-center justify-center rounded-full text-lg text-slate-400 hover:bg-slate-800/60 hover:text-white'

  const textareaClass = isPortal
    ? `flex-1 ${portalTextareaCls} min-h-[56px] max-h-40 py-3 resize-none rounded-3xl`
    : 'flex-1 rounded-3xl bg-slate-900/80 border border-slate-700/60 px-4 py-2.5 text-sm text-white min-h-[40px] max-h-32 resize-none focus:outline-none focus:border-slate-600'

  return (
    <div className="shrink-0 border-t border-slate-800/60 bg-slate-950/60 px-3 py-3">
      {pendingFiles.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {pendingFiles.map((file, i) => (
            <span
              key={`${file.name}-${i}`}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-800/80 px-4 py-2 text-base text-slate-100"
            >
              <span className="truncate">{file.name}</span>
              <button
                type="button"
                className="shrink-0 text-slate-500 hover:text-white"
                onClick={() => onRemoveFile(i)}
                aria-label={`Remove ${file.name}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={MESSAGE_ATTACHMENT_ACCEPT}
          multiple
          onChange={onFileChange}
        />
        <button
          type="button"
          className={attachBtnClass}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach file"
        >
          📎
        </button>
        <textarea
          className={textareaClass}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <Btn
          size={isPortal ? 'lg' : 'sm'}
          disabled={disabled || submitting || (!value.trim() && pendingFiles.length === 0)}
          onClick={onSend}
        >
          {submitting ? '…' : 'Send'}
        </Btn>
      </div>
    </div>
  )
}
