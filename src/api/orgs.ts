import client from './client'
import type { Org, OrgStorage, OrgUpdateRequest } from '@/types'

export const orgsApi = {
  getMe: () =>
    client.get<Org>('/orgs/me').then((r) => r.data),

  update: (data: OrgUpdateRequest) =>
    client.put<Org>('/orgs/me', data).then((r) => r.data),

  getStorage: () =>
    client.get<OrgStorage>('/orgs/me/storage').then((r) => r.data),
}
