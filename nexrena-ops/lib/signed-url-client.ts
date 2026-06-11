import { api } from './api'
import { getPortalToken } from './portal-client'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://nexrena-api-5dc54effaa9f.herokuapp.com'
const OPS_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

type SignedUrlResponse = { url: string; expiresAt: string }

const cache = new Map<string, { url: string; expiresAt: number }>()

function isCached(key: string) {
  const entry = cache.get(key)
  if (!entry) return false
  if (Date.now() >= entry.expiresAt - 60_000) {
    cache.delete(key)
    return false
  }
  return true
}

export async function fetchPortalAssetSignedUrl(assetId: string): Promise<string> {
  const key = `portal-asset:${assetId}`
  if (isCached(key)) return cache.get(key)!.url

  const token = getPortalToken()
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}/api/portal/assets/${assetId}/url`, { headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Could not load file')
  }
  const signed = data as SignedUrlResponse
  cache.set(key, { url: signed.url, expiresAt: new Date(signed.expiresAt).getTime() })
  return signed.url
}

export async function fetchPortalMessageAttachmentUrl(attachmentId: string): Promise<string> {
  const key = `portal-attachment:${attachmentId}`
  if (isCached(key)) return cache.get(key)!.url

  const token = getPortalToken()
  const headers = new Headers()
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}/api/portal/messages/attachments/${attachmentId}/url`, { headers })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(typeof data.error === 'string' ? data.error : 'Could not load attachment')
  }
  const signed = data as SignedUrlResponse
  cache.set(key, { url: signed.url, expiresAt: new Date(signed.expiresAt).getTime() })
  return signed.url
}

export async function fetchOpsAssetSignedUrl(assetId: string): Promise<string> {
  const key = `ops-asset:${assetId}`
  if (isCached(key)) return cache.get(key)!.url

  const signed = await api.get<SignedUrlResponse>(`/portal-assets/${assetId}/url`)
  cache.set(key, { url: signed.url, expiresAt: new Date(signed.expiresAt).getTime() })
  return signed.url
}

export async function fetchOpsMessageAttachmentUrl(attachmentId: string): Promise<string> {
  const key = `ops-attachment:${attachmentId}`
  if (isCached(key)) return cache.get(key)!.url

  const signed = await api.get<SignedUrlResponse>(`/messages/attachments/${attachmentId}/url`)
  cache.set(key, { url: signed.url, expiresAt: new Date(signed.expiresAt).getTime() })
  return signed.url
}
