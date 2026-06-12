'use client'

import { useEffect, useState } from 'react'
import { formatFileBytes } from '@/lib/portal-file-utils'
import {
  fetchOpsMessageAttachmentUrl,
  fetchPortalMessageAttachmentUrl,
} from '@/lib/signed-url-client'
import { isImageMime, isVideoMime } from '@/lib/message-chat-utils'

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

function ImageLightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <button
      type="button"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 cursor-zoom-out"
      onClick={onClose}
      aria-label="Close image preview"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="max-h-[90vh] max-w-full rounded-lg object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </button>
  )
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
  const [expanded, setExpanded] = useState(false)

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
      <div className="mt-1.5 rounded-lg bg-black/20 px-3 py-2 text-xs text-slate-400">
        Could not load {attachment.filename}
      </div>
    )
  }

  if (!url) {
    return (
      <div
        className="mt-1.5 h-32 w-full max-w-[280px] animate-pulse rounded-xl bg-slate-800/60"
        aria-hidden
      />
    )
  }

  const isImage = isImageMime(attachment.mimeType, attachment.filename)
  const isVideo = isVideoMime(attachment.mimeType, attachment.filename)

  if (isImage) {
    return (
      <>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-1 block max-w-full overflow-hidden rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/60"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={url}
            alt={attachment.filename}
            className="max-h-64 max-w-[min(100%,320px)] w-auto rounded-xl object-contain"
            loading="lazy"
          />
        </button>
        {expanded && (
          <ImageLightbox
            src={url}
            alt={attachment.filename}
            onClose={() => setExpanded(false)}
          />
        )}
      </>
    )
  }

  if (isVideo) {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        className="mt-1.5 block max-h-80 max-w-[min(100%,320px)] w-full rounded-xl bg-black/40"
        aria-label={attachment.filename}
      >
        <source src={url} type={attachment.mimeType || 'video/mp4'} />
      </video>
    )
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      download={attachment.filename}
      className="mt-1.5 inline-flex max-w-full items-center gap-2 rounded-full bg-black/25 px-3 py-1.5 text-xs text-slate-200 transition-colors hover:bg-black/40"
    >
      <span className="shrink-0 text-base leading-none" aria-hidden>📄</span>
      <span className="truncate">{attachment.filename}</span>
      <span className="shrink-0 text-slate-400">{formatFileBytes(attachment.sizeBytes)}</span>
    </a>
  )
}

export function MessageAttachments({ attachments, variant }: Props) {
  if (!attachments.length) return null

  return (
    <div className="space-y-1.5">
      {attachments.map((attachment) => (
        <SignedAttachment key={attachment.id} attachment={attachment} variant={variant} />
      ))}
    </div>
  )
}
