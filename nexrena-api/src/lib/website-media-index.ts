import {
  categoryFolderId,
  classifyMediaPath,
  getWebsiteMediaSource,
  isMediaPublicPath,
  mediaKindFromPath,
  propertySubfolderId,
  publicPathFromRepoPath,
  slugId,
  type CategoryName,
  type MediaFolder,
  type MediaItem,
  type WebsiteMediaSourceConfig,
} from './website-media-sources'

export type WebsiteMediaCatalog = {
  contactId: string
  label: string
  baseUrl: string
  folders: MediaFolder[]
  items: MediaItem[]
  indexedAt: string
}

type PropertyManifestEntry = {
  filename?: string
  path?: string
  house?: string
}

type GitHubTreeEntry = {
  path: string
  type: string
  size?: number
}

const CACHE_TTL_MS = 10 * 60 * 1000
const cache = new Map<string, { expiresAt: number; catalog: WebsiteMediaCatalog }>()

const TTAG_GITHUB_CANDIDATES = [
  { owner: 'Nloperena', repo: 'ttag-astro', publicRoot: 'public' },
  { owner: 'Nloperena', repo: 'TTAG', publicRoot: 'public' },
  { owner: 'Nloperena', repo: 'two-azalea-group', publicRoot: 'public' },
  { owner: 'Nloperena', repo: 'thetwoazaleagroup', publicRoot: 'public' },
]

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      headers: { Accept: 'application/json', 'User-Agent': 'nexrena-api-website-media' },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'nexrena-api-website-media' },
    })
    if (!res.ok) return null
    return await res.text()
  } catch {
    return null
  }
}

async function fetchGitHubTree(
  owner: string,
  repo: string,
  branch: string,
): Promise<GitHubTreeEntry[] | null> {
  const tree = await fetchJson<{ tree?: GitHubTreeEntry[] }>(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
  )
  if (!tree?.tree) return null
  return tree.tree.filter((entry) => entry.type === 'blob')
}

async function listGithubMediaPaths(config: WebsiteMediaSourceConfig): Promise<
  Array<{ publicPath: string; sizeBytes?: number }>
> {
  if (!config.github) return []

  const tree = await fetchGitHubTree(
    config.github.owner,
    config.github.repo,
    config.github.branch,
  )
  if (!tree) return []

  const files: Array<{ publicPath: string; sizeBytes?: number }> = []
  for (const entry of tree) {
    const publicPath = publicPathFromRepoPath(entry.path, config.github.publicRoot)
    if (!publicPath || !isMediaPublicPath(publicPath)) continue
    files.push({ publicPath, sizeBytes: entry.size })
  }
  return files
}

async function resolveTtagGithub(config: WebsiteMediaSourceConfig): Promise<
  Array<{ publicPath: string; sizeBytes?: number }>
> {
  for (const candidate of TTAG_GITHUB_CANDIDATES) {
    const tree = await fetchGitHubTree(candidate.owner, candidate.repo, 'main')
    if (!tree?.length) continue

    const files: Array<{ publicPath: string; sizeBytes?: number }> = []
    for (const entry of tree) {
      const publicPath = publicPathFromRepoPath(entry.path, candidate.publicRoot)
      if (!publicPath || !isMediaPublicPath(publicPath)) continue
      files.push({ publicPath, sizeBytes: entry.size })
    }
    if (files.length > 0) return files
  }
  return []
}

