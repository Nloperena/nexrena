import { issueSignedToken, presignUrl } from '@vercel/blob'

const DEFAULT_TTL_MS = 15 * 60 * 1000

function blobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN
}

export async function createPrivateBlobSignedUrl(
  pathname: string,
  ttlMs = DEFAULT_TTL_MS,
): Promise<{ url: string; expiresAt: string }> {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) {
    throw new Error('File uploads are not configured (BLOB_READ_WRITE_TOKEN missing).')
  }

  const validUntil = Date.now() + ttlMs
  const signed = await issueSignedToken({
    token,
    operations: ['get'],
    pathname,
    validUntil,
  })

  const { presignedUrl } = await presignUrl(signed, {
    operation: 'get',
    pathname,
    access: 'private',
    validUntil,
  })

  return { url: presignedUrl, expiresAt: new Date(validUntil).toISOString() }
}
