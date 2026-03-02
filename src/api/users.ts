import client from './client'
import type { User, UserRequest } from '@/types'

export const usersApi = {
  list: () =>
    client.get<User[]>('/users').then((r) => r.data),

  get: (id: string) =>
    client.get<User>(`/users/${id}`).then((r) => r.data),

  create: (data: UserRequest) =>
    client.post<User>('/users', data).then((r) => r.data),

  update: (id: string, data: Partial<UserRequest>) =>
    client.put<User>(`/users/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    client.delete(`/users/${id}`),
}