function extractImagePathsFromHtml(html: string): string[] {
  const patterns = [
    /\/(?:images|videos)\/[^"'\\s>)]+/g,
    /(?:src|href|content)=["']([^"']+\.(?:webp|jpe?g|png|gif|svg|avif|mp4|webm|mov))["']/gi,
  ]
  const paths = new Set<string>()
  for (const pattern of patterns) {
    const matches = html.matchAll(pattern)
    for (const match of matches) {
      let value = match[1] ?? match[0]
      if (value.startsWith('http')) {
        try {
          value = new URL(value).pathname
        } catch {
          continue
        }
      }
      value = decodeURIComponent(value.split('?')[0]!)
      if (!value.startsWith('/')) {
        if (value.startsWith('images/') || value.startsWith('videos/')) value = `/${value}`
        else continue
      }
      if (isMediaPublicPath(value)) paths.add(value)
    }
  }
  return [...paths]
}

async function crawlSitePages(
  baseUrl: string,
  pages: string[],
): Promise<Array<{ publicPath: string }>> {
  const paths = new Set<string>()
  for (const page of pages) {
    const html = await fetchText(`${baseUrl.replace(/\/$/, '')}${page}`)
    if (!html) continue
    for (const path of extractImagePathsFromHtml(html)) {
      paths.add(path)
    }
  }
  return [...paths].map((publicPath) => ({ publicPath }))
}

async function fetchPropertyManifest(
  url: string,
): Promise<Map<string, string>> {
  const rows = await fetchJson<PropertyManifestEntry[]>(url)
  if (!rows?.length) return new Map()

  const map = new Map<string, string>()
  for (const row of rows) {
    const path = row.path?.startsWith('/') ? row.path : row.path ? `/${row.path}` : null
    const house = row.house?.trim()
    if (path && house) map.set(path, house)
  }
  return map
}

function buildPublicUrl(baseUrl: string, publicPath: string): string {
  return new URL(publicPath, `${baseUrl.replace(/\/$/, '')}/`).href
}

function buildCatalog(
  config: WebsiteMediaSourceConfig,
  files: Array<{ publicPath: string; sizeBytes?: number; houseSlug?: string }>,
): WebsiteMediaCatalog {
  const folderMap = new Map<string, MediaFolder>()
  const items: MediaItem[] = []

  const ensureFolder = (id: string, name: string, parentId: string | null) => {
    if (!folderMap.has(id)) {
      folderMap.set(id, { id, name, parentId, itemCount: 0 })
    }
    return folderMap.get(id)!
  }

  for (const category of [
    'Logos & brand',
    'Hero & graphics',
    'Communities',
    'Portfolio',
    'Property photos',
    'About',
    'Partners',
    'Videos',
    'Team',
  ] as CategoryName[]) {
    ensureFolder(categoryFolderId(category), category, null)
  }

  for (const file of files) {
    const { publicPath, sizeBytes, houseSlug } = file
    const classification = classifyMediaPath(publicPath, houseSlug)
    const categoryId = categoryFolderId(classification.category)

    let folderId = categoryId
    if (classification.subfolderId && classification.subfolderName) {
      folderId = propertySubfolderId(classification.subfolderId)
      ensureFolder(categoryId, classification.category, null)
      ensureFolder(folderId, classification.subfolderName, categoryId)
    } else {
      ensureFolder(categoryId, classification.category, null)
    }

    const name = publicPath.split('/').pop() ?? publicPath
    const url = buildPublicUrl(config.baseUrl, publicPath)
    items.push({
      id: slugId(`${folderId}-${publicPath}`),
      folderId,
      name,
      url,
      thumbUrl: mediaKindFromPath(publicPath) === 'image' ? url : undefined,
      kind: mediaKindFromPath(publicPath),
      sizeBytes,
    })
  }

  items.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

  for (const item of items) {
    const folder = folderMap.get(item.folderId)
    if (folder) folder.itemCount += 1
  }

  for (const folder of folderMap.values()) {
    if (folder.parentId) continue
    const childCount = [...folderMap.values()]
      .filter((child) => child.parentId === folder.id)
      .reduce((sum, child) => sum + child.itemCount, 0)
    if (childCount > 0 && folder.itemCount === 0) {
      folder.itemCount = childCount
    }
  }

  const folders = [...folderMap.values()]
    .filter((folder) => folder.itemCount > 0 || [...folderMap.values()].some((child) => child.parentId === folder.id))
    .sort((a, b) => a.name.localeCompare(b.name))

  return {
    contactId: config.contactId,
    label: config.label,
    baseUrl: config.baseUrl,
    folders,
    items,
    indexedAt: new Date().toISOString(),
  }
}

async function collectMediaFiles(config: WebsiteMediaSourceConfig): Promise<
  Array<{ publicPath: string; sizeBytes?: number; houseSlug?: string }>
> {
  const byPath = new Map<string, { publicPath: string; sizeBytes?: number; houseSlug?: string }>()

  const addFile = (entry: { publicPath: string; sizeBytes?: number; houseSlug?: string }) => {
    const normalized = entry.publicPath.startsWith('/') ? entry.publicPath : `/${entry.publicPath}`
    if (!isMediaPublicPath(normalized)) return
    byPath.set(normalized, { ...entry, publicPath: normalized })
  }

  let githubFiles = await listGithubMediaPaths(config)
  if (!githubFiles.length && config.contactId === 'warren-daughtridge-ttag') {
    githubFiles = await resolveTtagGithub(config)
  }

  for (const file of githubFiles) addFile(file)

  if (config.manifestPaths?.length) {
    for (const publicPath of config.manifestPaths) {
      addFile({ publicPath })
    }
  }

  if (config.crawlPages?.length) {
    const origins = [config.baseUrl, ...(config.extraCrawlOrigins ?? [])]
    for (const origin of origins) {
      const crawled = await crawlSitePages(origin, config.crawlPages)
      for (const file of crawled) addFile(file)
    }
  }

  if (config.propertyManifestUrl) {
    const houseByPath = await fetchPropertyManifest(config.propertyManifestUrl)
    for (const [publicPath, houseSlug] of houseByPath) {
      addFile({ publicPath, houseSlug })
    }
    for (const [publicPath, entry] of byPath) {
      const houseSlug = houseByPath.get(publicPath)
      if (houseSlug) {
        byPath.set(publicPath, { ...entry, houseSlug })
      }
    }
  }

  return [...byPath.values()]
}

export async function indexWebsiteMedia(contactId: string): Promise<WebsiteMediaCatalog | null> {
  const config = getWebsiteMediaSource(contactId)
  if (!config) return null

  const cached = cache.get(contactId)
  if (cached && cached.expiresAt > Date.now()) {
    return cached.catalog
  }

  const files = await collectMediaFiles(config)
  const catalog = buildCatalog(config, files)

  cache.set(contactId, {
    expiresAt: Date.now() + CACHE_TTL_MS,
    catalog,
  })

  return catalog
}

export function clearWebsiteMediaCache(contactId?: string) {
  if (contactId) cache.delete(contactId)
  else cache.clear()
}
