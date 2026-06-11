import { put } from '@vercel/blob'
import { randomUUID } from 'crypto'

const ASSET_MAX_BYTES = 10 * 1024 * 1024
const MESSAGE_IMAGE_MAX_BYTES = 10 * 1024 * 1024
const MESSAGE_VIDEO_MAX_BYTES = 50 * 1024 * 1024

const ASSET_ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'application/zip',
  'application/x-zip-compressed',
])

const MESSAGE_VIDEO_TYPES = new Set(['video/mp4', 'video/quicktime'])

export const MESSAGE_ATTACHMENT_LIMITS = {
  imageMaxBytes: MESSAGE_IMAGE_MAX_BYTES,
  videoMaxBytes: MESSAGE_VIDEO_MAX_BYTES,
  maxFiles: 5,
}

export function isBlobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

export function blobUploadErrorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (/BLOB_READ_WRITE_TOKEN|token|unauthorized|forbidden|credentials/i.test(err.message)) {
      return 'File uploads are not configured (BLOB_READ_WRITE_TOKEN missing or invalid).'
    }
    return err.message
  }
  return 'Upload failed'
}

export function validateUpload(file: { mimetype: string; size: number; originalname: string }) {
  if (!isBlobConfigured()) {
    return 'File uploads are not configured (BLOB_READ_WRITE_TOKEN missing).'
  }
  if (file.size > ASSET_MAX_BYTES) {
    return 'File must be 10 MB or smaller.'
  }
  if (!ASSET_ALLOWED_TYPES.has(file.mimetype)) {
    return 'Allowed types: images, PDF, ZIP.'
  }
  if (!file.originalname.trim()) {
    return 'Filename is required.'
  }
  return null
}

export function validateMessageAttachment(file: { mimetype: string; size: number; originalname: string }) {
  if (!isBlobConfigured()) {
    return 'File uploads are not configured (BLOB_READ_WRITE_TOKEN missing).'
  }
  if (!file.originalname.trim()) {
    return 'Filename is required.'
  }

  const isImage = file.mimetype.startsWith('image/')
  const isVideo = MESSAGE_VIDEO_TYPES.has(file.mimetype)

  if (!isImage && !isVideo) {
    return 'Allowed types: images and videos (MP4, MOV).'
  }
  if (isImage && file.size > MESSAGE_IMAGE_MAX_BYTES) {
    return 'Images must be 10 MB or smaller.'
  }
  if (isVideo && file.size > MESSAGE_VIDEO_MAX_BYTES) {
    return 'Videos must be 50 MB or smaller.'
  }
  return null
}

async function putPrivateBlob(
  pathname: string,
  buffer: Buffer,
  contentType: string,
) {
  return put(pathname, buffer, {
    access: 'private',
    token: process.env.BLOB_READ_WRITE_TOKEN,
    contentType,
  })
}

export async function uploadPortalAsset(
  contactId: string,
  file: { buffer: Buffer; mimetype: string; originalname: string },
  serviceRequestId?: string,
) {
  const safeName = file.originalname.replace(/[^\w.\-() ]+/g, '_').slice(0, 120)
  const pathname = `portal/${contactId}/${serviceRequestId ?? 'general'}/${randomUUID()}-${safeName}`

  const blob = await putPrivateBlob(pathname, file.buffer, file.mimetype)

  return {
    filename: safeName,
    contentType: file.mimetype,
    sizeBytes: file.buffer.length,
    blobUrl: blob.url,
    pathname: blob.pathname,
  }
}

export async function uploadMessageAttachment(
  contactId: string,
  file: { buffer: Buffer; mimetype: string; originalname: string },
) {
  const safeName = file.originalname.replace(/[^\w.\-() ]+/g, '_').slice(0, 120)
  const pathname = `messages/${contactId}/${randomUUID()}-${safeName}`

  const blob = await putPrivateBlob(pathname, file.buffer, file.mimetype)

  return {
    filename: safeName,
    mimeType: file.mimetype,
    sizeBytes: file.buffer.length,
    blobUrl: blob.url,
    pathname: blob.pathname,
  }
}
