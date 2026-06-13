export type WebsiteMediaFolder = {
  id: string
  name: string
  parentId: string | null
  itemCount: number
}

export type WebsiteMediaItem = {
  id: string
  folderId: string
  name: string
  url: string
  thumbUrl?: string
  kind: 'image' | 'video' | 'document' | 'other'
  sizeBytes?: number
}

export type WebsiteMediaCatalog = {
  contactId: string
  label: string | null
  baseUrl: string | null
  folders: WebsiteMediaFolder[]
  items: WebsiteMediaItem[]
  indexedAt: string
  uploadEnabled?: boolean
}
