import client from './client'
import type { Folder, FolderRequest } from '@/types'

export const foldersApi = {
  list: () =>
    client.get<{ data: Folder[] | null }>('/folders').then((r) => r.data.data ?? []),

  tree: () =>
    client.get<{ data: Folder[] }>('/folders/tree').then((r) => r.data.data ?? []),

  get: (id: string) =>
    client.get<Folder>(`/folders/${id}`).then((r) => r.data),

  create: (data: FolderRequest) =>
    client.post<Folder>('/folders', data).then((r) => r.data),

  update: (id: string, data: Partial<FolderRequest>) =>
    client.put<Folder>(`/folders/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    client.delete(`/folders/${id}`),
}
