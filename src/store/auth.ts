import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { TokenPair, JWTClaims, UserRole } from '@/types'

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  userId: string | null
  orgId: string | null
  orgSlug: string | null
  email: string | null
  role: UserRole | null
  isAuthenticated: boolean

  setTokens: (pair: TokenPair) => void
  clear: () => void
}

function decodeJwt(token: string): JWTClaims | null {
  try {
    const payload = token.split('.')[1]
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decoded) as JWTClaims
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      orgId: null,
      orgSlug: null,
      email: null,
      role: null,
      isAuthenticated: false,

      setTokens: (pair: TokenPair) => {
        const claims = decodeJwt(pair.access_token)
        set({
          accessToken: pair.access_token,
          refreshToken: pair.refresh_token,
          userId: claims?.sub ?? null,
          orgId: claims?.org_id ?? null,
          orgSlug: claims?.org_slug ?? null,
          email: claims?.email ?? null,
          role: claims?.role ?? null,
          isAuthenticated: true,
        })
      },

      clear: () => {
        set({
          accessToken: null,
          refreshToken: null,
          userId: null,
          orgId: null,
          orgSlug: null,
          email: null,
          role: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: 'dam-auth',
    }
  )
)
