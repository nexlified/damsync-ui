import axios from 'axios'
import type { AxiosInstance } from 'axios'

const API_URL = import.meta.env.VITE_API_URL as string

export const client: AxiosInstance = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token from store on each request
client.interceptors.request.use((config) => {
  const raw = localStorage.getItem('dam-auth')
  if (raw) {
    try {
      const state = JSON.parse(raw) as { state?: { accessToken?: string } }
      const token = state?.state?.accessToken
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    } catch {
      // ignore parse errors
    }
  }
  return config
})

let refreshing = false
let refreshQueue: Array<(token: string) => void> = []

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config as typeof error.config & { _retry?: boolean }
    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error as Error)
    }
    original._retry = true

    const raw = localStorage.getItem('dam-auth')
    const refreshToken = raw
      ? (JSON.parse(raw) as { state?: { refreshToken?: string } }).state?.refreshToken
      : null

    if (!refreshToken) {
      clearAuth()
      return Promise.reject(error as Error)
    }

    if (refreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          original.headers['Authorization'] = `Bearer ${token}`
          resolve(client(original))
        })
      })
    }

    refreshing = true
    try {
      const res = await axios.post<{ access_token: string; refresh_token: string }>(
        `${API_URL}/api/v1/auth/refresh`,
        { refresh_token: refreshToken }
      )
      const { access_token, refresh_token } = res.data
      updateTokens(access_token, refresh_token)
      refreshQueue.forEach((cb) => cb(access_token))
      refreshQueue = []
      original.headers['Authorization'] = `Bearer ${access_token}`
      return client(original)
    } catch {
      clearAuth()
      return Promise.reject(error as Error)
    } finally {
      refreshing = false
    }
  }
)

function updateTokens(accessToken: string, refreshToken: string) {
  const raw = localStorage.getItem('dam-auth')
  if (raw) {
    try {
      const store = JSON.parse(raw) as { state?: Record<string, unknown> }
      if (store.state) {
        store.state.accessToken = accessToken
        store.state.refreshToken = refreshToken
        localStorage.setItem('dam-auth', JSON.stringify(store))
      }
    } catch {
      // ignore
    }
  }
}

function clearAuth() {
  const raw = localStorage.getItem('dam-auth')
  if (raw) {
    try {
      const store = JSON.parse(raw) as { state?: Record<string, unknown> }
      if (store.state) {
        store.state.accessToken = null
        store.state.refreshToken = null
        localStorage.setItem('dam-auth', JSON.stringify(store))
        window.location.href = '/login'
      }
    } catch {
      // ignore
    }
  }
}

export default client
