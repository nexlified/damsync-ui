import client from './client'
import type { Asset, PaginatedResponse } from '@/types'

export interface SearchParams {
  q?: string
  mime_group?: string
  folder_id?: string
  visibility?: string
  date_from?: string
  date_to?: string
  size_min?: number
  size_max?: number
  cursor?: string
  limit?: number
}

export const searchApi = {
  search: (params: SearchParams) =>
    client.get<PaginatedResponse<Asset>>('/search', { params }).then((r) => r.data),
}
