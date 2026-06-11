'use client'

import { useEffect, useState } from 'react'
import { formatFileBytes } from '@/lib/portal-file-utils'
import {
  fetchOpsMessageAttachmentUrl,
  fetchPortalMessageAttachmentUrl,
} from '@/lib/signed-url-client'

export type MessageAttachmentView = {
  id: string
  filename: string
  mimeType: string
  sizeBytes: number
}

type Props = {
  attachments: MessageAttachmentView[]
  variant: 'portal' | 'ops'
}

function SignedAttachment({
  attachment,
  variant,
}: {
  attachment: MessageAttachmentView
  variant: 'portal' | 'ops'
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    const load = variant === 'portal'
      ? fetchPortalMessageAttachmentUrl(attachment.id)
      : fetchOpsMessageAttachmentUrl(attachment.id)

    load
      .then((signed) => { if (active) setUrl(signed) })
      .catch(() => { if (active) setError(true) })

    return () => { active = false }
  }, [attachment.id, variant])

  if (error) {
    return (
      <p className="text-xs text-slate-500 mt-2">
        Could not load {attachment.filename}
      </p>
    )
  }

  if (!url) {
    return <p className="text-xs text-slate-500 mt-2 animate-pulse">Loading attachment…</p>
  }

  const isImage = attachment.mimeType.startsWith('image/')
  const isVideo = attachment.mimeType.startsWith('video/')

  if (isImage) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block mt-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={attachment.filename}
          className="max-w-full max-h-48 rounded-lg border border-slate-700/50 object-cover"
        />
      </a>
    )
  }

  if (isVideo) {
    return (
      <video
        src={url}
        controls
        className="mt-2 max-w-full max-h-48 rounded-lg border border-slate-700/50"
        preload="metadata"
      />
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-2 inline-flex items-center gap-2 text-xs text-gold hover:underline"
    >
      {attachment.filename} ({formatFileBytes(attachment.sizeBytes)})
    </a>
  )
}

export function MessageAttachments({ attachments, variant }: Props) {
  if (!attachments.length) return null

  return (
    <div className="space-y-2">
      {attachments.map((attachment) => (
        <SignedAttachment key={attachment.id} attachment={attachment} variant={variant} />
      ))}
    </div>
  )
}
