export interface Collection {
  id: string
  org_id: string
  name: string
  description: string
  asset_count?: number
  created_at: string
  updated_at: string
}

export interface CollectionRequest {
  name: string
  description?: string
}
