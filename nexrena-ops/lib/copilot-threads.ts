import { getPortalToken } from '@/lib/portal-client'
import type { CopilotPersona, CopilotThread } from '@/lib/copilot-types'
import { activeThreadStorageKey } from '@/lib/copilot-types'

export { activeThreadStorageKey }

type ThreadResponse = { thread: CopilotThread & { messages?: unknown[] }; messages?: unknown[] }

function threadsBase(persona: CopilotPersona): string {
  return persona === 'team' ? '/api/ops/ai/threads' : '/api/portal/ai/threads'
}

function authHeaders(persona: CopilotPersona): HeadersInit {
  if (persona !== 'client') return {}
  const token = getPortalToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json()
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : `Request failed (${res.status})`)
  }
  return data as T
}

export async function listCopilotThreads(persona: CopilotPersona): Promise<CopilotThread[]> {
  const res = await fetch(threadsBase(persona), { headers: authHeaders(persona), cache: 'no-store' })
  const data = await parseJson<{ threads: CopilotThread[] }>(res)
  return data.threads
}

export async function loadCopilotThread(
  persona: CopilotPersona,
  threadId: string,
): Promise<{ thread: CopilotThread; messages: unknown[] }> {
  const res = await fetch(`${threadsBase(persona)}/${threadId}`, {
    headers: authHeaders(persona),
    cache: 'no-store',
  })
  const data = await parseJson<ThreadResponse>(res)
  const { messages = [], ...thread } = data.thread
  return {
    thread: { ...thread, preview: thread.preview ?? null },
    messages: Array.isArray(data.messages) ? data.messages : messages,
  }
}

export async function createCopilotThread(persona: CopilotPersona): Promise<CopilotThread> {
  const res = await fetch(threadsBase(persona), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders(persona) },
    body: JSON.stringify({}),
  })
  const data = await parseJson<{ thread: CopilotThread }>(res)
  return data.thread
}

export async function syncCopilotThread(
  persona: CopilotPersona,
  threadId: string,
  messages: unknown[],
): Promise<CopilotThread> {
  const res = await fetch(`${threadsBase(persona)}/${threadId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...authHeaders(persona) },
    body: JSON.stringify({ messages }),
  })
  const data = await parseJson<{ thread: CopilotThread }>(res)
  return data.thread
}

export async function deleteCopilotThread(persona: CopilotPersona, threadId: string): Promise<void> {
  const res = await fetch(`${threadsBase(persona)}/${threadId}`, {
    method: 'DELETE',
    headers: authHeaders(persona),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(typeof data.error === 'string' ? data.error : `Delete failed (${res.status})`)
  }
}
