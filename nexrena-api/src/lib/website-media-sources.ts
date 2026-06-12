export type MediaFolder = {
  id: string
  name: string
  parentId: string | null
  itemCount: number
}

export type MediaItem = {
  id: string
  folderId: string
  name: string
  url: string
  thumbUrl?: string
  kind: 'image' | 'video' | 'document' | 'other'
  sizeBytes?: number
}

export type WebsiteMediaSourceConfig = {
  contactId: string
  label: string
  baseUrl: string
  github?: {
    owner: string
    repo: string
    branch: string
    publicRoot: string
  }
  /** Pages to crawl for static asset paths when GitHub listing is unavailable */
  crawlPages?: string[]
  /** Additional site origins to crawl with the same page paths */
  extraCrawlOrigins?: string[]
  /** Known public paths (leading slash) as a supplement or fallback */
  manifestPaths?: string[]
  propertyManifestUrl?: string
}

export const WEBSITE_MEDIA_SOURCES: Record<string, WebsiteMediaSourceConfig> = {
  'joe-loperena-furniture-packages': {
    contactId: 'joe-loperena-furniture-packages',
    label: 'Furniture Packages USA',
    baseUrl: 'https://furniturepackagesusa.com',
    github: {
      owner: 'Nloperena',
      repo: 'FPUSA-NEXTJS-Template',
      branch: 'main',
      publicRoot: 'fpusa-astro-production/public',
    },
    propertyManifestUrl: 'https://furniturepackagesusa.com/images/pr-backgrounds/image-list.json',
  },
  'warren-daughtridge-ttag': {
    contactId: 'warren-daughtridge-ttag',
    label: 'The Two Azalea Group',
    baseUrl: 'https://ttag-astro.vercel.app',
    crawlPages: [
      '/',
      '/about',
      '/about/how-we-work',
      '/about/leadership',
      '/about/story',
      '/contact',
      '/manufacturers',
      '/services',
      '/services/distribution',
      '/services/federal',
    ],
    /** Also indexed from the live production site */
    extraCrawlOrigins: ['https://www.thetwoazaleagroup.com'],
    manifestPaths: [
      '/images/grainger-logo.svg',
    ],
  },
}

const MEDIA_EXT = /\.(jpe?g|png|webp|svg|gif|mp4|mov|webm)$/i
const EXCLUDED_EXT = /\.(txt|html|vtt|json)$/i
const EXCLUDED_NAMES = /^(README|robots|llms|google[a-f0-9]+)\./i

export const CATEGORY_NAMES = [
  'Logos & brand',
  'Hero & graphics',
  'Communities',
  'Portfolio',
  'Property photos',
  'About',
  'Partners',
  'Videos',
  'Other',
] as const

export type CategoryName = (typeof CATEGORY_NAMES)[number]

export function getWebsiteMediaSource(contactId: string): WebsiteMediaSourceConfig | null {
  return WEBSITE_MEDIA_SOURCES[contactId] ?? null
}

export function slugId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function humanizeHouseName(slug: string): string {
  return slug
    .split('-')
    .map((part) => (/^\d+$/.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1)))
    .join(' ')
}

export function isMediaPublicPath(publicPath: string): boolean {
  const lower = publicPath.toLowerCase()
  if (!MEDIA_EXT.test(lower)) return false
  if (EXCLUDED_EXT.test(lower)) return false
  const base = publicPath.split('/').pop() ?? ''
  if (EXCLUDED_NAMES.test(base)) return false
  return true
}

export function mediaKindFromPath(publicPath: string): MediaItem['kind'] {
  if (/\.(mp4|mov|webm)$/i.test(publicPath)) return 'video'
  if (/\.(jpe?g|png|webp|svg|gif)$/i.test(publicPath)) return 'image'
  return 'other'
}

export function publicPathFromRepoPath(repoPath: string, publicRoot: string): string | null {
  const prefix = `${publicRoot}/`
  if (!repoPath.startsWith(prefix)) return null
  const rel = repoPath.slice(prefix.length)
  if (!rel.startsWith('images/') && !rel.startsWith('videos/') && !rel.startsWith('favicon')) {
    return null
  }
  return `/${rel.replace(/\\/g, '/')}`
}

export function classifyMediaPath(
  publicPath: string,
  houseSlug?: string,
): { category: CategoryName; subfolderId?: string; subfolderName?: string } {
  const normalized = publicPath.toLowerCase()

  if (normalized.startsWith('/videos/')) {
    return { category: 'Videos' }
  }

  if (houseSlug) {
    return {
      category: 'Property photos',
      subfolderId: slugId(houseSlug),
      subfolderName: humanizeHouseName(houseSlug),
    }
  }

  if (
    normalized.includes('/logos/') ||
    normalized.includes('/brand/') ||
    /logo|favicon|fpusa-logo|ttag logo|motif|cursor-/.test(normalized)
  ) {
    return { category: 'Logos & brand' }
  }

  if (/hero[-/]|hero_/.test(normalized) || normalized.includes('brutalist')) {
    return { category: 'Hero & graphics' }
  }

  if (normalized.includes('/communities/')) {
    return { category: 'Communities' }
  }

  if (normalized.includes('/portfolio/')) {
    return { category: 'Portfolio' }
  }

  if (normalized.includes('/pr-backgrounds/')) {
    const base = publicPath.split('/').pop() ?? ''
    const inferred = base.match(/^([\d]+[-][\w-]+?)-\d{3}-/)?.[1]
    if (inferred) {
      return {
        category: 'Property photos',
        subfolderId: slugId(inferred),
        subfolderName: humanizeHouseName(inferred),
      }
    }
    return { category: 'Property photos' }
  }

  if (normalized.includes('/about/') || /editorial|factory|warehouse|government|precision|services-heroic/.test(normalized)) {
    return { category: 'About' }
  }

  if (normalized.includes('/partners/') || normalized.includes('/airbnb-packages/')) {
    return { category: 'Partners' }
  }

  if (normalized.includes('/blog/') || normalized.includes('/wp-content/')) {
    return { category: 'Other' }
  }

  if (normalized.includes('/services/')) {
    return { category: 'Hero & graphics' }
  }

  return { category: 'Other' }
}

export function categoryFolderId(category: CategoryName): string {
  return `cat-${slugId(category)}`
}

export function propertySubfolderId(houseSlug: string): string {
  return `cat-property-photos--${slugId(houseSlug)}`
}
