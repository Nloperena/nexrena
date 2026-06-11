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

export function fetchPortalAssets() {
  return portalFetch<import('./portal-types').PortalAsset[]>('/api/portal/assets')
}

export async function uploadPortalAsset(
  file: File,
  options?: { serviceRequestId?: string; category?: string; note?: string },
) {
  const token = getPortalToken()
  const form = new FormData()
  form.append('file', file)
  if (options?.serviceRequestId) form.append('serviceRequestId', options.serviceRequestId)
  if (options?.category) form.append('category', options.category)
  if (options?.note) form.append('note', options.note)

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

export function createPortalCheckout(invoiceId: string) {
  return portalFetch<{ url: string | null; sessionId: string }>('/api/portal/billing/checkout', {
    method: 'POST',
    body: JSON.stringify({ invoiceId }),
  })
}

export function sendPortalMessage(payload: { subject?: string; message: string }) {
  return portalFetch<{ id: string; subject: string; message: string; status: string; createdAt: string }>(
    '/api/portal/messages',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  )
}

export function fetchPortalMessages() {
  return portalFetch<{ id: string; subject: string; message: string; status: string; createdAt: string }[]>(
    '/api/portal/messages',
  )
}

export function logoutPortal() {
  clearPortalToken()
}
