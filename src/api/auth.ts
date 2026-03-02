import client from './client'
import type { LoginRequest, RegisterRequest, RegisterResponse, TokenPair } from '@/types'

export const authApi = {
  login: (data: LoginRequest) =>
    client.post<TokenPair>('/auth/login', data).then((r) => r.data),

  register: (data: RegisterRequest) =>
    client.post<RegisterResponse>('/auth/register', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    client.post<TokenPair>('/auth/refresh', { refresh_token: refreshToken }).then((r) => r.data),

  logout: (refreshToken: string) =>
    client.post('/auth/logout', { refresh_token: refreshToken }),
}
