import {
  categoryFolderId,
  getWebsiteMediaSource,
  type CategoryName,
  type WebsiteMediaSourceConfig,
} from './website-media-sources'
import { clearWebsiteMediaCache } from './website-media-index'

const TTAG_GITHUB_CANDIDATES = [
  { owner: 'Nloperena', repo: 'ttag-astro', branch: 'main', publicRoot: 'public' },
  { owner: 'Nloperena', repo: 'TTAG', branch: 'main', publicRoot: 'public' },
  { owner: 'Nloperena', repo: 'two-azalea-group', branch: 'main', publicRoot: 'public' },
  { owner: 'Nloperena', repo: 'thetwoazaleagroup', branch: 'main', publicRoot: 'public' },
]

const CATEGORY_DIRS: Record<CategoryName, string> = {
  'Logos & brand': 'images/logos',
  'Hero & graphics': 'images',
  'Communities': 'images/communities',
  'Portfolio': 'images/portfolio',
  'Property photos': 'images/pr-backgrounds',
  'About': 'images/about',
  'Partners': 'images/partners',
  'Videos': 'videos',
  'Team': 'images/team',
}

const MEDIA_UPLOAD_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/quicktime',
])

export type GithubUploadTarget = {
  owner: string
  repo: string
  branch: string
  publicRoot: string
}

export function validateWebsiteMediaUpload(file: {
  mimetype: string
  size: number
  originalname: string
}) {
  if (!process.env.GITHUB_TOKEN?.trim()) {
    return 'Website media uploads are not configured (GITHUB_TOKEN missing).'
  }
  if (file.size > 10 * 1024 * 1024) {
    return 'File must be 10 MB or smaller.'
  }
  if (!MEDIA_UPLOAD_TYPES.has(file.mimetype)) {
    return 'Allowed types: images and videos (JPEG, PNG, WebP, GIF, SVG, MP4, WebM, MOV).'
  }
  if (!file.originalname.trim()) {
    return 'Filename is required.'
  }
  return null
}

export async function resolveGithubUploadTarget(
  contactId: string,
): Promise<GithubUploadTarget | null> {
  const config = getWebsiteMediaSource(contactId)
  if (!config) return null

  if (config.github) {
    return {
      owner: config.github.owner,
      repo: config.github.repo,
      branch: config.github.branch,
      publicRoot: config.github.publicRoot,
    }
  }

  if (contactId === 'warren-daughtridge-ttag') {
    for (const candidate of TTAG_GITHUB_CANDIDATES) {
      const res = await fetch(
        `https://api.github.com/repos/${candidate.owner}/${candidate.repo}`,
        {
          headers: githubHeaders(),
        },
      )
      if (res.ok) return candidate
    }
  }

  return null
}

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'nexrena-api-website-media',
    'X-GitHub-Api-Version': '2022-11-28',
  }
  const token = process.env.GITHUB_TOKEN?.trim()
  if (token) headers.Authorization = `Bearer ${token}`
  return headers
}

function safeFilename(name: string): string {
  return name.replace(/[^\w.\-() ]+/g, '_').slice(0, 120)
}

export function repoRelativePathForFolder(folderId: string, filename: string): string | null {
  const safe = safeFilename(filename)

  if (folderId.startsWith('cat-property-photos--')) {
    const slug = folderId.slice('cat-property-photos--'.length)
    return `images/pr-backgrounds/${slug}/${safe}`
  }

  for (const category of Object.keys(CATEGORY_DIRS) as CategoryName[]) {
    if (folderId === categoryFolderId(category)) {
      return `${CATEGORY_DIRS[category]}/${safe}`
    }
  }

  return null
}

async function getExistingSha(
  target: GithubUploadTarget,
  repoPath: string,
): Promise<string | undefined> {
  const url = `https://api.github.com/repos/${target.owner}/${target.repo}/contents/${encodeURIComponent(repoPath).replace(/%2F/g, '/')}?ref=${target.branch}`
  const res = await fetch(url, { headers: githubHeaders() })
  if (res.status === 404) return undefined
  if (!res.ok) return undefined
  const data = (await res.json()) as { sha?: string }
  return data.sha
}

export async function uploadWebsiteMediaFile(
  contactId: string,
  folderId: string,
  file: { buffer: Buffer; mimetype: string; originalname: string },
): Promise<{ publicPath: string; repoPath: string }> {
  const validationError = validateWebsiteMediaUpload({
    mimetype: file.mimetype,
    size: file.buffer.length,
    originalname: file.originalname,
  })
  if (validationError) throw new Error(validationError)

  const target = await resolveGithubUploadTarget(contactId)
  if (!target) {
    throw new Error('No GitHub repository is linked for website media uploads on this account.')
  }

  const relPath = repoRelativePathForFolder(folderId, file.originalname)
  if (!relPath) {
    throw new Error('Unknown website media folder. Choose a folder from the sidebar first.')
  }

  const repoPath = `${target.publicRoot}/${relPath}`.replace(/\\/g, '/')
  const publicPath = `/${relPath.replace(/\\/g, '/')}`
  const sha = await getExistingSha(target, repoPath)

  const res = await fetch(
    `https://api.github.com/repos/${target.owner}/${target.repo}/contents/${encodeURIComponent(repoPath).replace(/%2F/g, '/')}`,
    {
      method: 'PUT',
      headers: {
        ...githubHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Portal upload: ${file.originalname}`,
        content: file.buffer.toString('base64'),
        branch: target.branch,
        ...(sha ? { sha } : {}),
      }),
    },
  )

  const data = (await res.json().catch(() => ({}))) as { message?: string }
  if (!res.ok) {
    throw new Error(data.message ?? 'GitHub upload failed.')
  }

  clearWebsiteMediaCache(contactId)
  return { publicPath, repoPath }
}

export function hasWebsiteMediaUpload(contactId: string): boolean {
  return Boolean(getWebsiteMediaSource(contactId))
}
