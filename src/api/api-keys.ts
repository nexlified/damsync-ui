import client from './client'
import type { ApiKey, ApiKeyRequest, ApiKeyCreateResponse } from '@/types'

export const apiKeysApi = {
  list: () =>
    client.get<{ data: ApiKey[] | null }>('/api-keys').then((r) => r.data.data ?? []),

  create: (data: ApiKeyRequest) =>
    client.post<ApiKeyCreateResponse>('/api-keys', data).then((r) => r.data),

  delete: (id: string) =>
    client.delete(`/api-keys/${id}`),
}
