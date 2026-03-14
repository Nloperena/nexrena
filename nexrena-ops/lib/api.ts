const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'
const KEY  = process.env.NEXT_PUBLIC_API_KEY || ''

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(KEY ? { Authorization: `Bearer ${KEY}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `API ${method} ${path} failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  get:   <T>(path: string) => request<T>('GET', path),
  post:  <T>(path: string, body: unknown) => request<T>('POST', path, body),
  put:   <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  del:   <T = { ok: boolean }>(path: string) => request<T>('DELETE', path),
}
