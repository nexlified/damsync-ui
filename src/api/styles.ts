import client from './client'
import type { ImageStyle, ImageStyleRequest } from '@/types'

export const stylesApi = {
  list: () =>
    client.get<{ data: ImageStyle[] | null }>('/styles').then((r) => r.data.data ?? []),

  get: (id: string) =>
    client.get<ImageStyle>(`/styles/${id}`).then((r) => r.data),

  create: (data: ImageStyleRequest) =>
    client.post<ImageStyle>('/styles', data).then((r) => r.data),

  update: (id: string, data: Partial<ImageStyleRequest>) =>
    client.put<ImageStyle>(`/styles/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    client.delete(`/styles/${id}`),

  importDefaults: () =>
    client
      .post<{ data: ImageStyle[]; imported: number; updated: number }>('/styles/import-defaults')
      .then((r) => r.data),
}
