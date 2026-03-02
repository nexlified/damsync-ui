export interface Org {
  id: string
  name: string
  slug: string
  plan: string
  storage_quota_bytes: number
  settings: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface OrgStorage {
  used_bytes: number
  quota_bytes: number
  asset_count: number
}

export interface OrgUpdateRequest {
  name?: string
  settings?: Record<string, unknown>
}
