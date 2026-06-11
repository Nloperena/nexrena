import type { PortalAccount, PortalInvoice, PortalProject, PortalProposal } from './portal-types'

const SESSION_KEY = 'nx-portal-token'
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://nexrena-api-5dc54effaa9f.herokuapp.com'

export function getPortalToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(SESSION_KEY)
}

export function setPortalToken(token: string) {
  localStorage.setItem(SESSION_KEY, token)
}

export function clearPortalToken() {
  localStorage.removeItem(SESSION_KEY)
}

async function portalFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getPortalToken()
  const headers = new Headers(init.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Request failed')
  }
  return data as T
}

export async function registerPortalAccount(payload: {
  name: string
  email: string
  password: string
  company?: string
}) {
  const data = await portalFetch<{ token: string; account: PortalAccount }>('/api/portal/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
  setPortalToken(data.token)
  return data.account
}

export async function loginPortalAccount(email: string, password: string) {
  const data = await portalFetch<{ token: string; account: PortalAccount }>('/api/portal/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  setPortalToken(data.token)
  return data.account
}

export async function fetchPortalMe() {
  return portalFetch<PortalAccount>('/api/portal/me')
}

export async function updatePortalProfile(payload: { name?: string; company?: string }) {
  return portalFetch<PortalAccount>('/api/portal/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function changePortalPassword(currentPassword: string, newPassword: string) {
  return portalFetch<PortalAccount>('/api/portal/me', {
    method: 'PATCH',
    body: JSON.stringify({ currentPassword, newPassword }),
  })
}

export async function fetchPortalProjects() {
  return portalFetch<PortalProject[]>('/api/portal/projects')
}

export async function fetchPortalInvoices() {
  return portalFetch<PortalInvoice[]>('/api/portal/invoices')
}

export async function fetchPortalInvoice(id: string) {
  return portalFetch<PortalInvoice>(`/api/portal/invoices/${id}`)
}

export async function fetchPortalProposals() {
  return portalFetch<PortalProposal[]>('/api/portal/proposals')
}

export function createPortalServiceRequest(payload: {
  projectType: string
  description: string
  budget?: string
  timeline?: string
}) {
  return portalFetch<import('./portal-types').PortalServiceRequest>('/api/portal/service-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchPortalServiceRequests() {
  return portalFetch<import('./portal-types').PortalServiceRequest[]>('/api/portal/service-requests')
}

export function fetchPortalAssets(folderId?: string | null) {
  let path = '/api/portal/assets'
  if (typeof folderId === 'string' && folderId) {
    path += `?folderId=${encodeURIComponent(folderId)}`
  }
  return portalFetch<import('./portal-types').PortalAsset[]>(path)
}

export function fetchPortalFolders() {
  return portalFetch<import('./portal-types').PortalFolder[]>('/api/portal/folders')
}

export function createPortalFolder(name: string, parentId: string | null = null) {
  return portalFetch<import('./portal-types').PortalFolder>('/api/portal/folders', {
    method: 'POST',
    body: JSON.stringify({ name, parentId }),
  })
}

export function renamePortalFolder(id: string, name: string) {
  return portalFetch<import('./portal-types').PortalFolder>(`/api/portal/folders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  })
}

export function deletePortalFolder(id: string) {
  return portalFetch<void>(`/api/portal/folders/${id}`, { method: 'DELETE' })
}

export function movePortalAsset(id: string, folderId: string | null) {
  return portalFetch<import('./portal-types').PortalAsset>(`/api/portal/assets/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ folderId: folderId ?? 'root' }),
  })
}

export async function uploadPortalAsset(
  file: File,
  options?: { serviceRequestId?: string; category?: string; note?: string; folderId?: string | null },
) {
  const token = getPortalToken()
  const form = new FormData()
  form.append('file', file)
  if (options?.serviceRequestId) form.append('serviceRequestId', options.serviceRequestId)
  if (options?.category) form.append('category', options.category)
  if (options?.note) form.append('note', options.note)
  if (options?.folderId) form.append('folderId', options.folderId)

  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}/api/portal/assets`, { method: 'POST', headers, body: form })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Upload failed')
  }
  return data as import('./portal-types').PortalAsset
}

export function fetchPortalBillingStatus() {
  return portalFetch<{ stripeEnabled: boolean; portalUrl: string | null }>('/api/portal/billing/status')
}

export function fetchPortalSubscriptions() {
  return portalFetch<import('./portal-types').PortalSubscription[]>('/api/portal/billing/subscriptions')
}

export function cancelPortalSubscription(id: string, atPeriodEnd = true) {
  return portalFetch<import('./portal-types').PortalSubscription>(
    `/api/portal/billing/subscriptions/${id}/cancel`,
    {
      method: 'POST',
      body: JSON.stringify({ atPeriodEnd }),
    },
  )
}

export function createPortalCheckout(invoiceId: string) {
  return portalFetch<{ url: string | null; sessionId: string }>('/api/portal/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ invoiceId }),
  })
}

export async function sendPortalMessage(payload: {
  subject?: string
  message: string
  threadId?: string
  files?: File[]
}) {
  if (payload.files?.length) {
    const token = getPortalToken()
    const form = new FormData()
    if (payload.message) form.append('message', payload.message)
    if (payload.subject) form.append('subject', payload.subject)
    if (payload.threadId) form.append('threadId', payload.threadId)
    for (const file of payload.files) form.append('files', file)

    const headers = new Headers()
    if (token) headers.set('Authorization', `Bearer ${token}`)

    const res = await fetch(`${API_BASE}/api/portal/messages`, { method: 'POST', headers, body: form })
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(typeof data.error === 'string' ? data.error : 'Request failed')
    }
    return data as import('./portal-types').PortalMessage
  }

  return portalFetch<import('./portal-types').PortalMessage>('/api/portal/messages', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function fetchPortalMessageThreads() {
  return portalFetch<{ threads: import('./portal-types').PortalMessageThread[]; unreadCount: number }>(
    '/api/portal/messages',
  )
}

export function markPortalThreadRead(threadId: string) {
  return portalFetch<{ ok: boolean }>(`/api/portal/messages/threads/${threadId}/read`, {
    method: 'PATCH',
    body: JSON.stringify({}),
  })
}

/** @deprecated use fetchPortalMessageThreads */
export function fetchPortalMessages() {
  return fetchPortalMessageThreads().then((data) => data.threads.flatMap((t) => t.messages))
}

export function fetchPortalResources() {
  return portalFetch<import('./client-resource-utils').PortalResource[]>('/api/portal/resources')
}

export function fetchPortalFormSubmissions() {
  return portalFetch<import('./portal-types').PortalFormSubmission[]>('/api/portal/form-submissions')
}

export function logoutPortal() {
  clearPortalToken()
}
