export interface StyleOperation {
  type: string
  width?: number
  height?: number
  fit?: string
  format?: string
  quality?: number
}

export interface ImageStyle {
  id: string
  org_id: string
  name: string
  slug: string
  output_format: string
  quality: number
  operations: StyleOperation[]
  created_at: string
  updated_at: string
}

export interface ImageStyleRequest {
  name: string
  slug: string
  output_format: string
  quality: number
  operations: StyleOperation[]
}
