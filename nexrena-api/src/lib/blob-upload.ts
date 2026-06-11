import { put } from '@vercel/blob'
import { randomUUID } from 'crypto'

const MAX_BYTES = 10 * 1024 * 1024
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
])

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

export function validateUpload(file: { mimetype: string; size: number; originalname: string }) {
  if (!isBlobConfigured()) {
    return 'File uploads are not configured (BLOB_READ_WRITE_TOKEN missing).'
  }
  if (file.size > MAX_BYTES) {
    return 'File must be 10 MB or smaller.'
  }
  if (!ALLOWED_TYPES.has(file.mimetype)) {
    return 'Allowed types: images, PDF, ZIP.'
  }
  if (!file.originalname.trim()) {
    return 'Filename is required.'
  }
  return null
}

export async function uploadPortalAsset(
  contactId: string,
  file: { buffer: Buffer; mimetype: string; originalname: string },
  serviceRequestId?: string,
) {
  const safeName = file.originalname.replace(/[^\w.\-() ]+/g, '_').slice(0, 120)
  const pathname = `portal/${contactId}/${serviceRequestId ?? 'general'}/${randomUUID()}-${safeName}`

  const blob = await put(pathname, file.buffer, {
    access: 'public',
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType: file.mimetype,
  })

  return {
    filename: safeName,
    contentType: file.mimetype,
    sizeBytes: file.buffer.length,
    blobUrl: blob.url,
    pathname: blob.pathname,
  }
}
