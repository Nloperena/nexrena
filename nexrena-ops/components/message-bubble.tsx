'use client'

import { MessageAttachments, type MessageAttachmentView } from '@/components/message-attachments'
import { formatMessageTime } from '@/lib/message-chat-utils'

export type ChatBubbleMessage = {
  id: string
  message: string
  createdAt: string
  attachments?: MessageAttachmentView[]
}

type Props = {
  message: ChatBubbleMessage
  /** true = outgoing (right-aligned), false = incoming (left-aligned) */
  isOutgoing: boolean
  senderLabel?: string
  variant: 'portal' | 'ops'
  size?: 'portal' | 'ops'
}

export function MessageBubble({
  message,
  isOutgoing,
  senderLabel,
  variant,
  size = 'ops',
}: Props) {
  const attachments = message.attachments ?? []
  const hasText = Boolean(message.message.trim())
  const hasMedia = attachments.length > 0
  const mediaOnly = hasMedia && !hasText

  const textSize = size === 'portal' ? 'text-lg leading-relaxed' : 'text-sm leading-relaxed'
  const pad = mediaOnly ? 'p-2' : size === 'portal' ? 'px-4 py-3' : 'px-3.5 py-2'
  const timeSize = size === 'portal' ? 'text-base text-slate-300' : 'text-[11px] text-slate-400'

  return (
    <div className={`flex ${isOutgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[min(85%,420px)] rounded-[20px] ${pad} ${
          isOutgoing
            ? 'bg-gold/30 text-white rounded-br-[4px] border-2 border-gold/35'
            : 'bg-slate-700/90 text-slate-50 rounded-bl-[4px] border-2 border-slate-600/80'
        }`}
      >
        {hasText && (
          <p className={`${textSize} whitespace-pre-wrap break-words`}>{message.message}</p>
        )}
        {hasMedia && (
          <MessageAttachments attachments={attachments} variant={variant} />
        )}
        <p
          className={`${timeSize} mt-2 ${hasText || hasMedia ? '' : 'mt-0'} ${
            isOutgoing ? 'text-right text-gold-light/90' : ''
          }`}
        >
          {senderLabel ? `${senderLabel} · ` : ''}
          {formatMessageTime(message.createdAt)}
        </p>
      </div>
    </div>
  )
}
