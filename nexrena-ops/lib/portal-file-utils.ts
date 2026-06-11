import type { PortalAsset } from './portal-types'

export const ASSET_CATEGORIES = [
  { value: '', label: 'No category' },
  { value: 'logo', label: 'Logo' },
  { value: 'photos', label: 'Photos' },
  { value: 'documents', label: 'Documents' },
  { value: 'other', label: 'Other' },
] as const

export function formatFileBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export function isImageAsset(asset: Pick<PortalAsset, 'contentType'>) {
  return asset.contentType.startsWith('image/')
}

export function categoryLabel(category?: string | null) {
  if (!category) return null
  return ASSET_CATEGORIES.find((c) => c.value === category)?.label ?? category
}
