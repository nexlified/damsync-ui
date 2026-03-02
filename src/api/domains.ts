import client from './client'
import type { Domain, DomainRequest } from '@/types'

export const domainsApi = {
  list: () =>
    client.get<{ data: Domain[] | null }>('/domains').then((r) => r.data.data ?? []),

  create: (data: DomainRequest) =>
    client.post<Domain>('/domains', data).then((r) => r.data),

  verify: (id: string) =>
    client.post<Domain>(`/domains/${id}/verify`).then((r) => r.data),

  delete: (id: string) =>
    client.delete(`/domains/${id}`),
}
