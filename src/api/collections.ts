import client from './client'
import type { Collection, CollectionRequest, Asset, PaginatedResponse } from '@/types'

export const collectionsApi = {
  list: () =>
    client.get<{ data: Collection[] | null }>('/collections').then((r) => r.data.data ?? []),

  get: (id: string) =>
    client.get<Collection>(`/collections/${id}`).then((r) => r.data),

  create: (data: CollectionRequest) =>
    client.post<Collection>('/collections', data).then((r) => r.data),

  update: (id: string, data: Partial<CollectionRequest>) =>
    client.put<Collection>(`/collections/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    client.delete(`/collections/${id}`),

  addAsset: (id: string, assetId: string) =>
    client.post(`/collections/${id}/assets/${assetId}`),

  removeAsset: (id: string, assetId: string) =>
    client.delete(`/collections/${id}/assets/${assetId}`),

  getAssets: (id: string, params?: { limit?: number; offset?: number }) =>
    client.get<PaginatedResponse<Asset>>(`/collections/${id}/assets`, { params }).then((r) => r.data),
}
