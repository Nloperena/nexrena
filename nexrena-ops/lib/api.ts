/** Browser calls go through the Next.js proxy so the API key stays server-side. */
const BASE = '/api/ops'

async function request<T>(method: string, path: string, body?: unknown, attempt = 0): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  if (!res.ok) {
    if (method === 'GET' && attempt < 2 && (res.status >= 500 || res.status === 429)) {
      await new Promise((r) => setTimeout(r, 800 * (attempt + 1)))
      return request<T>(method, path, body, attempt + 1)
    }
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `API ${method} ${path} failed: ${res.status}`)
  }
  return res.json()
}

async function requestMultipart<T>(path: string, formData: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `API POST ${path} failed: ${res.status}`)
  }
  return res.json()
}

export const api = {
  get:   <T>(path: string) => request<T>('GET', path),
  post:  <T>(path: string, body: unknown) => request<T>('POST', path, body),
  postMultipart: <T>(path: string, formData: FormData) => requestMultipart<T>(path, formData),
  put:   <T>(path: string, body: unknown) => request<T>('PUT', path, body),
  patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
  del:   <T = { ok: boolean }>(path: string) => request<T>('DELETE', path),
}
