import type { Tag } from './tag'

export interface AssetMetadata {
  title?: string
  description?: string
  alt_text?: string
  author?: string
  custom?: Record<string, string>
}

export interface FocalPoint {
  x: number
  y: number
}

export type AssetVisibility = 'public' | 'private' | 'org'

export interface Asset {
  id: string
  org_id: string
  folder_id: string | null
  filename: string
  storage_key: string
  mime_type: string
  size_bytes: number
  width: number | null
  height: number | null
  visibility: AssetVisibility
  metadata: AssetMetadata
  focal_point: FocalPoint | null
  tags: Tag[]
  created_at: string
  updated_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  next_cursor: string | null
  total?: number
}

export interface AssetListParams {
  folder_id?: string
  cursor?: string
  limit?: number
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  mime_group?: string
  q?: string
}

export interface AssetUpdateRequest {
  title?: string
  description?: string
  alt_text?: string
  author?: string
  visibility?: AssetVisibility
  metadata?: AssetMetadata
}
