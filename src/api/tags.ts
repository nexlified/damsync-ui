import client from './client'
import type { Tag } from '@/types'

export const tagsApi = {
  list: () =>
    client.get<Tag[]>('/tags').then((r) => r.data),

  create: (data: { name: string }) =>
    client.post<Tag>('/tags', data).then((r) => r.data),

  delete: (id: string) =>
    client.delete(`/tags/${id}`),
}
