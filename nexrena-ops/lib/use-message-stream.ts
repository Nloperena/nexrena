'use client'

import { useEffect, useRef } from 'react'
import { getPortalToken } from '@/lib/portal-client'
import { parseMessageStreamEvent, type MessageStreamEvent } from '@/lib/message-realtime-utils'

const PORTAL_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://nexrena-api-5dc54effaa9f.herokuapp.com'

function connectStream(url: string, onEvent: (event: MessageStreamEvent) => void) {
  if (typeof window === 'undefined') return () => {}

  const source = new EventSource(url)
  source.onmessage = (msg) => {
    const event = parseMessageStreamEvent(msg.data)
    if (event) onEvent(event)
  }

  return () => source.close()
}

export function useOpsMessageStream(
  onEvent: (event: MessageStreamEvent) => void,
  contactFilter?: string,
) {
  const handlerRef = useRef(onEvent)
  handlerRef.current = onEvent

  useEffect(() => {
    const params = new URLSearchParams()
    if (contactFilter) params.set('contactId', contactFilter)
    const qs = params.toString()
    const url = `/api/ops/messages/stream${qs ? `?${qs}` : ''}`

    return connectStream(url, (event) => handlerRef.current(event))
  }, [contactFilter])
}

export function usePortalMessageStream(onEvent: (event: MessageStreamEvent) => void) {
  const handlerRef = useRef(onEvent)
  handlerRef.current = onEvent

  useEffect(() => {
    const token = getPortalToken()
    if (!token) return undefined

    const params = new URLSearchParams({ token })
    const url = `${PORTAL_API_BASE}/api/portal/messages/stream?${params}`

    return connectStream(url, (event) => handlerRef.current(event))
  }, [])
}
