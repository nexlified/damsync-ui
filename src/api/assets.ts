import client from './client'
import type { Asset, AssetListParams, AssetUpdateRequest, PaginatedResponse } from '@/types'

export const assetsApi = {
  list: (params?: AssetListParams) =>
    client.get<PaginatedResponse<Asset>>('/assets', { params }).then((r) => r.data),

  get: (id: string) =>
    client.get<Asset>(`/assets/${id}`).then((r) => r.data),

  upload: (formData: FormData) =>
    client.post<Asset>('/assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  bulkUpload: (formData: FormData) =>
    client.post<Asset[]>('/assets/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  update: (id: string, data: AssetUpdateRequest) =>
    client.put<Asset>(`/assets/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    client.delete(`/assets/${id}`),

  move: (id: string, folderId: string | null) =>
    client.post<Asset>(`/assets/${id}/move`, { folder_id: folderId }).then((r) => r.data),

  getSignedUrl: (id: string, ttl = 3600) =>
    client.get<{ url: string }>(`/assets/${id}/signed-url`, { params: { ttl } }).then((r) => r.data),

  addTags: (id: string, tagIds: string[]) =>
    client.post(`/assets/${id}/tags`, { tag_ids: tagIds }),

  removeTags: (id: string, tagIds: string[]) =>
    client.delete(`/assets/${id}/tags`, { data: { tag_ids: tagIds } }),
}
